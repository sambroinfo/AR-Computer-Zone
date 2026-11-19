<?php

$pdo = new PDO('sqlite:' . __DIR__ . '/../../theme6/database/database.sqlite');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

foreach (['products', 'categories', 'banners', 'product_images', 'features', 'coupons'] as $t) {
    $c = $pdo->query("select count(*) from {$t}")->fetchColumn();
    echo "{$t}={$c}\n";
}

echo "--- products cols ---\n";
foreach ($pdo->query('PRAGMA table_info(products)') as $row) {
    echo $row['name'] . "\n";
}

echo "--- sample products ---\n";
$r = $pdo->query('select id,name,slug,category_id,regular_price,sale_price,is_flash_sale,is_featured,is_best_seller,stock_quantity,is_published from products');
while ($row = $r->fetch(PDO::FETCH_ASSOC)) {
    echo json_encode($row, JSON_UNESCAPED_UNICODE) . "\n";
}

echo "--- banners ---\n";
foreach ($pdo->query('select * from banners') as $row) {
    echo json_encode($row, JSON_UNESCAPED_UNICODE) . "\n";
}

echo "--- categories ---\n";
foreach ($pdo->query('select id,parent_id,name,slug,image,icon,position,is_active from categories') as $row) {
    echo json_encode($row, JSON_UNESCAPED_UNICODE) . "\n";
}

echo "--- product_images count by product ---\n";
foreach ($pdo->query('select product_id, count(*) c from product_images group by product_id') as $row) {
    echo json_encode($row) . "\n";
}

echo "--- features ---\n";
foreach ($pdo->query('select * from features') as $row) {
    echo json_encode($row, JSON_UNESCAPED_UNICODE) . "\n";
}
