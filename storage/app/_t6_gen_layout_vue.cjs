const fs = require('fs');
const path = require('path');

let header = fs.readFileSync(path.join(__dirname, '_t6_header_clean.html'), 'utf8');
let footer = fs.readFileSync(path.join(__dirname, '_t6_footer_clean.html'), 'utf8');
let page = fs.readFileSync(path.join(__dirname, '_t6_page_clean.html'), 'utf8');

// Take page through category tab section (~line 2000) — enough for hero + deals + tabs chrome
const pageLines = page.split('\n');
// Keep through ~line 1800 then close open wrappers roughly by appending closing divs later
let pageHero = pageLines.slice(0, 430).join('\n'); // coupon + hero row (cats/slider/today) start of today products
// Actually keep through deal section start and inject Vue products

// --- HEADER surgical dynamic bindings ---
header = header
  // Promo text
  .replace(
    /<span class="elementor-heading-title elementor-size-default">[\s\S]*?<\/span>/,
    '<span class="elementor-heading-title elementor-size-default">{{ topPromo }}</span>'
  )
  // Track order link
  .replace(/href="#"/, 'href="/track"')
  // Logo block
  .replace(
    /<a href="[^"]*">\s*<img[^>]*logoin6[^>]*>\s*<\/a>/i,
    `<Link href="/">
      <img width="153" height="37" :src="logoUrl" class="attachment-large size-large" :alt="siteName" />
    </Link>`
  )
  // Search form
  .replace(
    /<form method="GET"[\s\S]*?<\/form>/,
    `<form method="GET" action="/shop" @submit.prevent="submitSearch">
      <div class="search-wrapper">
        <input v-model="search" class="autosearch-input" type="search" size="50" autocomplete="off" placeholder="Search..." name="q" />
        <button class="elementor-icon elementor-search-form__submit button-search-pro form-button" type="submit" aria-label="Search">
          <i aria-hidden="true" class="fas fa-search"></i>
          <span class="elementor-screen-only">Search</span>
        </button>
      </div>
    </form>`
  )
  // Favorites links
  .replace(/href="whislist\.html"/g, 'href="/wishlist"')
  // Login
  .replace(
    /<a href="javascript:void\(0\);"[\s\S]*?<span>Login<\/span>\s*<\/a>/,
    '<Link :href="accountHref"><span>{{ auth.user ? \'Account\' : \'Login\' }}</span></Link>'
  )
  // Cart count
  .replace(/<span class="swe-cart-count">0<\/span>/g, '<span class="swe-cart-count">{{ cartCount }}</span>')
  // Cart checkbox → v-model
  .replace(
    /<input type="checkbox" id="woo-cart-224" class="input-toggle">/,
    '<input id="woo-cart-224" v-model="cartOpen" type="checkbox" class="input-toggle">'
  );

// Replace vertical mega menu LI list with Vue categories
header = header.replace(
  /<ul id="menu-verticle-menu" class="swg-elementor-menu swg-mega">[\s\S]*?<\/ul>/,
  `<ul id="menu-verticle-menu" class="swg-elementor-menu swg-mega">
    <li v-for="category in categories" :key="'dept-'+category.id" class="level1">
      <Link :href="categoryLink(category)" class="item-link elementor-item">
        <span class="have-title"><span class="menu-title">{{ category.name }}</span></span>
      </Link>
    </li>
  </ul>`
);

// Replace main horizontal nav items with Vue links (keep first few structure)
header = header.replace(
  /<ul id="menu-primary-menu"[^>]*>[\s\S]*?<\/ul>|<ul class="swg-elementor-menu">[\s\S]*?<\/ul>/,
  `<ul class="swg-elementor-menu">
    <li :class="{ active: isActive('/') }"><Link href="/" class="elementor-item">Home</Link></li>
    <li :class="{ active: isActive('/shop') }"><Link href="/shop" class="elementor-item">Shop</Link></li>
    <li :class="{ active: isActive('/blog') }"><Link href="/blog" class="elementor-item">Blog</Link></li>
    <li :class="{ active: isActive('/about') }"><Link href="/about" class="elementor-item">About</Link></li>
    <li :class="{ active: isActive('/contact') }"><Link href="/contact" class="elementor-item">Contact</Link></li>
  </ul>`
);

// Mini cart empty message area — inject Vue cart list
header = header.replace(
  /<p class="woocommerce-mini-cart__empty-message">[\s\S]*?<\/p>/,
  `<p v-if="!cartItems.length" class="woocommerce-mini-cart__empty-message">No products in the cart.</p>
  <ul v-else class="woocommerce-mini-cart cart_list product_list_widget">
    <li v-for="item in cartItems" :key="item.key" class="woocommerce-mini-cart-item mini_cart_item">
      <img :src="imageUrl(item.image)" width="50" height="50" :alt="item.name" />
      <Link :href="'/product/' + item.slug">{{ item.name }}</Link>
      <span class="quantity">{{ item.qty }} × {{ money(item.price, currency) }}</span>
      <a href="#" class="remove" @click.prevent="removeItem(item)">×</a>
    </li>
  </ul>
  <p v-if="cartCount > 0" class="woocommerce-mini-cart__total total"><strong>Subtotal:</strong> {{ money(cartSubtotal, currency) }}</p>
  <p v-if="cartCount > 0" class="woocommerce-mini-cart__buttons buttons">
    <Link href="/cart" class="button wc-forward">View cart</Link>
    <Link href="/checkout" class="button checkout wc-forward">Checkout</Link>
  </p>`
);

fs.writeFileSync(path.join(__dirname, '_t6_header_vue.html'), header);
console.log('header vue html', header.length);

// --- HOME: keep coupon + hero structure exactly, replace product loops & slider ---
// Extract lines 1-433 (through start of today products area)
let homeTop = pageLines.slice(0, 88).join('\n'); // through Today's view title area

// Replace product-categories UL with Vue
homeTop = homeTop.replace(
  /<ul class="product-categories[^"]*"[^>]*>[\s\S]*?<\/ul>/,
  `<ul class="product-categories" data-number="10" data-moretext="See More" data-lesstext="See Less">
    <li v-for="category in menuCats" :key="'pc-'+category.id" class="cat-item">
      <Link :href="'/category/' + category.slug">{{ category.name }}</Link>
    </li>
  </ul>`
);

// Replace revolution slider block with Vue hero
homeTop = homeTop.replace(
  /<div class="wp-block-themepunch-revslider">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/,
  `<div class="wp-block-themepunch-revslider">
    <div class="t6-rev">
      <div v-for="(banner, i) in banners" :key="banner.id || i" class="t6-rev__slide" :class="{ 'is-active': i === slideIndex }">
        <a :href="bannerLink(banner)"><img :src="bannerImage(banner)" :alt="banner.title || 'Slide'" width="830" height="420" /></a>
      </div>
      <div v-if="banners.length > 1" class="t6-rev__dots">
        <button v-for="(banner, i) in banners" :key="'dot-'+(banner.id||i)" type="button" :class="{ 'is-active': i === slideIndex }" @click="slideIndex = i" />
      </div>
    </div>
  </div>
  </div></div></div>`
);

fs.writeFileSync(path.join(__dirname, '_t6_home_top.html'), homeTop);
console.log('home top', homeTop.length);

// Extract more static decorative sections from page (banners after deal) — lines 1155-1800 approx as static chrome
const staticMid = pageLines.slice(1155, 1600).join('\n');
fs.writeFileSync(path.join(__dirname, '_t6_home_static_mid.html'), staticMid);
console.log('static mid', staticMid.length);

console.log('done — next step writes Vue files from these fragments');
