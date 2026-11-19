<?php

use Illuminate\Support\Facades\DB;

require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

config([
    'database.connections.ecom3' => [
        'driver' => 'mysql',
        'host' => env('DB_HOST', '127.0.0.1'),
        'port' => env('DB_PORT', '3306'),
        'database' => 'ecom3',
        'username' => env('DB_USERNAME', 'root'),
        'password' => env('DB_PASSWORD', ''),
        'charset' => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci',
    ],
]);

$ecom = DB::connection('ecom3');

function clip(?string $value, int $limit): ?string
{
    if ($value === null || $value === '') {
        return $value === '' ? null : $value;
    }

    return mb_substr($value, 0, $limit);
}

function publicPath(?string $path): ?string
{
    if ($path === null || $path === '') {
        return null;
    }
    $path = ltrim(str_replace('\\', '/', $path), '/');
    if (str_starts_with($path, 'public/')) {
        $path = substr($path, 7);
    }

    return $path;
}

function theme3Path(?string $path): ?string
{
    $path = publicPath($path);
    if ($path === null) {
        return null;
    }
    if (str_starts_with($path, 'uploads/theme3/')) {
        return $path;
    }
    if (str_starts_with($path, 'uploads/')) {
        return 'uploads/theme3/'.substr($path, 8);
    }

    return 'uploads/theme3/'.ltrim($path, '/');
}

function uniqueSlug(string $table, string $base): string
{
    $slug = mb_substr($base, 0, 240);
    if (! DB::table($table)->where('slug', $slug)->exists()) {
        return $slug;
    }
    $i = 2;
    do {
        $candidate = mb_substr($base, 0, 220).'-theme3'.($i === 2 ? '' : '-'.$i);
        $i++;
    } while (DB::table($table)->where('slug', $candidate)->exists());

    return $candidate;
}

function iconValue(?string $icon): ?string
{
    if ($icon === null || trim($icon) === '') {
        return null;
    }
    if (str_contains($icon, '/') || str_contains($icon, 'uploads')) {
        return clip(theme3Path($icon), 255);
    }

    return clip($icon, 255);
}

$categoryMap = [];
$categories = 0;
$rows = $ecom->table('categories')->orderBy('id')->get();
foreach ($rows as $category) {
    $existing = DB::table('categories')->where('theme', 'theme3')->where('name', $category->name)->first();
    if ($existing) {
        $categoryMap[$category->id] = $existing->id;
        continue;
    }

    $categoryMap[$category->id] = DB::table('categories')->insertGetId([
        'theme' => 'theme3',
        'parent_id' => null,
        'name' => clip($category->name, 255),
        'slug' => uniqueSlug('categories', $category->slug ?: 'category-'.$category->id),
        'image' => clip(theme3Path($category->image), 255),
        'icon' => iconValue($category->icon),
        'description' => null,
        'position' => $categories,
        'is_active' => (int) $category->status === 1,
        'meta_title' => clip($category->meta_title, 255),
        'meta_description' => clip($category->meta_description, 500),
        'meta_keywords' => clip($category->meta_keyword, 500),
        'created_at' => $category->created_at ?? now(),
        'updated_at' => $category->updated_at ?? now(),
    ]);
    $categories++;
}

foreach ($rows as $category) {
    $parentId = (int) ($category->parent_id ?? 0);
    if ($parentId > 0 && isset($categoryMap[$parentId], $categoryMap[$category->id]) && $categoryMap[$parentId] !== $categoryMap[$category->id]) {
        DB::table('categories')->where('id', $categoryMap[$category->id])->update([
            'parent_id' => $categoryMap[$parentId],
        ]);
    }
}

