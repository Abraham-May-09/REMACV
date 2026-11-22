<?php
/**
 * REMACV · Formularios del sitio (boletín y membresía)
 *
 * Recibe el formulario en JSON, valida, descarta spam y envía un correo
 * desde contacto@remacv.mx a los destinatarios configurados.
 * Responde {"ok":true} solo si el correo se entregó al servidor de correo.
 */
declare(strict_types=1);

// ---------------- Configuración ----------------
$DESTINATARIOS = [
    'jyes407@gmail.com',
    // 'apadillar@iingen.unam.mx',   // pendiente de confirmar
];
$REMITENTE        = 'contacto@remacv.mx';
$NOMBRE_REMITENTE = 'REMACV';
$ORIGENES         = ['https://remacv.mx', 'https://www.remacv.mx'];
$LIMITE_POR_IP    = 5;      // envíos permitidos…
$VENTANA_SEG      = 600;    // …cada 10 minutos

// Carpeta privada (fuera de public_html) para el registro y el límite de envíos.
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
function registrar(string $dir, array $fila): void {
    @file_put_contents($dir . '/formularios.log',
        json_encode($fila, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
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
    registrar($DATOS, ['t' => date('c'), 'ip' => $ip, 'resultado' => 'descartado-trampa']);
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

// ---------------- Correo ----------------
$fecha  = (new DateTime('now', new DateTimeZone('America/Mexico_City')))->format('d/m/Y H:i');
$pagina = limpia($b['pagina'] ?? '', 300);

$fila = function (string $k, string $v): string {
    if ($v === '') return '';
    return '<tr><td style="padding:8px 14px 8px 0;color:#5b6c61;font:600 12px Arial;'
         . 'text-transform:uppercase;letter-spacing:.08em;vertical-align:top;white-space:nowrap">'
         . esc($k) . '</td><td style="padding:8px 0;font:15px Arial;color:#0a1a12">'
         . nl2br(esc($v)) . '</td></tr>';
};

if ($tipo === 'membresia') {
    $nombre = limpia($b['nombre'] ?? '', 200);
    $asunto = 'Nueva solicitud de membresía · ' . ($nombre !== '' ? $nombre : $correo);
    $titulo = 'Nueva solicitud de membresía';
    $filas  = $fila('Nombre', $nombre) . $fila('Correo', $correo)
            . $fila('Institución', limpia($b['institucion'] ?? '', 300))
            . $fila('Motivo', limpia($b['mensaje'] ?? '', 3000));
} else {
    $asunto = 'Nueva suscripción al boletín · ' . $correo;
    $titulo = 'Nueva suscripción al boletín';
    $filas  = $fila('Correo', $correo);
}
$filas .= $fila('Fecha', $fecha) . $fila('Página', $pagina);

$html = '<!doctype html><html><body style="margin:0;padding:24px;background:#f4f1ea">'
      . '<div style="max-width:560px;margin:0 auto;font-family:Arial,sans-serif">'
      . '<div style="background:#0f3a23;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0">'
      . '<div style="font:700 11px Arial;letter-spacing:.2em;text-transform:uppercase;color:#8fbf9e">REMACV · Sitio web</div>'
      . '<div style="font:700 20px Arial;margin-top:6px">' . esc($titulo) . '</div></div>'
      . '<div style="background:#fff;border:1px solid #e3e8e4;border-top:0;padding:18px 24px;border-radius:0 0 8px 8px">'
      . '<table style="border-collapse:collapse;width:100%">' . $filas . '</table>'
      . '<p style="font:12px Arial;color:#738a7e;margin-top:18px">Responde a este correo para contestarle directamente a '
      . esc($correo) . '.</p></div></div></body></html>';

$encabezados = implode("\r\n", [
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'From: =?UTF-8?B?' . base64_encode($NOMBRE_REMITENTE) . "?= <{$REMITENTE}>",
    "Reply-To: {$correo}",
    'X-Mailer: REMACV-sitio',
]);
$asuntoCod = '=?UTF-8?B?' . base64_encode($asunto) . '?=';

$enviado = @mail(implode(', ', $DESTINATARIOS), $asuntoCod, $html, $encabezados, '-f' . $REMITENTE);

registrar($DATOS, [
    't' => date('c'), 'ip' => $ip, 'tipo' => $tipo, 'correo' => $correo,
    'resultado' => $enviado ? 'enviado' : 'error-envio',
]);

if (!$enviado) {
    responder(500, ['ok' => false, 'error' => 'envio']);
}
responder(200, ['ok' => true]);
