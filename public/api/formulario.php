<?php
/**
 * REMACV · Formularios del sitio (boletín y membresía)
 *
 * 1. Valida el formulario y descarta spam.
 * 2. Envía el aviso interno con todas las respuestas al equipo REMACV.
 * 3. Envía a la persona un correo de confirmación con diseño:
 *    bienvenida al boletín o acuse de su solicitud de membresía.
 * 4. Registra el envío (y la suscripción) fuera de public_html.
 *
 * Responde {"ok":true} si el aviso interno se entregó al servidor de correo.
 */
declare(strict_types=1);

// ---------------- Configuración ----------------
$EQUIPO = [                       // reciben todas las respuestas
    'contacto@remacv.mx',
    'jyes407@gmail.com',
    // 'apadillar@iingen.unam.mx',   // pendiente de confirmar
];
$REMITENTE        = 'contacto@remacv.mx';
$NOMBRE_REMITENTE = 'REMACV';
$SITIO            = 'https://remacv.mx';
$IMG              = $SITIO . '/assets/correo';
$ORIGENES         = ['https://remacv.mx', 'https://www.remacv.mx'];
$LIMITE_POR_IP    = 5;      // envíos por IP…
$VENTANA_SEG      = 600;    // …cada 10 minutos
$CONFIRMACION_CADA = 43200; // máximo una confirmación por correo cada 12 h

// Carpeta privada (fuera de public_html) para registros.
$DATOS = dirname(__DIR__, 2) . '/remacv-datos';
if (!is_dir($DATOS) && !@mkdir($DATOS, 0750, true)) {
    $DATOS = sys_get_temp_dir() . '/remacv-datos';
    @mkdir($DATOS, 0750, true);
}

// ---------------- Utilidades ----------------
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');
header('Cache-Control: no-store');

