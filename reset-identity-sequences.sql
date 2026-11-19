-- Run after importing legacy rows with explicit IDs.
-- Safe for empty tables as well as populated tables.
DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'abandoned_checkouts',
    'activities',
    'banners',
    'blocked_devices',
    'blocked_ips',
    'blocked_phones',
    'brands',
    'categories',
    'contact_form_fields',
    'contact_message_values',
    'contact_messages',
    'coupons',
    'email_otps',
    'entries',
    'failed_jobs',
    'features',
    'jobs',
    'landing_pages',
    'migrations',
    'newsletter_subscribers',
    'order_downloads',
    'order_items',
    'orders',
    'product_images',
    'product_reviews',
    'product_variants',
    'products',
    'review_screenshots',
    'settings',
    'users',
    'vendor_orders',
    'vendor_withdrawals',
    'vendors'
  ]
  LOOP
    EXECUTE format(
      'SELECT setval(pg_get_serial_sequence(%L, %L), COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM public.%I',
      'public.' || table_name,
      'id',
      table_name
    );
  END LOOP;
END $$;
