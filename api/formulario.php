<?php
/**
 * REMACV · Formularios del sitio (boletín y membresía)
 *
 * 1. Valida el formulario y descarta spam.
 * 2. Guarda el registro en la base de datos (suscriptores / membresias).
 * 3. Envía el aviso interno con todas las respuestas al equipo REMACV.
 * 4. Envía a la persona un correo de confirmación con diseño (bienvenida al
 *    boletín o acuse de su solicitud), con botón para dejar de recibir correos.
 *
 * Responde {"ok":true} si el registro se guardó o el aviso se entregó.
 */
declare(strict_types=1);
define('REMACV', true);
require __DIR__ . '/_remacv.php';

$ORIGENES          = ['https://remacv.mx', 'https://www.remacv.mx'];
$LIMITE_POR_IP     = 5;      // envíos por IP…
$VENTANA_SEG       = 600;    // …cada 10 minutos
$CONFIRMACION_CADA = 43200;  // máximo una confirmación por correo cada 12 h

header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');
header('Cache-Control: no-store');

function responder(int $codigo, array $datos): void {
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

// ---------------- Petición ----------------
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    responder(405, ['ok' => false, 'error' => 'metodo']);
}
$origen = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origen !== '' && !in_array($origen, $ORIGENES, true)) {
    responder(403, ['ok' => false, 'error' => 'origen']);
}

$crudo = file_get_contents('php://input', false, null, 0, 20000) ?: '';
$b = json_decode($crudo, true);
if (!is_array($b)) {
    responder(400, ['ok' => false, 'error' => 'formato']);
}

$tipo   = limpia($b['tipo'] ?? '', 20);
$correo = mb_strtolower(limpia($b['correo'] ?? '', 200));
$trampa = limpia($b['website'] ?? '', 200);
$ip     = $_SERVER['REMOTE_ADDR'] ?? 'desconocida';
$ahora  = time();
$DATOS  = carpetaDatos();

// Bots que llenan el campo oculto: se responde "ok" sin enviar nada.
if ($trampa !== '') {
    registrar('formularios.log', ['t' => date('c'), 'ip' => $ip, 'resultado' => 'descartado-trampa']);
    responder(200, ['ok' => true]);
}
if (!in_array($tipo, ['suscripcion', 'membresia'], true)
    || !filter_var($correo, FILTER_VALIDATE_EMAIL)
    || preg_match('/[\r\n]/', $correo)) {
    responder(422, ['ok' => false, 'error' => 'datos']);
}

// Límite de envíos por IP
$archivoIp = $DATOS . '/limite-' . hash('sha256', $ip) . '.json';
$marcas = [];
if (is_file($archivoIp)) {
    $marcas = array_filter((array)json_decode((string)@file_get_contents($archivoIp), true),
        fn($t) => is_int($t) && $t > $ahora - $VENTANA_SEG);
}
if (count($marcas) >= $LIMITE_POR_IP) {
    responder(429, ['ok' => false, 'error' => 'limite']);
}
$marcas[] = $ahora;
@file_put_contents($archivoIp, json_encode(array_values($marcas)), LOCK_EX);

// ---------------- Datos ----------------
$fecha       = ahoraLocal('d/m/Y H:i');
$fechaBd     = ahoraLocal();
$pagina      = limpia($b['pagina'] ?? '', 300);
$nombre      = limpia($b['nombre'] ?? '', 200);
$institucion = limpia($b['institucion'] ?? '', 300);
$mensaje     = limpia($b['mensaje'] ?? '', 3000);
$esMembresia = $tipo === 'membresia';
$nombreCorto = primerNombre($nombre);

