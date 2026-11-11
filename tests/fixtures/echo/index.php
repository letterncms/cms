<?php

// What SafeFetcherTest posts to: says back what arrived, or a long answer for /long.
if (str_starts_with($_SERVER['REQUEST_URI'], '/long')) {
    http_response_code(500);
    echo str_repeat('x', 300_000);

    return;
}

if (str_starts_with($_SERVER['REQUEST_URI'], '/endless')) {
    http_response_code(202);
    file_put_contents(sys_get_temp_dir().'/cms-echo-arrived', file_get_contents('php://input'));

    for ($i = 0; $i < 40; $i++) {
        echo str_repeat('y', 100_000);
        flush();
    }

    return;
}

if (str_starts_with($_SERVER['REQUEST_URI'], '/moved')) {
    header('Location: /elsewhere', true, 302);

    return;
}

header('Content-Type: application/json');
echo json_encode(['method' => $_SERVER['REQUEST_METHOD'], 'signature' => $_SERVER['HTTP_X_SIGNATURE'] ?? null, 'type' => $_SERVER['CONTENT_TYPE'] ?? null, 'body' => file_get_contents('php://input')]);
