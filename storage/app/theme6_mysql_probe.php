<?php

$pdo = new PDO('mysql:host=127.0.0.1;dbname=theme6;charset=utf8mb4', 'root', '');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

foreach (['products', 'categories', 'banners', 'product_images', 'features', 'coupons', 'product_variants'] as $t) {
    try {
        $c = $pdo->query("select count(*) from {$t}")->fetchColumn();
        echo "{$t}={$c}\n";
    } catch (Throwable $e) {
        echo "{$t}=ERR ".$e->getMessage()."\n";
    }
}

echo "--- banners ---\n";
foreach ($pdo->query('select id,title,image,placement,position,is_active from banners') as $row) {
    echo json_encode($row, JSON_UNESCAPED_UNICODE) . "\n";
}

echo "--- categories ---\n";
foreach ($pdo->query('select id,parent_id,name,slug,image,icon,position,is_active from categories order by position,id') as $row) {
    echo json_encode($row, JSON_UNESCAPED_UNICODE) . "\n";
}

echo "--- products ---\n";
foreach ($pdo->query('select id,category_id,name,slug,sku,brand,regular_price,sale_price,stock_quantity,is_published,is_featured,is_new_arrival,is_best_seller,is_flash_sale,flash_sale_position,rating from products') as $row) {
    echo json_encode($row, JSON_UNESCAPED_UNICODE) . "\n";
}

echo "--- features ---\n";
foreach ($pdo->query('select id,icon,title,subtitle,position,is_active from features') as $row) {
    echo json_encode($row, JSON_UNESCAPED_UNICODE) . "\n";
}

echo "--- coupons ---\n";
foreach ($pdo->query('select id,code,description,type,value,min_order_amount,max_discount,is_active from coupons') as $row) {
    echo json_encode($row, JSON_UNESCAPED_UNICODE) . "\n";
}

echo "--- product_images primary sample ---\n";
foreach ($pdo->query('select product_id,path,is_primary from product_images where is_primary=1 order by product_id') as $row) {
    echo json_encode($row, JSON_UNESCAPED_UNICODE) . "\n";
}
