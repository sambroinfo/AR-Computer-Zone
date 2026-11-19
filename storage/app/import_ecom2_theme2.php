<?php

use Illuminate\Support\Facades\DB;

require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

config([
    'database.connections.ecom2' => [
        'driver' => 'mysql',
        'host' => env('DB_HOST', '127.0.0.1'),
        'port' => env('DB_PORT', '3306'),
        'database' => 'ecom2',
        'username' => env('DB_USERNAME', 'root'),
        'password' => env('DB_PASSWORD', ''),
        'charset' => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci',
    ],
]);

$ecom = DB::connection('ecom2');

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
    $path = ltrim($path, '/');
    if (str_starts_with($path, 'public/')) {
        $path = substr($path, 7);
    }

    return $path;
}

function uniqueSlug(string $table, string $base): string
{
    $slug = mb_substr($base, 0, 240);
    if (! DB::table($table)->where('slug', $slug)->exists()) {
        return $slug;
    }
    $i = 2;
    do {
        $candidate = mb_substr($base, 0, 230).'-theme2'.($i === 2 ? '' : '-'.$i);
        $i++;
    } while (DB::table($table)->where('slug', $candidate)->exists());

    return $candidate;
}

$categoryMap = [];
$categories = 0;
foreach ($ecom->table('categories')->orderBy('id')->get() as $category) {
    $existing = DB::table('categories')->where('theme', 'theme2')->where('slug', $category->slug)->first();
    if ($existing) {
        $categoryMap[$category->id] = $existing->id;
        continue;
    }

    $categoryMap[$category->id] = DB::table('categories')->insertGetId([
        'theme' => 'theme2',
        'parent_id' => null,
        'name' => $category->name,
        'slug' => uniqueSlug('categories', $category->slug ?: 'category-'.$category->id),
        'image' => publicPath($category->image),
        'icon' => $category->icon,
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

$placement = [
    1 => 'hero',
    5 => 'middle',
    9 => 'hit_deal',
    10 => 'homepage_ad',
    11 => 'homepage_ad2',
];
$bannerNames = $ecom->table('banner_categories')->pluck('name', 'id');
$bannerPos = [];
$banners = 0;
foreach ($ecom->table('banners')->orderBy('id')->get() as $banner) {
    $place = $placement[$banner->category_id] ?? 'hero';
    $image = publicPath($banner->image);
    if (DB::table('banners')->where('theme', 'theme2')->where('image', $image)->exists()) {
        continue;
    }
    $bannerPos[$place] = ($bannerPos[$place] ?? 0);
    $link = trim((string) $banner->link);
    DB::table('banners')->insert([
        'theme' => 'theme2',
        'title' => clip($bannerNames[$banner->category_id] ?? 'Banner', 255),
        'image' => $image,
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
foreach ($ecom->table('products')->orderBy('id')->get() as $product) {
    if (DB::table('products')->where('theme', 'theme2')->where('name', $product->name)->where('sku', $product->product_code ?: ('ecom2-'.$product->id))->exists()) {
        continue;
    }

    $old = (float) ($product->old_price ?? 0);
    $new = (float) ($product->new_price ?? 0);
    $regular = max($old, $new);
    $sale = ($old > 0 && $new > 0 && $old !== $new) ? min($old, $new) : null;
    if ($regular <= 0) {
        $regular = $new;
    }

    $categoryId = $categoryMap[$product->category_id] ?? null;
    if (! $categoryId) {
        continue;
    }

    $newId = DB::table('products')->insertGetId([
        'theme' => 'theme2',
        'category_id' => $categoryId,
        'name' => $product->name,
        'slug' => uniqueSlug('products', $product->slug ?: 'product-'.$product->id),
        'sku' => $product->product_code ?: ('ecom2-'.$product->id),
        'description' => $product->description,
        'regular_price' => $regular,
        'sale_price' => $sale,
        'stock_quantity' => max(0, (int) $product->stock),
        'unit' => clip($product->pro_unit, 255),
        'is_published' => (int) $product->status === 1 && $product->approval_status === 'approved',
        'is_featured' => (int) $product->feature_product === 1,
        'is_best_seller' => (int) $product->topsale === 1,
        'is_flash_sale' => (int) $product->flashsale === 1,
        'is_free_shipping' => (int) $product->free_delivery === 1,
        'rating' => min(5, (float) $product->ratting),
        'meta_title' => clip($product->meta_title, 255),
        'meta_description' => clip($product->meta_description, 500),
        'meta_keywords' => clip($product->meta_keywords, 500),
        'created_at' => $product->created_at ?? now(),
        'updated_at' => $product->updated_at ?? now(),
    ]);
    $products++;

    $position = 0;
    foreach ($ecom->table('productimages')->where('product_id', $product->id)->orderBy('id')->get() as $image) {
        $path = publicPath($image->image);
        if (! $path) {
            continue;
        }
        DB::table('product_images')->insert([
            'product_id' => $newId,
            'path' => $path,
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

echo "categories={$categories} banners={$banners} products={$products} images={$images}\n";
