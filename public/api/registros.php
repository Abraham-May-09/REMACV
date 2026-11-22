<?php
/**
 * REMACV · Panel de registros (boletín y membresías)
 *
 * La primera vez pide crear una contraseña; después pide iniciar sesión.
 * Muestra los suscriptores del boletín y las solicitudes de membresía,
 * con búsqueda, filtro por estado y descarga en CSV (abre en Excel).
 */
declare(strict_types=1);
define('REMACV', true);
require __DIR__ . '/_remacv.php';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
header('Referrer-Policy: same-origin');
header('X-Frame-Options: DENY');

$https = ($_SERVER['HTTPS'] ?? '') === 'on' || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
session_name('remacv_panel');
session_set_cookie_params(['lifetime' => 0, 'path' => '/api/', 'secure' => $https, 'httponly' => true, 'samesite' => 'Strict']);
session_start();

$ARCHIVO_CLAVE = carpetaDatos() . '/panel.json';
$INACTIVIDAD   = 8 * 3600;
$YO            = '/api/registros.php';

if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16));
$csrf = $_SESSION['csrf'];
$csrfOk = fn(): bool => hash_equals($csrf, (string)($_POST['csrf'] ?? ''));
$campoCsrf = '<input type="hidden" name="csrf" value="' . esc($csrf) . '">';
$cabecera = '<a class="cabecera" href="' . esc(SITIO) . '"><img src="/assets/correo/encabezado.png" alt="REMACV"></a>';

function pantallaAcceso(string $cabecera, string $titulo, string $html): void {
    header('Content-Type: text/html; charset=utf-8');
    echo paginaHtml($titulo, '<div class="tarjeta">' . $cabecera . '<div class="cuerpo">' . $html . '</div></div>');
    exit;
}

// ---------- Límite de intentos de acceso ----------
$ip = $_SERVER['REMOTE_ADDR'] ?? 'desconocida';
$archivoIntentos = carpetaDatos() . '/panel-intentos-' . hash('sha256', $ip) . '.json';
$intentos = is_file($archivoIntentos)
    ? array_filter((array)json_decode((string)@file_get_contents($archivoIntentos), true), fn($t) => is_int($t) && $t > time() - 900)
    : [];

// ---------- Cerrar sesión ----------
if (isset($_GET['salir'])) {
    $_SESSION = [];
    session_destroy();
    header('Location: ' . $YO);
    exit;
}

// ---------- Crear contraseña (primera vez) ----------
if (!is_file($ARCHIVO_CLAVE)) {
    $error = '';
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && $csrfOk()) {
        $c1 = (string)($_POST['clave'] ?? '');
        $c2 = (string)($_POST['clave2'] ?? '');
        if (mb_strlen($c1) < 10)      $error = 'La contraseña debe tener al menos 10 caracteres.';
        elseif ($c1 !== $c2)          $error = 'Las contraseñas no coinciden.';
        else {
            @file_put_contents($ARCHIVO_CLAVE, json_encode(['hash' => password_hash($c1, PASSWORD_DEFAULT), 'creada' => ahoraLocal()]), LOCK_EX);
            @chmod($ARCHIVO_CLAVE, 0600);
            session_regenerate_id(true);
            $_SESSION['dentro'] = time();
            header('Location: ' . $YO);
            exit;
        }
    }
    pantallaAcceso($cabecera, 'Crear contraseña',
        '<p class="ante">Panel de registros</p><h1>Crea la contraseña<br><span>del panel</span></h1>'
        . '<p class="nota">Solo se pide una vez. Con ella entrarás a ver y descargar los registros del boletín y de membresías.</p>'
        . ($error ? '<p class="alerta">' . esc($error) . '</p>' : '')
        . '<form method="post">' . $campoCsrf
        . '<label for="clave">Contraseña (mínimo 10 caracteres)</label><input id="clave" type="password" name="clave" autocomplete="new-password" required minlength="10">'
        . '<label for="clave2">Repite la contraseña</label><input id="clave2" type="password" name="clave2" autocomplete="new-password" required minlength="10">'
        . '<p style="margin:22px 0 0"><button class="btn" type="submit">Guardar y entrar</button></p></form>');
}

