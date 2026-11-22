<?php
/**
 * REMACV · Código compartido por formulario.php, baja.php y registros.php
 * (configuración, base de datos, plantilla de correo y enlaces de baja).
 * No se abre directamente.
 */
declare(strict_types=1);
if (!defined('REMACV')) { http_response_code(404); exit; }

// ---------------- Configuración ----------------
const EQUIPO = [                       // reciben todas las respuestas
    'contacto@remacv.mx',
    'jyes407@gmail.com',
    // 'apadillar@iingen.unam.mx',   // pendiente de confirmar
];
const REMITENTE        = 'contacto@remacv.mx';
const NOMBRE_REMITENTE = 'REMACV';
const SITIO            = 'https://remacv.mx';
const IMG              = SITIO . '/assets/correo';
const ZONA             = 'America/Mexico_City';

/** Carpeta privada (fuera de public_html) para la base de datos y registros. */
function carpetaDatos(): string {
    static $dir = null;
    if ($dir !== null) return $dir;
    $dir = dirname(__DIR__, 2) . '/remacv-datos';
    if (!is_dir($dir) && !@mkdir($dir, 0750, true)) {
        $dir = sys_get_temp_dir() . '/remacv-datos';
        @mkdir($dir, 0750, true);
    }
    return $dir;
}

