<?php

$pdo = new PDO('sqlite:' . __DIR__ . '/../../theme6/database/database.sqlite');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

echo "--- products ---\n";
foreach ($pdo->query('select id,name,slug,category_id,sku,brand,regular_price,sale_price,stock_quantity,is_published,is_featured,is_new_arrival,is_best_seller,rating from products') as $row) {
    echo json_encode($row, JSON_UNESCAPED_UNICODE) . "\n";
}

echo "--- banners ---\n";
foreach ($pdo->query('select * from banners') as $row) {
    echo json_encode($row, JSON_UNESCAPED_UNICODE) . "\n";
}

echo "--- categories ---\n";
foreach ($pdo->query('select id,parent_id,name,slug,image,icon,position,is_active from categories order by position,id') as $row) {
    echo json_encode($row, JSON_UNESCAPED_UNICODE) . "\n";
}

echo "--- features ---\n";
foreach ($pdo->query('select * from features') as $row) {
    echo json_encode($row, JSON_UNESCAPED_UNICODE) . "\n";
}

echo "--- coupons ---\n";
foreach ($pdo->query('select * from coupons') as $row) {
    echo json_encode($row, JSON_UNESCAPED_UNICODE) . "\n";
}

echo "--- sample images ---\n";
foreach ($pdo->query('select * from product_images where product_id in (5,6,7,28,30) order by product_id, position limit 20') as $row) {
    echo json_encode($row, JSON_UNESCAPED_UNICODE) . "\n";
}

echo "--- local image files ---\n";
$n = 0;
foreach ($pdo->query("select path from product_images where path like 'uploads/%'") as $row) {
    $n++;
    if ($n <= 15) echo $row['path'] . "\n";
}
echo "local_count={$n}\n";