// ---------- Iniciar sesión ----------
$dentro = isset($_SESSION['dentro']) && (time() - (int)$_SESSION['dentro']) < $INACTIVIDAD;
if (!$dentro) {
    $error = '';
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && $csrfOk()) {
        if (count($intentos) >= 5) {
            $error = 'Demasiados intentos. Espera 15 minutos e inténtalo de nuevo.';
        } else {
            $guardada = json_decode((string)@file_get_contents($ARCHIVO_CLAVE), true);
            if (is_array($guardada) && password_verify((string)($_POST['clave'] ?? ''), (string)($guardada['hash'] ?? ''))) {
                @unlink($archivoIntentos);
                session_regenerate_id(true);
                $_SESSION['dentro'] = time();
                header('Location: ' . $YO . (isset($_GET['seccion']) ? '?seccion=' . rawurlencode((string)$_GET['seccion']) : ''));
                exit;
            }
            $intentos[] = time();
            @file_put_contents($archivoIntentos, json_encode(array_values($intentos)), LOCK_EX);
            $error = 'Contraseña incorrecta.';
        }
    }
    pantallaAcceso($cabecera, 'Iniciar sesión',
        '<p class="ante">Panel de registros</p><h1>Registros<br><span>de la REMACV</span></h1>'
        . ($error ? '<p class="alerta">' . esc($error) . '</p>' : '')
        . '<form method="post">' . $campoCsrf
        . '<label for="clave">Contraseña</label><input id="clave" type="password" name="clave" autocomplete="current-password" required autofocus>'
        . '<p style="margin:22px 0 0"><button class="btn" type="submit">Entrar</button></p></form>');
}
$_SESSION['dentro'] = time();

// ---------- Datos ----------
$p = bd();
if (!$p) {
    pantallaAcceso($cabecera, 'Base de datos no disponible',
        '<p class="ante">Panel de registros</p><h1>No se pudo abrir<br><span>la base de datos</span></h1>'
        . '<p>Los registros siguen guardándose como respaldo en la carpeta <code>remacv-datos</code> del hosting.</p>');
}

$seccion = ($_GET['seccion'] ?? 'boletin') === 'membresias' ? 'membresias' : 'boletin';
$q       = limpia($_GET['q'] ?? '', 120);
$estado  = in_array($_GET['estado'] ?? '', ['activo', 'baja'], true) ? $_GET['estado'] : '';
$aviso   = '';

// Dar de baja / reactivar manualmente (por ejemplo, si alguien lo pide por correo)
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && $csrfOk() && $seccion === 'boletin') {
    $c = mb_strtolower(limpia($_POST['correo'] ?? '', 200));
    $nuevo = ($_POST['accion'] ?? '') === 'alta' ? 'activo' : 'baja';
    if (filter_var($c, FILTER_VALIDATE_EMAIL)) {
        cambiarEstado($c, $nuevo);
        $aviso = $nuevo === 'baja' ? esc($c) . ' quedó dado de baja.' : esc($c) . ' volvió a estar activo.';
    }
}

$like = '%' . $q . '%';
if ($seccion === 'boletin') {
    $sql = 'SELECT correo, estado, alta, actualizado, baja, veces, pagina FROM suscriptores WHERE correo LIKE ?'
         . ($estado ? ' AND estado = ?' : '') . ' ORDER BY alta DESC';
    $st = $p->prepare($sql);
    $st->execute($estado ? [$like, $estado] : [$like]);
} else {
    $st = $p->prepare('SELECT fecha, nombre, correo, institucion, motivo, pagina FROM membresias
                       WHERE nombre LIKE ? OR correo LIKE ? OR institucion LIKE ? OR motivo LIKE ? ORDER BY fecha DESC');
    $st->execute([$like, $like, $like, $like]);
}
$filas = $st->fetchAll();

// ---------- Descarga CSV ----------
if (($_GET['exportar'] ?? '') === 'csv') {
    $nombreArchivo = 'remacv-' . ($seccion === 'boletin' ? 'boletin' : 'membresias') . '-' . ahoraLocal('Y-m-d') . '.csv';
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $nombreArchivo . '"');
    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF"); // para que Excel respete los acentos
    $enc = $seccion === 'boletin'
        ? ['Correo', 'Estado', 'Fecha de suscripción', 'Último movimiento', 'Fecha de baja', 'Veces registrado', 'Página']
        : ['Fecha', 'Nombre', 'Correo', 'Institución', 'Motivo', 'Página'];
    fputcsv($out, $enc);
    foreach ($filas as $f) {
        // evita que Excel interprete fórmulas
        fputcsv($out, array_map(fn($v) => preg_match('/^[=+\-@]/', (string)$v) ? "'" . $v : (string)$v, array_values($f)));
    }
    fclose($out);
    exit;
}