// ---------------- 1. Base de datos ----------------
$guardado = false;
$situacion = '';            // para el aviso interno (boletín)
try {
    if ($p = bd()) {
        if ($esMembresia) {
            $p->prepare('INSERT INTO membresias (fecha, nombre, correo, institucion, motivo, pagina, ip) VALUES (?, ?, ?, ?, ?, ?, ?)')
              ->execute([$fechaBd, $nombre, $correo, $institucion, $mensaje, $pagina, $ip]);
        } else {
            $q = $p->prepare('SELECT estado FROM suscriptores WHERE correo = ?');
            $q->execute([$correo]);
            $previo = $q->fetchColumn();
            if ($previo === false) {
                $p->prepare('INSERT INTO suscriptores (correo, estado, alta, actualizado, pagina, ip) VALUES (?, \'activo\', ?, ?, ?, ?)')
                  ->execute([$correo, $fechaBd, $fechaBd, $pagina, $ip]);
                $situacion = 'nuevo';
            } else {
                $p->prepare('UPDATE suscriptores SET estado = \'activo\', baja = NULL, actualizado = ?, veces = veces + 1, pagina = ?, ip = ? WHERE correo = ?')
                  ->execute([$fechaBd, $pagina, $ip, $correo]);
                $situacion = $previo === 'baja' ? 'reactivado' : 'repetido';
            }
        }
        $guardado = true;
    }
} catch (Throwable $e) {
    registrar('errores.log', ['t' => date('c'), 'formulario' => $e->getMessage()]);
}
// Copia de respaldo en texto (por si la base de datos no está disponible)
registrar($esMembresia ? 'solicitudes.jsonl' : 'suscriptores.jsonl', array_filter([
    'fecha' => $fecha, 'correo' => $correo, 'nombre' => $nombre, 'institucion' => $institucion, 'motivo' => $mensaje,
], fn($v) => $v !== ''));

// ¿Ya se le envió confirmación hace poco? (evita usar el formulario para molestar a terceros)
$archivoConf = $DATOS . '/confirmacion-' . hash('sha256', $correo . '|' . $tipo) . '.txt';
$puedeConfirmar = !is_file($archivoConf) || ($ahora - (int)@file_get_contents($archivoConf)) > $CONFIRMACION_CADA;

// ---------------- 2. Aviso interno ----------------
$datosAviso = $esMembresia
    ? ['Nombre' => $nombre, 'Correo' => $correo, 'Institución' => $institucion, 'Motivo' => $mensaje]
    : ['Correo' => $correo];
$datosAviso += ['Fecha' => $fecha, 'Página' => $pagina];
if (!$esMembresia && $situacion === 'repetido')   $datosAviso['Nota'] = 'Ya estaba suscrito al boletín.';
if (!$esMembresia && $situacion === 'reactivado') $datosAviso['Nota'] = 'Se había dado de baja y volvió a suscribirse.';

$asuntoAviso = $esMembresia
    ? 'Nueva solicitud de membresía · ' . ($nombre !== '' ? $nombre : $correo)
    : 'Nueva suscripción al boletín · ' . $correo;

$htmlAviso = plantilla([
    'preencabezado' => $asuntoAviso,
    'antetitulo'    => $esMembresia ? 'Formulario de membresía' : 'Boletín',
    'titulo'        => $asuntoAviso,
    'titulo_html'   => $esMembresia ? 'Nueva solicitud de membresía' : 'Nueva suscripción al boletín',
    'cuerpo'        => '<p style="margin:0">Se recibió un nuevo registro desde el sitio web'
                     . ($guardado ? ' y quedó guardado en la base de datos.' : '.') . '</p>'
                     . tablaDatos($datosAviso)
                     . '<p style="margin:18px 0 0;font-size:14px;color:#5b6c61">'
                     . ($puedeConfirmar ? 'Se le envió a ' . esc($correo) . ' un correo de confirmación.'
                                        : 'No se reenvió confirmación: ya se le había enviado una en las últimas horas.')
                     . ' Responde a este correo para contestarle directamente.</p>',
    'boton'         => ['Ver registros', SITIO . '/api/registros.php?seccion=' . ($esMembresia ? 'membresias' : 'boletin')],
    'nota_pie'      => 'Aviso automático del sitio remacv.mx.',
]);

$textoAviso = $asuntoAviso . "\n\n";
foreach ($datosAviso as $k => $v) if ($v !== '') $textoAviso .= "{$k}: {$v}\n";

$avisoOk = enviar(EQUIPO, $asuntoAviso, $htmlAviso, $textoAviso, $correo);