function responder(int $codigo, array $datos): void {
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}
function limpia($v, int $max = 2000): string {
    $t = trim((string)($v ?? ''));
    $t = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $t) ?? '';
    return mb_substr($t, 0, $max);
}
function esc(string $t): string {
    return htmlspecialchars($t, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}
function registrar(string $dir, string $archivo, array $fila): void {
    @file_put_contents($dir . '/' . $archivo,
        json_encode($fila, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
}
function primerNombre(string $n): string {
    $p = preg_split('/\s+/', trim($n));
    return $p[0] ?? '';
}

/** Envía un correo HTML + texto (multipart/alternative). */
function enviar(array $para, string $asunto, string $html, string $texto, string $responderA,
                string $remitente, string $nombreRemitente): bool {
    $limite = 'remacv-' . bin2hex(random_bytes(12));
    $encabezados = implode("\r\n", [
        'MIME-Version: 1.0',
        "Content-Type: multipart/alternative; boundary=\"{$limite}\"",
        'From: =?UTF-8?B?' . base64_encode($nombreRemitente) . "?= <{$remitente}>",
        "Reply-To: {$responderA}",
        'X-Mailer: REMACV-sitio',
    ]);
    $cuerpo = "--{$limite}\r\n"
            . "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
            . chunk_split(base64_encode($texto)) . "\r\n"
            . "--{$limite}\r\n"
            . "Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
            . chunk_split(base64_encode($html)) . "\r\n"
            . "--{$limite}--\r\n";
    $asuntoCod = '=?UTF-8?B?' . base64_encode($asunto) . '?=';
    return @mail(implode(', ', $para), $asuntoCod, $cuerpo, $encabezados, '-f' . $remitente);
}

/**
 * Plantilla de correo REMACV: encabezado ambiental con logo, tarjeta blanca
 * y pie verde. Solo tablas y estilos en línea (compatible con Gmail/Outlook).
 */
function plantilla(array $o, string $IMG, string $SITIO): string {
    $boton = '';
    if (!empty($o['boton'])) {
        [$txt, $url] = $o['boton'];
        $boton = '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:30px auto 6px"><tr>'
               . '<td align="center" bgcolor="#1f7a47" style="border-radius:999px">'
               . '<a href="' . esc($url) . '" style="display:inline-block;padding:15px 30px;font:700 13px Arial,Helvetica,sans-serif;'
               . 'letter-spacing:.14em;text-transform:uppercase;color:#ffffff;text-decoration:none;border-radius:999px">'
               . esc($txt) . ' &rarr;</a></td></tr></table>';
    }
    return '<!doctype html><html lang="es"><head><meta charset="utf-8">'
        . '<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light">'
        . '<title>' . esc($o['titulo']) . '</title></head>'
        . '<body style="margin:0;padding:0;background:#e9f1ea">'
        . '<div style="display:none;max-height:0;overflow:hidden;opacity:0">' . esc($o['preencabezado']) . '</div>'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#e9f1ea" style="background:#e9f1ea">'
        . '<tr><td align="center" style="padding:28px 12px">'
        . '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">'

        // Encabezado
        . '<tr><td style="border-radius:18px 18px 0 0;overflow:hidden;background:#0f3a23">'
        . '<a href="' . esc($SITIO) . '"><img src="' . esc($IMG) . '/encabezado.png" width="600" alt="REMACV · Red Mexicana de Análisis de Ciclo de Vida" '
        . 'style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:18px 18px 0 0"></a></td></tr>'

        // Cuerpo
        . '<tr><td bgcolor="#ffffff" style="background:#ffffff;padding:40px 44px 36px">'
        . '<p style="margin:0 0 12px;font:700 11px Arial,Helvetica,sans-serif;letter-spacing:.24em;text-transform:uppercase;color:#3fa15e">'
        . esc($o['antetitulo']) . '</p>'
        . '<h1 style="margin:0 0 18px;font:800 28px/1.2 Arial,Helvetica,sans-serif;color:#0a1a12;letter-spacing:-.4px">'
        . $o['titulo_html'] . '</h1>'
        . '<div style="font:16px/1.7 Arial,Helvetica,sans-serif;color:#33463c">' . $o['cuerpo'] . '</div>'
        . $boton
        . '<p style="margin:30px 0 0;text-align:center"><img src="' . esc($IMG) . '/separador.png" width="120" height="20" alt="" style="border:0"></p>'
        . '<p style="margin:16px 0 0;font:15px/1.6 Arial,Helvetica,sans-serif;color:#33463c;text-align:center">'
        . 'Con gusto,<br><strong style="color:#134d33">Red Mexicana de Análisis de Ciclo de Vida</strong></p>'
        . '</td></tr>'

        // Pie
        . '<tr><td bgcolor="#0f3a23" style="background:#0f3a23;border-radius:0 0 18px 18px;padding:30px 44px 32px" align="center">'
        . '<a href="' . esc($SITIO) . '"><img src="' . esc($IMG) . '/logo-blanco.png" width="240" alt="REMACV" style="display:block;border:0;margin:0 auto 20px;width:240px;height:auto"></a>'
        . '<p style="margin:0 0 14px;font:13px/1.6 Arial,Helvetica,sans-serif;color:#cfe5d6">'
        . '<a href="' . esc($SITIO) . '/eventos" style="color:#9cd3ac;text-decoration:none">Eventos</a> &nbsp;·&nbsp; '
        . '<a href="' . esc($SITIO) . '/publicaciones" style="color:#9cd3ac;text-decoration:none">Publicaciones</a> &nbsp;·&nbsp; '
        . '<a href="' . esc($SITIO) . '/miembros" style="color:#9cd3ac;text-decoration:none">Miembros</a> &nbsp;·&nbsp; '
        . '<a href="mailto:contacto@remacv.mx" style="color:#9cd3ac;text-decoration:none">contacto@remacv.mx</a></p>'
        . '<p style="margin:0;font:11.5px/1.6 Arial,Helvetica,sans-serif;color:#8fb39b">' . $o['nota_pie'] . '</p>'
        . '</td></tr>'

        . '</table></td></tr></table></body></html>';
}

function filaDato(string $k, string $v): string {
    if ($v === '') return '';
    return '<tr><td style="padding:11px 14px 11px 0;border-bottom:1px solid #e3ece5;font:700 11px Arial,Helvetica,sans-serif;'
         . 'letter-spacing:.12em;text-transform:uppercase;color:#3fa15e;vertical-align:top;white-space:nowrap">' . esc($k) . '</td>'
         . '<td style="padding:11px 0;border-bottom:1px solid #e3ece5;font:15px/1.55 Arial,Helvetica,sans-serif;color:#0a1a12">'
         . nl2br(esc($v)) . '</td></tr>';
}
function tablaDatos(array $filas): string {
    $html = '';
    foreach ($filas as $k => $v) $html .= filaDato($k, $v);
    return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" '
         . 'style="margin:22px 0 4px;background:#f5f9f5;border-radius:12px;border:1px solid #e3ece5">'
         . '<tr><td style="padding:6px 20px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">'
         . $html . '</table></td></tr></table>';
}
function vineta(string $IMG, string $titulo, string $texto): string {
    return '<tr><td width="34" valign="top" style="padding:12px 12px 0 0"><img src="' . esc($IMG) . '/hoja.png" width="22" height="22" alt="" style="display:block;border:0"></td>'
         . '<td valign="top" style="padding:10px 0 0;font:15px/1.6 Arial,Helvetica,sans-serif;color:#33463c">'
         . '<strong style="color:#0a1a12">' . esc($titulo) . '</strong><br>' . esc($texto) . '</td></tr>';
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
$correo = limpia($b['correo'] ?? '', 200);
$trampa = limpia($b['website'] ?? '', 200);
$ip     = $_SERVER['REMOTE_ADDR'] ?? 'desconocida';
$ahora  = time();

// Bots que llenan el campo oculto: se responde "ok" sin enviar nada.
if ($trampa !== '') {
    registrar($DATOS, 'formularios.log', ['t' => date('c'), 'ip' => $ip, 'resultado' => 'descartado-trampa']);
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
$fecha       = (new DateTime('now', new DateTimeZone('America/Mexico_City')))->format('d/m/Y H:i');
$pagina      = limpia($b['pagina'] ?? '', 300);
$nombre      = limpia($b['nombre'] ?? '', 200);
$institucion = limpia($b['institucion'] ?? '', 300);
$mensaje     = limpia($b['mensaje'] ?? '', 3000);
$esMembresia = $tipo === 'membresia';
$nombreCorto = primerNombre($nombre);

// ¿Ya se le envió confirmación hace poco? (evita usar el formulario para molestar a terceros)
$archivoConf = $DATOS . '/confirmacion-' . hash('sha256', strtolower($correo) . '|' . $tipo) . '.txt';
$puedeConfirmar = !is_file($archivoConf) || ($ahora - (int)@file_get_contents($archivoConf)) > $CONFIRMACION_CADA;

// ---------------- 1. Aviso interno ----------------
$datosAviso = $esMembresia
    ? ['Nombre' => $nombre, 'Correo' => $correo, 'Institución' => $institucion, 'Motivo' => $mensaje]
    : ['Correo' => $correo];
$datosAviso += ['Fecha' => $fecha, 'Página' => $pagina];

$asuntoAviso = $esMembresia
    ? 'Nueva solicitud de membresía · ' . ($nombre !== '' ? $nombre : $correo)
    : 'Nueva suscripción al boletín · ' . $correo;

$htmlAviso = plantilla([
    'preencabezado' => $asuntoAviso,
    'antetitulo'    => $esMembresia ? 'Formulario de membresía' : 'Boletín',
    'titulo'        => $asuntoAviso,
    'titulo_html'   => $esMembresia ? 'Nueva solicitud de membresía' : 'Nueva suscripción al boletín',
    'cuerpo'        => '<p style="margin:0">Se recibió un nuevo registro desde el sitio web.</p>'
                     . tablaDatos($datosAviso)
                     . '<p style="margin:18px 0 0;font-size:14px;color:#5b6c61">'
                     . ($puedeConfirmar ? 'Se le envió a ' . esc($correo) . ' un correo de confirmación.'
                                        : 'No se reenvió confirmación: ya se le había enviado una en las últimas horas.')
                     . ' Responde a este correo para contestarle directamente.</p>',
    'boton'         => null,
    'nota_pie'      => 'Aviso automático del sitio remacv.mx.',
], $IMG, $SITIO);

$textoAviso = $asuntoAviso . "\n\n";
foreach ($datosAviso as $k => $v) if ($v !== '') $textoAviso .= "{$k}: {$v}\n";

$avisoOk = enviar($EQUIPO, $asuntoAviso, $htmlAviso, $textoAviso, $correo, $REMITENTE, $NOMBRE_REMITENTE);

// ---------------- 2. Confirmación a la persona ----------------
$confOk = null;
if ($avisoOk && $puedeConfirmar) {
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
          . vineta($IMG, 'Revisamos tu solicitud', 'Nuestro equipo la leerá con atención.')
          . vineta($IMG, 'Te contactamos', 'Te escribiremos muy pronto a este correo con los siguientes pasos.')
          . vineta($IMG, 'Mientras tanto', 'Conoce a los miembros, los eventos y las publicaciones de la red.')
          . '</table>';
        $tituloHtml = $saludo . '<br><span style="color:#1f7a47">Recibimos tu solicitud.</span>';
        $boton = ['Conoce la red', $SITIO . '/miembros'];
        $textoConf = "{$asuntoConf}\n\nRecibimos tu solicitud para formar parte de la REMACV. "
                   . "Nuestro equipo la revisará y te contactaremos muy pronto a este correo.\n\n"
                   . "Nombre: {$nombre}\nInstitución: {$institucion}\n\n{$SITIO}";
    } else {
        $asuntoConf = '¡Te damos la bienvenida a la REMACV! 🌿';
        $cuerpoConf =
            '<p style="margin:0 0 14px">Gracias por suscribirte al boletín de la <strong style="color:#134d33">Red Mexicana de Análisis de Ciclo de Vida</strong>. '
          . 'A partir de ahora formas parte de una comunidad que trabaja para que las decisiones en México se tomen con un enfoque de ciclo de vida.</p>'
          . '<p style="margin:0 0 4px">Te escribiremos a <strong>' . esc($correo) . '</strong> para compartirte:</p>'
          . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">'
          . vineta($IMG, 'Eventos y seminarios', 'Fechas de encuentros, congresos y webinars de ACV.')
          . vineta($IMG, 'Publicaciones', 'Investigación, artículos y recursos de la comunidad.')
          . vineta($IMG, 'Convocatorias', 'Oportunidades para participar, colaborar y formarte.')
          . '</table>';
        $tituloHtml = '¡Te damos la bienvenida<br><span style="color:#1f7a47">a la REMACV!</span>';
        $boton = ['Visita el sitio', $SITIO];
        $textoConf = "¡Te damos la bienvenida a la REMACV!\n\nGracias por suscribirte al boletín de la Red Mexicana de "
                   . "Análisis de Ciclo de Vida. Te escribiremos para compartirte eventos, publicaciones y convocatorias.\n\n{$SITIO}";
    }

    $htmlConf = plantilla([
        'preencabezado' => $esMembresia ? 'Gracias por tu interés en formar parte de la red.' : 'Gracias por suscribirte al boletín de la red.',
        'antetitulo'    => $esMembresia ? 'Solicitud de membresía' : 'Boletín REMACV',
        'titulo'        => $asuntoConf,
        'titulo_html'   => $tituloHtml,
        'cuerpo'        => $cuerpoConf,
        'boton'         => $boton,
        'nota_pie'      => 'Recibiste este correo porque se registró ' . esc($correo) . ' en remacv.mx. '
                         . 'Si no fuiste tú, ignora este mensaje'
                         . ($esMembresia ? '.' : ' o escríbenos a contacto@remacv.mx para darte de baja.'),
    ], $IMG, $SITIO);

    $confOk = enviar([$correo], $asuntoConf, $htmlConf, $textoConf, $REMITENTE, $REMITENTE, $NOMBRE_REMITENTE);
    if ($confOk) @file_put_contents($archivoConf, (string)$ahora, LOCK_EX);
}

// ---------------- 3. Registro ----------------
registrar($DATOS, 'formularios.log', [
    't' => date('c'), 'ip' => $ip, 'tipo' => $tipo, 'correo' => $correo,
    'aviso' => $avisoOk ? 'enviado' : 'error',
    'confirmacion' => $confOk === null ? 'omitida' : ($confOk ? 'enviada' : 'error'),
]);
if ($avisoOk) {
    registrar($DATOS, $esMembresia ? 'solicitudes.jsonl' : 'suscriptores.jsonl', array_filter([
        'fecha' => $fecha, 'correo' => $correo, 'nombre' => $nombre, 'institucion' => $institucion, 'motivo' => $mensaje,
    ], fn($v) => $v !== ''));
}

if (!$avisoOk) {
    responder(500, ['ok' => false, 'error' => 'envio']);
}
responder(200, ['ok' => true]);