$tot = $p->query("SELECT
    (SELECT COUNT(*) FROM suscriptores WHERE estado = 'activo') AS activos,
    (SELECT COUNT(*) FROM suscriptores WHERE estado = 'baja')   AS bajas,
    (SELECT COUNT(*) FROM membresias)                           AS membresias,
    (SELECT COUNT(*) FROM membresias WHERE fecha >= date('now','-30 days')) AS membresias30")->fetch();

// ---------- Vista ----------
$fmt = function (?string $f): string {
    if (!$f) return '—';
    $d = DateTime::createFromFormat('Y-m-d H:i:s', $f);
    return $d ? $d->format('d/m/Y H:i') : esc($f);
};
$url = function (array $cambios) use ($seccion, $q, $estado, $YO): string {
    $params = array_filter(array_merge(['seccion' => $seccion, 'q' => $q, 'estado' => $estado], $cambios), fn($v) => $v !== '' && $v !== null);
    return $YO . '?' . http_build_query($params);
};

$css = '<style>'
. '.barra{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin:0 0 18px}'
. '.marca{display:flex;align-items:center;gap:12px;color:var(--tinta);text-decoration:none;font-weight:800;font-size:18px}.marca img{width:44px;height:44px}'
. '.marca small{display:block;font-weight:500;font-size:12px;color:var(--suave);letter-spacing:.02em}'
. '.cifras{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:0 0 18px}'
. '.cifra{background:#fff;border-radius:16px;padding:16px 18px;box-shadow:0 6px 18px rgba(15,58,35,.06)}'
. '.cifra b{display:block;font-size:28px;color:var(--tinta);line-height:1.1}.cifra span{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--suave)}'
. '.pestanas{display:flex;gap:6px;background:#fff;padding:6px;border-radius:999px;width:max-content;max-width:100%;box-shadow:0 6px 18px rgba(15,58,35,.06)}'
. '.pestanas a{padding:10px 18px;border-radius:999px;text-decoration:none;color:var(--texto);font-weight:600;font-size:14px}'
. '.pestanas a.activa{background:var(--verde);color:#fff}'
. '.herr{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:16px 0}.herr form{display:flex;gap:8px;flex:1;min-width:260px}'
. '.herr input[type=search]{padding:11px 14px;background:#fff}.chips a{display:inline-block;padding:8px 13px;border-radius:999px;font-size:13px;text-decoration:none;color:var(--texto);background:#fff;margin-right:4px}'
. '.chips a.activa{background:var(--oscuro);color:#fff}'
. '.tabla{background:#fff;border-radius:18px;overflow:auto;box-shadow:0 10px 30px rgba(15,58,35,.08)}'
. 'table{width:100%;border-collapse:collapse;font-size:14px}th{text-align:left;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#3fa15e;padding:14px 16px;border-bottom:1px solid var(--linea);white-space:nowrap;background:var(--claro)}'
. 'td{padding:12px 16px;border-bottom:1px solid var(--linea);vertical-align:top;color:var(--tinta)}tr:last-child td{border-bottom:0}'
. 'td.motivo{max-width:380px;color:var(--texto)}td a{color:var(--verde)}'
. '.estado{display:inline-block;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:700}.estado.activo{background:#e6f4ea;color:#155d33}.estado.baja{background:#f1f1f1;color:#6b6b6b}'
. '.vacio{padding:40px;text-align:center;color:var(--suave)}'
. '@media(max-width:760px){.cifras{grid-template-columns:repeat(2,1fr)}}'
. '</style>';

$h = $css
. '<div class="barra"><a class="marca" href="' . esc($YO) . '"><img src="/assets/remacv-mark.png" alt="">'
. '<span>Registros REMACV<small>Boletín y solicitudes de membresía</small></span></a>'
. '<a class="btn sec peq" href="' . esc($YO) . '?salir=1">Cerrar sesión</a></div>'
. '<div class="cifras">'
. '<div class="cifra"><b>' . (int)$tot['activos'] . '</b><span>Suscriptores activos</span></div>'
. '<div class="cifra"><b>' . (int)$tot['bajas'] . '</b><span>Bajas del boletín</span></div>'
. '<div class="cifra"><b>' . (int)$tot['membresias'] . '</b><span>Solicitudes de membresía</span></div>'
. '<div class="cifra"><b>' . (int)$tot['membresias30'] . '</b><span>Solicitudes (30 días)</span></div>'
. '</div>'
. '<nav class="pestanas"><a class="' . ($seccion === 'boletin' ? 'activa' : '') . '" href="' . esc($YO) . '?seccion=boletin">Boletín</a>'
. '<a class="' . ($seccion === 'membresias' ? 'activa' : '') . '" href="' . esc($YO) . '?seccion=membresias">Membresías</a></nav>'
. ($aviso ? '<p class="ok" style="margin-top:16px">' . $aviso . '</p>' : '')
. '<div class="herr"><form method="get" action="' . esc($YO) . '"><input type="hidden" name="seccion" value="' . esc($seccion) . '">'
. ($estado ? '<input type="hidden" name="estado" value="' . esc($estado) . '">' : '')
. '<input type="search" name="q" value="' . esc($q) . '" placeholder="' . ($seccion === 'boletin' ? 'Buscar correo…' : 'Buscar nombre, correo, institución…') . '">'
. '<button class="btn peq" type="submit">Buscar</button></form>'
. ($seccion === 'boletin'
    ? '<div class="chips"><a class="' . ($estado === '' ? 'activa' : '') . '" href="' . esc($url(['estado' => ''])) . '">Todos</a>'
    . '<a class="' . ($estado === 'activo' ? 'activa' : '') . '" href="' . esc($url(['estado' => 'activo'])) . '">Activos</a>'
    . '<a class="' . ($estado === 'baja' ? 'activa' : '') . '" href="' . esc($url(['estado' => 'baja'])) . '">Bajas</a></div>'
    : '')
. '<a class="btn peq" href="' . esc($url(['exportar' => 'csv'])) . '">Descargar Excel (CSV)</a></div>'
. '<div class="tabla">';

if (!$filas) {
    $h .= '<p class="vacio">' . ($q !== '' ? 'No hay resultados para “' . esc($q) . '”.' : 'Todavía no hay registros.') . '</p>';
} elseif ($seccion === 'boletin') {
    $h .= '<table><thead><tr><th>Correo</th><th>Estado</th><th>Suscripción</th><th>Último movimiento</th><th>Veces</th><th></th></tr></thead><tbody>';
    foreach ($filas as $f) {
        $activo = $f['estado'] === 'activo';
        $h .= '<tr><td><a href="mailto:' . esc($f['correo']) . '">' . esc($f['correo']) . '</a></td>'
            . '<td><span class="estado ' . ($activo ? 'activo' : 'baja') . '">' . ($activo ? 'Activo' : 'Baja') . '</span></td>'
            . '<td>' . $fmt($f['alta']) . '</td><td>' . $fmt($f['actualizado']) . '</td><td>' . (int)$f['veces'] . '</td>'
            . '<td><form method="post" action="' . esc($url([])) . '" style="margin:0">' . $campoCsrf
            . '<input type="hidden" name="correo" value="' . esc($f['correo']) . '"><input type="hidden" name="accion" value="' . ($activo ? 'baja' : 'alta') . '">'
            . '<button class="btn sec peq" type="submit">' . ($activo ? 'Dar de baja' : 'Reactivar') . '</button></form></td></tr>';
    }
    $h .= '</tbody></table>';
} else {
    $h .= '<table><thead><tr><th>Fecha</th><th>Nombre</th><th>Correo</th><th>Institución</th><th>Motivo</th></tr></thead><tbody>';
    foreach ($filas as $f) {
        $h .= '<tr><td style="white-space:nowrap">' . $fmt($f['fecha']) . '</td><td>' . esc((string)$f['nombre']) . '</td>'
            . '<td><a href="mailto:' . esc($f['correo']) . '">' . esc($f['correo']) . '</a></td>'
            . '<td>' . esc((string)$f['institucion']) . '</td><td class="motivo">' . nl2br(esc((string)$f['motivo'])) . '</td></tr>';
    }
    $h .= '</tbody></table>';
}
$h .= '</div><p class="nota" style="margin-top:12px">' . count($filas) . ' registro' . (count($filas) === 1 ? '' : 's') . ' en esta vista.</p>';

header('Content-Type: text/html; charset=utf-8');
echo paginaHtml('Registros', $h, true);