$placement = [
    1 => 'hero',
    5 => 'middle',
    9 => 'hit_deal',
    10 => 'homepage_ad',
    11 => 'homepage_ad2',
    12 => 'category_promo',
];
$bannerNames = $ecom->table('banner_categories')->pluck('name', 'id');
$bannerPos = [];
$banners = 0;
foreach ($ecom->table('banners')->orderBy('id')->get() as $banner) {
    $name = (string) ($bannerNames[$banner->category_id] ?? 'Banner');
    $place = $placement[$banner->category_id] ?? null;
    if ($place === null) {
        $lower = mb_strtolower($name);
        $place = match (true) {
            str_contains($lower, 'topcategory'), str_contains($lower, 'promo') => 'category_promo',
            str_contains($lower, 'hot') => 'hit_deal',
            str_contains($lower, 'bottom') => 'middle',
            str_contains($lower, 'ads 2'), str_contains($lower, 'ads2') => 'homepage_ad2',
            str_contains($lower, 'ads') => 'homepage_ad',
            default => 'hero',
        };
    }
    $image = theme3Path($banner->image);
    if (! $image) {
        continue;
    }
    if (DB::table('banners')->where('theme', 'theme3')->where('image', $image)->exists()) {
        continue;
    }
    $bannerPos[$place] = $bannerPos[$place] ?? 0;
    $link = trim((string) $banner->link);
    DB::table('banners')->insert([
        'theme' => 'theme3',
        'title' => clip($name, 255),
        'image' => clip($image, 255),
        'link_url' => ($link === '' || $link === '#') ? '/shop' : clip($link, 255),
        'placement' => $place,
        'style' => 'brand',
        'position' => $bannerPos[$place]++,
        'is_active' => (int) $banner->status === 1,
        'created_at' => $banner->created_at ?? now(),
        'updated_at' => $banner->updated_at ?? now(),
    ]);
    $banners++;
}

$products = 0;
$images = 0;
$skipped = 0;
$usedSkus = [];
foreach ($ecom->table('products')->orderBy('id')->get() as $product) {
    $sku = trim((string) ($product->product_code ?? ''));
    if ($sku === '' || isset($usedSkus[$sku])) {
        $sku = 'ecom3-'.$product->id;
    }
    $usedSkus[$sku] = true;

    if (DB::table('products')->where('theme', 'theme3')->where('sku', $sku)->exists()) {
        continue;
    }

    $old = (float) ($product->old_price ?? 0);
    $new = (float) ($product->new_price ?? 0);
    $regular = max($old, $new);
    $sale = ($old > 0 && $new > 0 && $old !== $new) ? min($old, $new) : null;
    if ($regular <= 0) {
        $regular = $new > 0 ? $new : 0;
    }

    $categoryId = $categoryMap[$product->category_id] ?? null;
    if (! $categoryId) {
        $skipped++;
        continue;
    }

    $newId = DB::table('products')->insertGetId([
        'theme' => 'theme3',
        'category_id' => $categoryId,
        'name' => clip($product->name, 255),
        'slug' => uniqueSlug('products', $product->slug ?: 'product-'.$product->id),
        'sku' => clip($sku, 255),
        'description' => $product->description,
        'regular_price' => $regular,
        'sale_price' => $sale,
        'stock_quantity' => max(0, (int) $product->stock),
        'unit' => clip($product->pro_unit, 255),
        'is_published' => (int) $product->status === 1 && ($product->approval_status === null || $product->approval_status === '' || $product->approval_status === 'approved'),
        'is_featured' => (int) $product->feature_product === 1,
        'is_best_seller' => (int) $product->topsale === 1,
        'is_flash_sale' => (int) $product->flashsale === 1,
        'is_free_shipping' => (int) $product->free_delivery === 1,
        'rating' => min(5, (float) ($product->ratting ?? 0)),
        'meta_title' => clip($product->meta_title, 255),
        'meta_description' => clip($product->meta_description, 500),
        'meta_keywords' => clip($product->meta_keywords, 500),
        'created_at' => $product->created_at ?? now(),
        'updated_at' => $product->updated_at ?? now(),
    ]);
    $products++;

    $position = 0;
    foreach ($ecom->table('productimages')->where('product_id', $product->id)->orderBy('id')->get() as $image) {
        $path = theme3Path($image->image);
        if (! $path) {
            continue;
        }
        DB::table('product_images')->insert([
            'product_id' => $newId,
            'path' => clip($path, 255),
            'alt' => clip($product->name, 255),
            'is_primary' => $position === 0,
            'position' => $position,
            'created_at' => $image->created_at ?? now(),
            'updated_at' => $image->updated_at ?? now(),
        ]);
        $position++;
        $images++;
    }
}

echo "categories={$categories} banners={$banners} products={$products} images={$images} skipped={$skipped}\n";
