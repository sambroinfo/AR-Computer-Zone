const fs = require('fs');
const path = require('path');

const headerHtml = fs.readFileSync(path.join(__dirname, '_t6_header_vue.html'), 'utf8');
const homeTop = fs.readFileSync(path.join(__dirname, '_t6_home_top.html'), 'utf8');
const footerHtml = fs.readFileSync(path.join(__dirname, '_t6_footer_clean.html'), 'utf8')
  .replace(
    /src="\/layout6\/wp-content\/uploads\/2020\/10\/logoin6\.png"/,
    ':src="logoUrl"'
  )
  .replace(
    /<h4 class="elementor-heading-title elementor-size-default">AFFORDABLE QUALITY FUN SHOPPING<\/h4>/,
    '<h4 class="elementor-heading-title elementor-size-default">{{ followText }}</h4>'
  );

const layoutScript = `<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Link, router, usePage } from '@inertiajs/vue3';
import { imageUrl, listOf, money } from '@theme6/lib/utils';
import { wishlistCount as readWishlistCount } from '@theme6/lib/store';
import StorefrontInstall from '../../../Components/StorefrontInstall.vue';
import ThemePreviewBanner from '../../../Components/ThemePreviewBanner.vue';

defineProps({ title: { type: String, default: '' } });

const page = usePage();
const props = computed(() => page.props || {});
const site = computed(() => props.value.site || {});
const app = computed(() => props.value.app || {});
const footer = computed(() => props.value.footer || {});
const auth = computed(() => props.value.auth || { user: null });
const categories = computed(() => listOf(props.value.categories));
const cartItems = computed(() => listOf(props.value.cartItems));
const cartCount = computed(() => Number(props.value.cartCount || 0));
const cartSubtotal = computed(() => Number(props.value.cartSubtotal || 0));
const flash = computed(() => props.value.flash || {});
const currency = computed(() => app.value.currency_symbol || '৳');

const search = ref('');
const cartOpen = ref(false);
const toast = ref(null);
const wishlistCount = ref(readWishlistCount());

const siteName = computed(() => site.value.site_name || app.value.name || 'TopDeal');
const logoUrl = computed(() => String(app.value.logo_url || '').trim() || '/layout6/wp-content/uploads/2020/10/logoin6.png');
const accountHref = computed(() => (auth.value.user ? '/account' : '/login'));
const followText = computed(() => String(footer.value.tagline || footer.value.newsletter?.text || 'AFFORDABLE QUALITY FUN SHOPPING').trim() || 'AFFORDABLE QUALITY FUN SHOPPING');
// Exact TopDeal header promo (site long notices break the pixel layout)
const topPromo = 'Get an extra 10% off or more on select hotels with Member Pricing Join now, it’s free!';

const currentPath = computed(() => {
  try { return new URL(props.value.url || '/', window.location.origin).pathname; }
  catch { return '/'; }
});

function categoryLink(category) {
  return category?.slug ? \`/category/\${category.slug}\` : '/shop';
}
function isActive(path) {
  if (path === '/') return currentPath.value === '/';
  return currentPath.value === path || currentPath.value.startsWith(path + '/');
}
function submitSearch() {
  const q = search.value.trim();
  router.get('/shop', q ? { q } : {}, { preserveState: false });
}
function removeItem(item) {
  router.post('/cart/remove', { key: item.key }, { preserveScroll: true, preserveState: true });
}
function showToast(message, type = 'success') {
  toast.value = { message, type };
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => { toast.value = null; }, 4000);
}
function refreshWishlistCount() { wishlistCount.value = readWishlistCount(); }

watch(flash, (value) => {
  const message = value?.success || value?.error;
  if (message) showToast(message, value?.success ? 'success' : 'error');
});

onMounted(() => {
  window.addEventListener('theme6-wishlist-updated', refreshWishlistCount);
  refreshWishlistCount();
});
onBeforeUnmount(() => {
  window.removeEventListener('theme6-wishlist-updated', refreshWishlistCount);
});
</script>

<template>
  <ThemePreviewBanner />
  <div v-if="toast" class="t6-toast" :class="{ 'is-error': toast.type === 'error' }">{{ toast.message }}</div>
  <div class="body-wrapper theme-clearfix">
    <div class="body-wrapper-inner">
${headerHtml}

      <main class="t6-main">
        <slot />
      </main>

${footerHtml}
    </div>
  </div>
  <StorefrontInstall lang="en" />
</template>
`;

