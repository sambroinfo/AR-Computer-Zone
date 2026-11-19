<?php

$pdo = new PDO('mysql:host=127.0.0.1;dbname=theme6;charset=utf8mb4', 'root', '');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

$keys = [
    'logo', 'favicon', 'site_name', 'tagline', 'footer_text',
    'header_template', 'header_nav_bg', 'header_nav_text', 'header_nav_hover',
    'header_promo_text', 'header_promo_link',
    'product_card_preset', 'product_card_bg_color', 'product_card_text_color',
    'product_card_btn_bg_color', 'product_card_btn_text_color',
    'product_card_secondary_btn_bg_color', 'product_card_secondary_btn_text_color',
    'product_card_buy_text', 'product_card_view_text', 'product_cta_action',
    'product_card_shadow_style', 'product_card_shadow_color',
    'product_card_border_color', 'product_card_border_radius',
    'default_cta_text', 'home_view_more_label',
    'currency_symbol', 'theme_primary', 'primary_color', 'brand_primary',
    'admin_primary_color', 'storefront_primary_color',
    'footer_bg_color', 'footer_accent_color',
    'footer_credit_enabled', 'footer_credit_prefix', 'footer_credit_name', 'footer_credit_url',
    'chat_enabled', 'whatsapp_number', 'call_number', 'messenger_page',
    'contact_phone', 'contact_email', 'contact_address',
    'flash_sale_ends_at', 'deal_ends_at',
    'review_screenshots_enabled', 'review_screenshots_title',
];

echo "--- matching keys ---\n";
foreach ($pdo->query('SELECT `key`, `value` FROM settings ORDER BY `key`') as $row) {
    $k = $row['key'];
    $interesting = false;
    foreach (['color', 'card', 'logo', 'header', 'footer', 'primary', 'preset', 'brand', 'theme', 'cta', 'chat', 'whatsapp', 'call', 'messenger', 'site_name', 'favicon', 'promo', 'view_more', 'nav'] as $needle) {
        if (stripos($k, $needle) !== false) {
            $interesting = true;
            break;
        }
    }
    if ($interesting || in_array($k, $keys, true)) {
        $v = $row['value'];
        if (strlen((string) $v) > 180) {
            $v = substr((string) $v, 0, 180) . '…';
        }
        echo $k . ' = ' . $v . "\n";
    }
}