// ---------------- 3. Confirmación a la persona ----------------
$confOk = null;
if (($avisoOk || $guardado) && $puedeConfirmar) {
    $urlBaja = urlBaja($correo);
    if ($esMembresia) {
        $asuntoConf = 'Recibimos tu solicitud de membresía · REMACV';
        $saludo = $nombreCorto !== '' ? '¡Gracias, ' . esc($nombreCorto) . '!' : '¡Gracias por tu interés!';
        $cuerpoConf =
            '<p style="margin:0 0 14px">Recibimos tu solicitud para formar parte de la <strong style="color:#134d33">Red Mexicana de Análisis de Ciclo de Vida</strong>. '
          . 'Nos da mucho gusto que quieras sumarte a la comunidad que impulsa el pensamiento de ciclo de vida en México.</p>'
          . '<p style="margin:0">Estos son los datos que nos compartiste:</p>'
          . tablaDatos(['Nombre' => $nombre, 'Correo' => $correo, 'Institución' => $institucion, 'Motivo' => $mensaje])
          . '<p style="margin:26px 0 4px;font:700 11px Arial,Helvetica,sans-serif;letter-spacing:.24em;text-transform:uppercase;color:#3fa15e">¿Qué sigue?</p>'
          . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">'
          . vineta('Revisamos tu solicitud', 'Nuestro equipo la leerá con atención.')
          . vineta('Te contactamos', 'Te escribiremos muy pronto a este correo con los siguientes pasos.')
          . vineta('Mientras tanto', 'Conoce a los miembros, los eventos y las publicaciones de la red.')
          . '</table>';
        $tituloHtml = $saludo . '<br><span style="color:#1f7a47">Recibimos tu solicitud.</span>';
        $boton = ['Conoce la red', SITIO . '/miembros'];
        $textoConf = "{$asuntoConf}\n\nRecibimos tu solicitud para formar parte de la REMACV. "
                   . "Nuestro equipo la revisará y te contactaremos muy pronto a este correo.\n\n"
                   . "Nombre: {$nombre}\nInstitución: {$institucion}\n\n" . SITIO
                   . "\n\nPara dejar de recibir correos: {$urlBaja}";
    } else {
        $asuntoConf = '¡Te damos la bienvenida a la REMACV! 🌿';
        $cuerpoConf =
            '<p style="margin:0 0 14px">Gracias por suscribirte al boletín de la <strong style="color:#134d33">Red Mexicana de Análisis de Ciclo de Vida</strong>. '
          . 'A partir de ahora formas parte de una comunidad que trabaja para que las decisiones en México se tomen con un enfoque de ciclo de vida.</p>'
          . '<p style="margin:0 0 4px">Te escribiremos a <strong>' . esc($correo) . '</strong> para compartirte:</p>'
          . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">'
          . vineta('Eventos y seminarios', 'Fechas de encuentros, congresos y webinars de ACV.')
          . vineta('Publicaciones', 'Investigación, artículos y recursos de la comunidad.')
          . vineta('Convocatorias', 'Oportunidades para participar, colaborar y formarte.')
          . '</table>';
        $tituloHtml = '¡Te damos la bienvenida<br><span style="color:#1f7a47">a la REMACV!</span>';
        $boton = ['Visita el sitio', SITIO];
        $textoConf = "¡Te damos la bienvenida a la REMACV!\n\nGracias por suscribirte al boletín de la Red Mexicana de "
                   . "Análisis de Ciclo de Vida. Te escribiremos para compartirte eventos, publicaciones y convocatorias.\n\n" . SITIO
                   . "\n\nPara dejar de recibir correos: {$urlBaja}";
    }

    $htmlConf = plantilla([
        'preencabezado' => $esMembresia ? 'Gracias por tu interés en formar parte de la red.' : 'Gracias por suscribirte al boletín de la red.',
        'antetitulo'    => $esMembresia ? 'Solicitud de membresía' : 'Boletín REMACV',
        'titulo'        => $asuntoConf,
        'titulo_html'   => $tituloHtml,
        'cuerpo'        => $cuerpoConf,
        'boton'         => $boton,
        'nota_pie'      => 'Recibiste este correo porque se registró ' . esc($correo) . ' en remacv.mx. '
                         . 'Si no fuiste tú o ya no quieres recibir nuestros correos, usa el botón de abajo.',
        'baja'          => $urlBaja,
    ]);

    $confOk = enviar([$correo], $asuntoConf, $htmlConf, $textoConf, REMITENTE, encabezadosBaja($correo));
    if ($confOk) @file_put_contents($archivoConf, (string)$ahora, LOCK_EX);
}

// ---------------- 4. Registro de envíos ----------------
registrar('formularios.log', [
    't' => date('c'), 'ip' => $ip, 'tipo' => $tipo, 'correo' => $correo,
    'bd' => $guardado ? 'guardado' : 'no',
    'aviso' => $avisoOk ? 'enviado' : 'error',
    'confirmacion' => $confOk === null ? 'omitida' : ($confOk ? 'enviada' : 'error'),
]);

if (!$avisoOk && !$guardado) {
    responder(500, ['ok' => false, 'error' => 'envio']);
}
responder(200, ['ok' => true]);