const homeScript = `<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { Link, usePage } from '@inertiajs/vue3';
import StorefrontLayout from '@theme6/Layouts/StorefrontLayout.vue';
import ProductCard from '@theme6/Components/Storefront/ProductCard.vue';
import { imageUrl, listOf } from '@theme6/lib/utils';

const props = defineProps({
  heroBanners: { type: Array, default: () => [] },
  flashProducts: { type: Array, default: () => [] },
  hotDealProducts: { type: Array, default: () => [] },
  sliderBottomBanners: { type: Array, default: () => [] },
  homepageAds: { type: Array, default: () => [] },
  homepageAds2: { type: Array, default: () => [] },
  hitDealBanners: { type: Array, default: () => [] },
  categoryPromoBanners: { type: Array, default: () => [] },
  homeCategories: { type: Array, default: () => [] },
  menuCategories: { type: Array, default: () => [] },
  allProducts: { type: Array, default: () => [] },
  allProductsTotal: { type: Number, default: 0 },
  brands: { type: Array, default: () => [] },
  flashSaleEndsAt: { type: String, default: null },
  hotDealEndsAt: { type: String, default: null },
});

const page = usePage();
const currency = computed(() => page.props.app?.currency_symbol || '৳');
const banners = computed(() => {
  const list = listOf(props.heroBanners);
  if (list.length) return list;
  return [
    { id: 's1', image: '/uploads/theme6/hero/slider61.jpg', link_url: '/shop', title: 'Slide 1' },
    { id: 's2', image: '/uploads/theme6/hero/slider62.jpg', link_url: '/shop', title: 'Slide 2' },
  ];
});
const menuCats = computed(() => {
  const menu = listOf(props.menuCategories);
  return menu.length ? menu : listOf(props.homeCategories);
});
const todayProducts = computed(() => listOf(props.allProducts).slice(0, 4));
const flashList = computed(() => {
  const flash = listOf(props.flashProducts);
  return flash.length ? flash : listOf(props.allProducts).slice(0, 6);
});
const hotList = computed(() => {
  const hot = listOf(props.hotDealProducts);
  return hot.length ? hot : listOf(props.allProducts).slice(0, 8);
});
const latestProducts = computed(() => listOf(props.allProducts).slice(0, 10));
const homeCats = computed(() => listOf(props.homeCategories));
const activeTab = ref(0);
const slideIndex = ref(0);
let slideTimer = null;
const tabCategories = computed(() => {
  const cats = homeCats.value.filter((c) => listOf(c.products).length);
  if (cats.length) return cats.slice(0, 6);
  return menuCats.value.slice(0, 6).map((c) => ({ ...c, products: latestProducts.value }));
});
const tabProducts = computed(() => {
  const cat = tabCategories.value[activeTab.value];
  const products = listOf(cat?.products);
  return (products.length ? products : latestProducts.value).slice(0, 10);
});
const collectionBanners = computed(() => {
  return [
    ...listOf(props.homepageAds),
    ...listOf(props.homepageAds2),
    ...listOf(props.sliderBottomBanners),
    ...listOf(props.categoryPromoBanners),
  ].filter((b) => b?.image).slice(0, 4);
});
function bannerImage(banner) { return banner?.image ? imageUrl(banner.image, banner?.title || 'banner') : ''; }
function bannerLink(banner, fallback = '/shop') { return banner?.link_url || fallback; }
function nextSlide() {
  if (!banners.value.length) return;
  slideIndex.value = (slideIndex.value + 1) % banners.value.length;
}
onMounted(() => { if (banners.value.length > 1) slideTimer = window.setInterval(nextSlide, 5000); });
onBeforeUnmount(() => { if (slideTimer) window.clearInterval(slideTimer); });
</script>

<template>
  <StorefrontLayout title="Home">
    <div class="container">
      <div class="row sidebar-row">
        <div id="contents" role="main" class="main-page col-lg-12 col-md-12 col-sm-12 col-xs-12">
          <div class="post-4337 page type-page status-publish hentry">
            <div class="entry-content">
              <div class="entry-summary">
${homeTop}
                            <div class="box-slider-title clearfix">
                              <h3 class="pull-left">Today's view</h3>
                              <Link class="view-more pull-right" href="/wishlist"><i class="fa fa-heart" aria-hidden="true"></i> Wishlist <i class="fa fa-angle-right" aria-hidden="true"></i></Link>
                            </div>
                            <div class="resp-slider-container">
                              <div class="slider responsive" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                                <ProductCard v-for="product in todayProducts" :key="'today-'+product.id" :product="product" :currency="currency" compact />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Deal of the day — TopDeal widget chrome -->
                <div class="elementor-element elementor-element-1f24f60 e-flex e-con-boxed e-con e-parent" data-id="1f24f60" data-element_type="container">
                  <div class="e-con-inner">
                    <div class="elementor-element elementor-element-536dd8d e-con-full e-flex e-con e-child" data-id="536dd8d" data-element_type="container">
                      <div class="elementor-element elementor-element-ce3f821 elementor-widget elementor-widget-wp-widget-sw_woo_slider_countdown_widget" data-id="ce3f821" data-element_type="widget">
                        <div class="elementor-widget-container">
                          <div class="sw-woo-container-slider responsive-slider countdown-slider7">
                            <div class="box-title">
                              <h3>Deal of the day</h3>
                              <p>Score up to 80% OFF while these deals last</p>
                            </div>
                            <div class="resp-slider-container">
                              <div class="slider responsive" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px">
                                <ProductCard v-for="product in flashList.slice(0,3)" :key="'deal-'+product.id" :product="product" :currency="currency" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="elementor-element elementor-element-a21701d e-con-full e-flex e-con e-child" data-id="a21701d" data-element_type="container">
                      <div class="elementor-widget-container" style="width:100%">
                        <a v-if="collectionBanners[0]" :href="bannerLink(collectionBanners[0])">
                          <img :src="bannerImage(collectionBanners[0])" alt="" style="width:100%;border-radius:10px;display:block;margin-bottom:12px" />
                        </a>
                        <a v-else href="/shop"><img src="/layout6/wp-content/uploads/2020/10/banner-right61.jpg" alt="" style="width:100%;border-radius:10px;display:block" /></a>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Category tabs -->
                <div class="elementor-element elementor-element-13a646e e-flex e-con-boxed e-con e-parent" data-id="13a646e" data-element_type="container">
                  <div class="e-con-inner">
                    <div class="elementor-element elementor-element-496aad5 e-con-full e-flex e-con e-child" data-id="496aad5" data-element_type="container">
                      <div class="sw-woo-tab-cat7 sw-ajax" style="width:100%;background:#fff;padding:12px;border:1px solid #eee">
                        <ul class="nav nav-tabs" style="display:flex;flex-wrap:wrap;gap:6px;list-style:none;padding:0;margin:0 0 16px">
                          <li v-for="(cat, i) in tabCategories" :key="cat.id || i">
                            <button type="button" :style="activeTab===i ? 'border:0;background:#ff5c00;color:#fff;padding:8px 14px;font-weight:600' : 'border:1px solid #eee;background:#fff;padding:8px 14px;font-weight:600'" @click="activeTab = i">{{ cat.name }}</button>
                          </li>
                        </ul>
                        <div class="slider responsive" style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px">
                          <ProductCard v-for="product in tabProducts" :key="'tab-'+product.id" :product="product" :currency="currency" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Static TopDeal banner strip from layout6 -->
                <div class="elementor-element elementor-element-391f6cf e-flex e-con-boxed e-con e-parent" data-id="391f6cf" data-element_type="container">
                  <div class="e-con-inner" style="display:flex;flex-wrap:wrap;gap:12px;width:100%">
                    <a href="/shop" style="flex:1;min-width:200px"><img src="/layout6/wp-content/uploads/2020/10/banner61.jpg" alt="" style="width:100%;border-radius:10px;display:block" /></a>
                    <a href="/shop" style="flex:1;min-width:200px"><img src="/layout6/wp-content/uploads/2020/10/banner62.jpg" alt="" style="width:100%;border-radius:10px;display:block" /></a>
                    <a href="/shop" style="flex:1;min-width:200px"><img src="/layout6/wp-content/uploads/2020/10/banner63.jpg" alt="" style="width:100%;border-radius:10px;display:block" /></a>
                    <a href="/shop" style="flex:1;min-width:200px"><img src="/layout6/wp-content/uploads/2020/10/banner64.jpg" alt="" style="width:100%;border-radius:10px;display:block" /></a>
                  </div>
                </div>

                <div class="elementor-element elementor-element-b4e9703 e-flex e-con-boxed e-con e-parent" data-id="b4e9703" data-element_type="container">
                  <div class="e-con-inner">
                    <div class="sw-wootab-slider sw-woo-tab-style4" style="width:100%;background:#fff;padding:16px;border:1px solid #eee">
                      <div style="display:flex;justify-content:space-between;margin-bottom:14px;border-bottom:1px solid #f0f0f0;padding-bottom:10px">
                        <h3 style="margin:0;font-size:20px;font-weight:700">Best Sellers</h3>
                        <Link href="/shop" style="color:#ff5c00;font-size:13px">View all</Link>
                      </div>
                      <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px">
                        <ProductCard v-for="product in hotList.slice(0,8)" :key="'hot-'+product.id" :product="product" :currency="currency" />
                      </div>
                    </div>
                  </div>
                </div>

                <div class="elementor-element e-flex e-con-boxed e-con e-parent">
                  <div class="e-con-inner">
                    <div style="width:100%;background:#fff;padding:16px;border:1px solid #eee;margin-bottom:24px">
                      <div style="display:flex;justify-content:space-between;margin-bottom:14px;border-bottom:1px solid #f0f0f0;padding-bottom:10px">
                        <h3 style="margin:0;font-size:20px;font-weight:700">Latest Products</h3>
                        <Link href="/shop" style="color:#ff5c00;font-size:13px">All products ({{ allProductsTotal || latestProducts.length }})</Link>
                      </div>
                      <div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px">
                        <ProductCard v-for="product in latestProducts" :key="'latest-'+product.id" :product="product" :currency="currency" />
                      </div>
                    </div>
                  </div>
                </div>

              </div></div></div></div></div></div>
  </StorefrontLayout>
</template>
`;

const outLayout = path.join(__dirname, '../../resources/js/themes/theme6/Layouts/StorefrontLayout.vue');
const outHome = path.join(__dirname, '../../resources/js/themes/theme6/Pages/Storefront/Home.vue');
fs.writeFileSync(outLayout, layoutScript);
fs.writeFileSync(outHome, homeScript);
console.log('wrote', outLayout, fs.statSync(outLayout).size);
console.log('wrote', outHome, fs.statSync(outHome).size);
