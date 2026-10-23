<?php
/**
 * ПОМОЩНИК: показывает chat_id (Telegram) и user_id (MAX).
 * 1. Впишите токены ботов в form-config.php.
 * 2. Напишите каждому боту любое сообщение со своего аккаунта.
 * 3. Откройте в браузере адрес вашсайт.ru/get-ids.php
 * 4. Перепишите числа в form-config.php и ОБЯЗАТЕЛЬНО удалите этот файл с хостинга.
 */
header('Content-Type: text/html; charset=utf-8');
if (!is_file(__DIR__ . '/form-config.php')) exit('Нет файла form-config.php рядом с этим файлом.');
require __DIR__ . '/form-config.php';

function http_get($url, $headers = []) {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [CURLOPT_HTTPHEADER => $headers, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10]);
        $res = curl_exec($ch);
        curl_close($ch);
        return $res;
    }
    $ctx = stream_context_create(['http' => ['header' => implode("\r\n", $headers), 'timeout' => 10, 'ignore_errors' => true]]);
    return @file_get_contents($url, false, $ctx);
}

// собирает все пары user_id/name из ответа MAX
function collect_users($node, &$out) {
    if (!is_array($node)) return;
    if (isset($node['user_id'])) $out[$node['user_id']] = $node['name'] ?? ($node['first_name'] ?? '');
    foreach ($node as $v) collect_users($v, $out);
}

echo '<meta name="viewport" content="width=device-width"><body style="font:16px/1.5 system-ui;max-width:720px;margin:40px auto;padding:0 16px">';

echo '<h2>Telegram</h2>';
if (TG_BOT_TOKEN === '') {
    echo '<p>Токен Telegram-бота не заполнен в form-config.php.</p>';
} else {
    $data = json_decode(http_get('https://api.telegram.org/bot' . TG_BOT_TOKEN . '/getUpdates'), true);
    $chats = [];
    foreach (($data['result'] ?? []) as $u) {
        $chat = $u['message']['chat'] ?? null;
        if ($chat) $chats[$chat['id']] = trim(($chat['first_name'] ?? '') . ' ' . ($chat['last_name'] ?? '') . ' ' . ($chat['title'] ?? ''));
    }
    if (!$chats) echo '<p>Сообщений не найдено. Напишите боту что-нибудь и обновите страницу.</p>';
    foreach ($chats as $id => $nm) echo '<p>TG_CHAT_ID = <b>' . htmlspecialchars($id) . '</b> — ' . htmlspecialchars($nm) . '</p>';
}

echo '<h2>MAX</h2>';
if (MAX_BOT_TOKEN === '') {
    echo '<p>Токен бота MAX не заполнен в form-config.php.</p>';
} else {
    $raw = http_get('https://platform-api2.max.ru/updates', ['Authorization: ' . MAX_BOT_TOKEN]);
    $users = [];
    collect_users(json_decode($raw, true), $users);
    if (!$users) {
        echo '<p>Пользователи не найдены. Напишите боту что-нибудь и обновите страницу. Ответ сервера:</p><pre style="white-space:pre-wrap">' . htmlspecialchars(mb_substr((string)$raw, 0, 3000)) . '</pre>';
    }
    foreach ($users as $id => $nm) echo '<p>MAX_USER_ID = <b>' . htmlspecialchars($id) . '</b> — ' . htmlspecialchars($nm) . '</p>';
}
echo '<p style="color:#b00"><b>После настройки удалите файл get-ids.php с хостинга.</b></p>';
