<?php
/**
 * Отправка заявок с сайта в Telegram и MAX.
 * Сам этот файл менять не нужно — настройки лежат в form-config.php.
 */
if (!is_file(__DIR__ . '/form-config.php')) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => 'no_config']);
    exit;
}
require __DIR__ . '/form-config.php';

date_default_timezone_set('Asia/Tomsk');
header('Content-Type: application/json; charset=utf-8');

function reply($ok, $code = 200, $error = null) {
    http_response_code($code);
    echo json_encode($error ? ['ok' => $ok, 'error' => $error] : ['ok' => $ok]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') reply(false, 405, 'method');

// Ловушка для спам-ботов: поле скрыто от людей. Если заполнено — делаем вид, что всё ок.
if (!empty($_POST['website'])) reply(true);

function field($key, $max) {
    $v = isset($_POST[$key]) && is_string($_POST[$key]) ? trim(strip_tags($_POST[$key])) : '';
    return mb_substr($v, 0, $max);
}

$name    = field('name', 100);
$phone   = field('phone', 30);
$comment = field('comment', 1000);
$needs   = [];
if (isset($_POST['needs']) && is_array($_POST['needs'])) {
    foreach (array_slice($_POST['needs'], 0, 10) as $n) {
        if (is_string($n)) $needs[] = mb_substr(trim(strip_tags($n)), 0, 40);
    }
}

if (strlen(preg_replace('/\D/', '', $phone)) < 10) reply(false, 422, 'phone');
if (empty($_POST['consent'])) reply(false, 422, 'consent');

$text = "Новая заявка с сайта\n\n"
      . "Имя: " . ($name !== '' ? $name : '—') . "\n"
      . "Телефон: " . $phone . "\n"
      . ($needs ? "Что нужно: " . implode(', ', $needs) . "\n" : '')
      . ($comment !== '' ? "Комментарий: " . $comment . "\n" : '')
      . "\n" . date('d.m.Y H:i');

function post_json($url, $payload, $headers = []) {
    $body = json_encode($payload, JSON_UNESCAPED_UNICODE);
    $headers[] = 'Content-Type: application/json';
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $body,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 10,
        ]);
        curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return $code >= 200 && $code < 300;
    }
    $ctx = stream_context_create(['http' => [
        'method'        => 'POST',
        'header'        => implode("\r\n", $headers),
        'content'       => $body,
        'timeout'       => 10,
        'ignore_errors' => true,
    ]]);
    $res = @file_get_contents($url, false, $ctx);
    return $res !== false && isset($http_response_header[0]) && preg_match('/\s2\d\d\s/', $http_response_header[0]);
}

$sent = 0;
if (TG_BOT_TOKEN !== '' && TG_CHAT_ID !== '') {
    if (post_json('https://api.telegram.org/bot' . TG_BOT_TOKEN . '/sendMessage',
                  ['chat_id' => TG_CHAT_ID, 'text' => $text])) $sent++;
}
if (MAX_BOT_TOKEN !== '' && MAX_USER_ID !== '') {
    if (post_json('https://platform-api2.max.ru/messages?user_id=' . urlencode(MAX_USER_ID),
                  ['text' => $text], ['Authorization: ' . MAX_BOT_TOKEN])) $sent++;
}

if ($sent === 0) reply(false, 500, 'not_sent');
reply(true);
