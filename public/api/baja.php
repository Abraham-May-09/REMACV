<?php
/**
 * REMACV · Dejar de recibir correos
 *
 * GET  ?c=correo&t=firma  → página que pide confirmar la baja (así los antivirus
 *                            de correo que abren enlaces no dan de baja a nadie).
 * POST accion=baja|alta    → aplica la baja o la reactivación.
 * POST List-Unsubscribe=One-Click → baja directa desde el botón de Gmail/Outlook.
 */
declare(strict_types=1);
define('REMACV', true);
require __DIR__ . '/_remacv.php';

header('X-Robots-Tag: noindex');
header('Cache-Control: no-store');
header('Referrer-Policy: no-referrer');

$correo = mb_strtolower(limpia($_REQUEST['c'] ?? '', 200));
$firma  = limpia($_REQUEST['t'] ?? '', 64);
$valido = filter_var($correo, FILTER_VALIDATE_EMAIL) && firmaValida($correo, $firma);
$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Botón nativo de Gmail/Outlook (RFC 8058): baja inmediata, sin página.
if ($metodo === 'POST' && ($_POST['List-Unsubscribe'] ?? '') === 'One-Click') {
    if ($valido) cambiarEstado($correo, 'baja');
    http_response_code($valido ? 200 : 400);
    header('Content-Type: text/plain; charset=utf-8');
    echo $valido ? 'ok' : 'enlace no valido';
    exit;
}

header('Content-Type: text/html; charset=utf-8');

$cabecera = '<a class="cabecera" href="' . esc(SITIO) . '"><img src="/assets/correo/encabezado.png" alt="REMACV · Red Mexicana de Análisis de Ciclo de Vida"></a>';
function formulario(string $correo, string $firma, string $accion, string $texto, string $clase = ''): string {
    return '<form method="post" action="/api/baja.php" style="margin:22px 0 0">'
         . '<input type="hidden" name="c" value="' . esc($correo) . '">'
         . '<input type="hidden" name="t" value="' . esc($firma) . '">'
         . '<input type="hidden" name="accion" value="' . esc($accion) . '">'
         . '<button class="btn ' . $clase . '" type="submit">' . esc($texto) . '</button></form>';
}

if (!$valido) {
    http_response_code(400);
    echo paginaHtml('Enlace no válido', '<div class="tarjeta">' . $cabecera . '<div class="cuerpo">'
        . '<p class="ante">Preferencias de correo</p><h1>Este enlace no es válido</h1>'
        . '<p>Puede que esté incompleto. Abre de nuevo el botón <strong>“Dejar de recibir correos”</strong> desde el último correo que te enviamos, '
        . 'o escríbenos a <a href="mailto:contacto@remacv.mx">contacto@remacv.mx</a> y te damos de baja.</p></div></div>');
    exit;
}

if ($metodo === 'POST') {
    $accion = $_POST['accion'] ?? '';
    if ($accion === 'alta') {
        cambiarEstado($correo, 'activo');
        echo paginaHtml('Suscripción reactivada', '<div class="tarjeta">' . $cabecera . '<div class="cuerpo">'
            . '<p class="ante">Preferencias de correo</p><h1>¡Qué gusto!<br><span>Sigues con nosotros.</span></h1>'
            . '<p>Volvimos a activar los correos de la REMACV para <strong>' . esc($correo) . '</strong>.</p>'
            . '<p style="margin:22px 0 0"><a class="btn" href="' . esc(SITIO) . '">Visita el sitio →</a></p></div></div>');
        exit;
    }
    if ($accion === 'baja') {
        cambiarEstado($correo, 'baja');
        echo paginaHtml('Listo', '<div class="tarjeta">' . $cabecera . '<div class="cuerpo">'
            . '<p class="ante">Preferencias de correo</p><h1>Listo, ya no recibirás<br><span>nuestros correos.</span></h1>'
            . '<p>Dimos de baja <strong>' . esc($correo) . '</strong>. Gracias por haber sido parte de la comunidad de la REMACV; '
            . 'las puertas siguen abiertas cuando quieras volver.</p>'
            . '<p class="nota" style="margin:20px 0 0">¿Fue un error?</p>'
            . formulario($correo, $firma, 'alta', 'Volver a suscribirme', 'sec')
            . '</div></div>');
        exit;
    }
}

// GET: pedir confirmación
$yaBaja = estaDeBaja($correo);
echo paginaHtml('Dejar de recibir correos', '<div class="tarjeta">' . $cabecera . '<div class="cuerpo">'
    . '<p class="ante">Preferencias de correo</p>'
    . ($yaBaja
        ? '<h1>Ya no estás recibiendo<br><span>nuestros correos.</span></h1>'
          . '<p><strong>' . esc($correo) . '</strong> ya estaba dado de baja. No te enviaremos más correos.</p>'
          . '<p class="nota" style="margin:20px 0 0">¿Quieres volver a recibirlos?</p>'
          . formulario($correo, $firma, 'alta', 'Volver a suscribirme', 'sec')
        : '<h1>¿Dejar de recibir<br><span>correos de la REMACV?</span></h1>'
          . '<p>Si confirmas, <strong>' . esc($correo) . '</strong> ya no recibirá el boletín ni otros avisos de la red.</p>'
          . formulario($correo, $firma, 'baja', 'Sí, dejar de recibir correos')
          . '<p class="nota" style="margin:18px 0 0">Si llegaste aquí por error, solo cierra esta página.</p>')
    . '</div></div>');