// ---------------- Utilidades ----------------
function limpia($v, int $max = 2000): string {
    $t = trim((string)($v ?? ''));
    $t = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $t) ?? '';
    return mb_substr($t, 0, $max);
}
function esc(string $t): string {
    return htmlspecialchars($t, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}
function ahoraLocal(string $formato = 'Y-m-d H:i:s'): string {
    return (new DateTime('now', new DateTimeZone(ZONA)))->format($formato);
}
function registrar(string $archivo, array $fila): void {
    @file_put_contents(carpetaDatos() . '/' . $archivo,
        json_encode($fila, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
}
function primerNombre(string $n): string {
    $p = preg_split('/\s+/', trim($n));
    return $p[0] ?? '';
}

// ---------------- Base de datos (SQLite) ----------------
/**
 * Base de datos con dos tablas:
 *  - suscriptores: una fila por correo del boletín (estado activo / baja)
 *  - membresias:   una fila por cada solicitud de membresía
 * Devuelve null si el servidor no tiene SQLite (el sitio sigue funcionando con los .jsonl).
 */
function bd(): ?PDO {
    static $pdo = false;
    if ($pdo !== false) return $pdo;
    $pdo = null;
    if (!class_exists('PDO') || !in_array('sqlite', PDO::getAvailableDrivers(), true)) return null;
    try {
        $ruta = carpetaDatos() . '/registros.sqlite';
        $p = new PDO('sqlite:' . $ruta, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        @chmod($ruta, 0640);
        $p->exec('PRAGMA busy_timeout = 5000');
        $p->exec("CREATE TABLE IF NOT EXISTS suscriptores (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            correo      TEXT NOT NULL UNIQUE COLLATE NOCASE,
            estado      TEXT NOT NULL DEFAULT 'activo',   -- activo | baja
            alta        TEXT NOT NULL,                     -- primera suscripción
            actualizado TEXT NOT NULL,                     -- último movimiento
            baja        TEXT,                              -- fecha de baja (si aplica)
            veces       INTEGER NOT NULL DEFAULT 1,        -- veces que llenó el formulario
            pagina      TEXT,
            ip          TEXT
        )");
        $p->exec("CREATE TABLE IF NOT EXISTS membresias (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha       TEXT NOT NULL,
            nombre      TEXT,
            correo      TEXT NOT NULL COLLATE NOCASE,
            institucion TEXT,
            motivo      TEXT,
            pagina      TEXT,
            ip          TEXT
        )");
        $p->exec("CREATE TABLE IF NOT EXISTS meta (clave TEXT PRIMARY KEY, valor TEXT)");
        migrarJsonl($p);
        $pdo = $p;
    } catch (Throwable $e) {
        registrar('errores.log', ['t' => date('c'), 'bd' => $e->getMessage()]);
        $pdo = null;
    }
    return $pdo;
}

/** Pasa a la base de datos lo que ya estaba guardado en los .jsonl (solo una vez). */
function migrarJsonl(PDO $p): void {
    $ya = $p->query("SELECT valor FROM meta WHERE clave = 'migrado_jsonl'")->fetchColumn();
    if ($ya) return;
    $convertir = function (string $f): string {
        $d = DateTime::createFromFormat('d/m/Y H:i', $f, new DateTimeZone(ZONA));
        return $d ? $d->format('Y-m-d H:i:00') : ahoraLocal();
    };
    $p->beginTransaction();
    $dir = carpetaDatos();
    foreach (is_file("$dir/suscriptores.jsonl") ? file("$dir/suscriptores.jsonl", FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) : [] as $l) {
        $o = json_decode($l, true);
        if (!is_array($o) || empty($o['correo'])) continue;
        $f = $convertir((string)($o['fecha'] ?? ''));
        $p->prepare("INSERT INTO suscriptores (correo, alta, actualizado) VALUES (?, ?, ?)
                     ON CONFLICT(correo) DO UPDATE SET veces = veces + 1, actualizado = excluded.actualizado")
          ->execute([$o['correo'], $f, $f]);
    }
    foreach (is_file("$dir/solicitudes.jsonl") ? file("$dir/solicitudes.jsonl", FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) : [] as $l) {
        $o = json_decode($l, true);
        if (!is_array($o) || empty($o['correo'])) continue;
        $p->prepare("INSERT INTO membresias (fecha, nombre, correo, institucion, motivo) VALUES (?, ?, ?, ?, ?)")
          ->execute([$convertir((string)($o['fecha'] ?? '')), $o['nombre'] ?? '', $o['correo'], $o['institucion'] ?? '', $o['motivo'] ?? '']);
    }
    $p->prepare("INSERT OR REPLACE INTO meta (clave, valor) VALUES ('migrado_jsonl', ?)")->execute([ahoraLocal()]);
    $p->commit();
}

// ---------------- Enlaces de baja firmados ----------------
function secreto(): string {
    $f = carpetaDatos() . '/secreto.key';
    if (!is_file($f)) {
        @file_put_contents($f, bin2hex(random_bytes(32)), LOCK_EX);
        @chmod($f, 0600);
    }
    $s = trim((string)@file_get_contents($f));
    return $s !== '' ? $s : hash('sha256', __FILE__ . php_uname());
}
function firmaBaja(string $correo): string {
    return substr(hash_hmac('sha256', 'baja|' . mb_strtolower($correo), secreto()), 0, 32);
}
function firmaValida(string $correo, string $firma): bool {
    return $firma !== '' && hash_equals(firmaBaja($correo), $firma);
}
function urlBaja(string $correo): string {
    return SITIO . '/api/baja.php?c=' . rawurlencode($correo) . '&t=' . firmaBaja($correo);
}

/** Da de baja (o reactiva) un correo. Devuelve el estado anterior: null | activo | baja */
function cambiarEstado(string $correo, string $estado): ?string {
    $p = bd();
    if (!$p) return null;
    $antes = $p->prepare('SELECT estado FROM suscriptores WHERE correo = ?');
    $antes->execute([$correo]);
    $previo = $antes->fetchColumn() ?: null;
    $ahora = ahoraLocal();
    if ($previo === null) {
        $p->prepare('INSERT INTO suscriptores (correo, estado, alta, actualizado, baja, veces) VALUES (?, ?, ?, ?, ?, 0)')
          ->execute([$correo, $estado, $ahora, $ahora, $estado === 'baja' ? $ahora : null]);
    } else {
        $p->prepare('UPDATE suscriptores SET estado = ?, actualizado = ?, baja = ? WHERE correo = ?')
          ->execute([$estado, $ahora, $estado === 'baja' ? $ahora : null, $correo]);
    }
    registrar('bajas.log', ['t' => date('c'), 'correo' => $correo, 'estado' => $estado]);
    return $previo;
}
function estaDeBaja(string $correo): bool {
    $p = bd();
    if (!$p) return false;
    $q = $p->prepare("SELECT 1 FROM suscriptores WHERE correo = ? AND estado = 'baja'");
    $q->execute([$correo]);
    return (bool)$q->fetchColumn();
}

// ---------------- Envío de correo ----------------
/**
 * Datos SMTP del buzón contacto@remacv.mx (archivo privado fuera de public_html):
 *   remacv-datos/smtp.json → {"servidor":"smtp.hostinger.com","puerto":465,
 *                             "usuario":"contacto@remacv.mx","clave":"…"}
 * Con SMTP el correo sale firmado por remacv.mx (sin "a través de" y sin spam).
 * Si el archivo no existe o la clave está vacía, se usa mail() del servidor.
 */
function configSmtp(): ?array {
    $f = carpetaDatos() . '/smtp.json';
    if (!is_file($f)) {
        @file_put_contents($f, json_encode([
            'servidor' => 'smtp.hostinger.com', 'puerto' => 465,
            'usuario' => REMITENTE, 'clave' => '',
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);
        @chmod($f, 0600);
        return null;
    }
    $c = json_decode((string)@file_get_contents($f), true);
    if (!is_array($c) || trim((string)($c['clave'] ?? '')) === '' || str_contains((string)$c['clave'], 'PEGA')) return null;
    return $c + ['servidor' => 'smtp.hostinger.com', 'puerto' => 465, 'usuario' => REMITENTE];
}

/** Cliente SMTP mínimo (SSL 465 o STARTTLS 587) con AUTH LOGIN. */
function enviarSmtp(array $cfg, array $para, string $mensaje): bool {
    $puerto = (int)$cfg['puerto'];
    $ssl = ($cfg['seguridad'] ?? ($puerto === 465 ? 'ssl' : 'starttls')) === 'ssl';
    $ctx = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true]]);
    $dest = ($ssl ? 'ssl://' : 'tcp://') . $cfg['servidor'] . ':' . $puerto;
    $s = @stream_socket_client($dest, $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $ctx);
    if (!$s) throw new RuntimeException("conexión: $errstr");
    stream_set_timeout($s, 20);
    $leer = function () use ($s): string {
        $r = '';
        while (($l = fgets($s, 1024)) !== false) { $r .= $l; if (strlen($l) < 4 || $l[3] === ' ') break; }
        return $r;
    };
    $cmd = function (?string $c, array $ok) use ($s, $leer): string {
        if ($c !== null) fwrite($s, $c . "\r\n");
        $r = $leer();
        if (!in_array((int)substr($r, 0, 3), $ok, true)) {
            throw new RuntimeException(trim(preg_replace('/^(AUTH LOGIN|[A-Za-z0-9+\/=]{8,})$/', '[oculto]', (string)$c)) . ' → ' . trim($r));
        }
        return $r;
    };
    try {
        $cmd(null, [220]);
        $host = 'remacv.mx';
        $cmd("EHLO $host", [250]);
        if (!$ssl) {
            $cmd('STARTTLS', [220]);
            if (!stream_socket_enable_crypto($s, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) throw new RuntimeException('STARTTLS');
            $cmd("EHLO $host", [250]);
        }
        $cmd('AUTH LOGIN', [334]);
        $cmd(base64_encode((string)$cfg['usuario']), [334]);
        $cmd(base64_encode((string)$cfg['clave']), [235]);
        $cmd('MAIL FROM:<' . REMITENTE . '>', [250]);
        foreach ($para as $p) $cmd('RCPT TO:<' . $p . '>', [250, 251]);
        $cmd('DATA', [354]);
        // líneas que empiezan con punto se duplican (RFC 5321)
        $cuerpo = preg_replace('/^\./m', '..', str_replace(["\r\n", "\n"], ["\n", "\r\n"], $mensaje));
        $cmd($cuerpo . "\r\n.", [250]);
        $cmd('QUIT', [221]);
        return true;
    } finally {
        fclose($s);
    }
}

/** Envía un correo HTML + texto (multipart/alternative): por SMTP si está configurado. */
function enviar(array $para, string $asunto, string $html, string $texto, string $responderA,
                array $extra = []): bool {
    $limite = 'remacv-' . bin2hex(random_bytes(12));
    $asuntoCod = '=?UTF-8?B?' . base64_encode($asunto) . '?=';
    $encabezados = array_merge([
        'MIME-Version: 1.0',
        "Content-Type: multipart/alternative; boundary=\"{$limite}\"",
        'From: =?UTF-8?B?' . base64_encode(NOMBRE_REMITENTE) . '?= <' . REMITENTE . '>',
        "Reply-To: {$responderA}",
        'X-Mailer: REMACV-sitio',
    ], $extra);
    $cuerpo = "--{$limite}\r\n"
            . "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
            . chunk_split(base64_encode($texto)) . "\r\n"
            . "--{$limite}\r\n"
            . "Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
            . chunk_split(base64_encode($html)) . "\r\n"
            . "--{$limite}--\r\n";

    if ($cfg = configSmtp()) {
        $mensaje = implode("\r\n", array_merge([
            'Date: ' . date(DATE_RFC2822),
            'To: ' . implode(', ', $para),
            "Subject: {$asuntoCod}",
            'Message-ID: <' . bin2hex(random_bytes(16)) . '@remacv.mx>',
        ], $encabezados)) . "\r\n\r\n" . $cuerpo;
        try {
            return enviarSmtp($cfg, $para, $mensaje);
        } catch (Throwable $e) {
            registrar('errores.log', ['t' => date('c'), 'smtp' => $e->getMessage()]);
            // si el SMTP falla, se intenta con el servidor para no perder el aviso
        }
    }
    return @mail(implode(', ', $para), $asuntoCod, $cuerpo, implode("\r\n", $encabezados), '-f' . REMITENTE);
}
/** Encabezados para que Gmail/Outlook muestren su propio botón de "Cancelar suscripción". */
function encabezadosBaja(string $correo): array {
    return [
        'List-Unsubscribe: <' . urlBaja($correo) . '>, <mailto:' . REMITENTE . '?subject=Baja%20' . rawurlencode($correo) . '>',
        'List-Unsubscribe-Post: List-Unsubscribe=One-Click',
    ];
}

/**
 * Plantilla de correo REMACV: encabezado ambiental con logo, tarjeta blanca
 * y pie verde. Solo tablas y estilos en línea (compatible con Gmail/Outlook).
 */
function plantilla(array $o): string {
    $IMG = IMG; $SITIO = SITIO;
    $boton = '';
    if (!empty($o['boton'])) {
        [$txt, $url] = $o['boton'];
        $boton = '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:30px auto 6px"><tr>'
               . '<td align="center" bgcolor="#1f7a47" style="border-radius:999px">'
               . '<a href="' . esc($url) . '" style="display:inline-block;padding:15px 30px;font:700 13px Arial,Helvetica,sans-serif;'
               . 'letter-spacing:.14em;text-transform:uppercase;color:#ffffff;text-decoration:none;border-radius:999px">'
               . esc($txt) . ' &rarr;</a></td></tr></table>';
    }
    $baja = '';
    if (!empty($o['baja'])) {
        $baja = '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:18px auto 0"><tr>'
              . '<td align="center" style="border:1px solid #4f7d60;border-radius:999px">'
              . '<a href="' . esc($o['baja']) . '" style="display:inline-block;padding:9px 20px;font:700 11px Arial,Helvetica,sans-serif;'
              . 'letter-spacing:.12em;text-transform:uppercase;color:#cfe5d6;text-decoration:none;border-radius:999px">'
              . 'Dejar de recibir correos</a></td></tr></table>';
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
        . $baja
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
function vineta(string $titulo, string $texto): string {
    return '<tr><td width="34" valign="top" style="padding:12px 12px 0 0"><img src="' . esc(IMG) . '/hoja.png" width="22" height="22" alt="" style="display:block;border:0"></td>'
         . '<td valign="top" style="padding:10px 0 0;font:15px/1.6 Arial,Helvetica,sans-serif;color:#33463c">'
         . '<strong style="color:#0a1a12">' . esc($titulo) . '</strong><br>' . esc($texto) . '</td></tr>';
}

// ---------------- Página web con el estilo REMACV (baja y panel) ----------------
function paginaHtml(string $titulo, string $contenido, bool $ancha = false): string {
    $max = $ancha ? '1180px' : '560px';
    return '<!doctype html><html lang="es"><head><meta charset="utf-8">'
        . '<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">'
        . '<title>' . esc($titulo) . ' · REMACV</title>'
        . '<link rel="icon" href="/assets/remacv-mark.png">'
        . '<style>'
        . ':root{--verde:#1f7a47;--oscuro:#0f3a23;--tinta:#0a1a12;--texto:#33463c;--suave:#5b6c61;--linea:#e3ece5;--fondo:#e9f1ea;--claro:#f5f9f5}'
        . '*{box-sizing:border-box}body{margin:0;background:var(--fondo);font:16px/1.6 Inter,system-ui,-apple-system,"Segoe UI",Arial,sans-serif;color:var(--texto)}'
        . '.envoltura{max-width:' . $max . ';margin:0 auto;padding:32px 16px 48px}'
        . '.tarjeta{background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(15,58,35,.08)}'
        . '.cabecera{display:block;background:var(--oscuro)}.cabecera img{display:block;width:100%;height:auto}'
        . '.cuerpo{padding:34px 36px 36px}.ante{margin:0 0 10px;font-weight:700;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#3fa15e}'
        . 'h1{margin:0 0 14px;font-size:28px;line-height:1.2;color:var(--tinta);letter-spacing:-.4px}h1 span{color:var(--verde)}'
        . '.btn{display:inline-block;border:0;cursor:pointer;background:var(--verde);color:#fff;font-family:inherit;font-weight:700;font-size:13px;line-height:1;letter-spacing:.12em;text-transform:uppercase;padding:15px 26px;border-radius:999px;text-decoration:none}'
        . '.btn:hover{background:#18653a}.btn.sec{background:transparent;color:var(--verde);box-shadow:inset 0 0 0 1.5px var(--verde)}'
        . '.btn.peq{padding:9px 14px;font-size:11px}.nota{font-size:14px;color:var(--suave)}'
        . 'input[type=password],input[type=search],input[type=text]{width:100%;padding:13px 15px;border:1.5px solid var(--linea);border-radius:12px;font:inherit;background:var(--claro)}'
        . 'input:focus{outline:none;border-color:var(--verde)}label{display:block;font-weight:600;font-size:14px;margin:14px 0 6px;color:var(--tinta)}'
        . '.alerta{padding:12px 16px;border-radius:12px;background:#fdecec;color:#8a1f1f;font-size:14px;margin:0 0 14px}'
        . '.ok{padding:12px 16px;border-radius:12px;background:#e6f4ea;color:#155d33;font-size:14px;margin:0 0 14px}'
        . '.pie{text-align:center;font-size:13px;color:var(--suave);margin-top:18px}.pie a{color:var(--verde)}'
        . '</style></head><body><main class="envoltura">' . $contenido
        . '<p class="pie">Red Mexicana de Análisis de Ciclo de Vida · <a href="' . esc(SITIO) . '">remacv.mx</a></p>'
        . '</main></body></html>';
}
