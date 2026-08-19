begin;
create extension if not exists pgtap with schema extensions;
select plan(6);

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('10000000-0000-0000-0000-000000000101', 'authenticated', 'authenticated', 'active-admin@rls.test', '', now(), '{}', '{}', now(), now()),
  ('10000000-0000-0000-0000-000000000102', 'authenticated', 'authenticated', 'active-tailor@rls.test', '', now(), '{}', '{}', now(), now()),
  ('10000000-0000-0000-0000-000000000103', 'authenticated', 'authenticated', 'active-employee@rls.test', '', now(), '{}', '{}', now(), now()),
  ('10000000-0000-0000-0000-000000000104', 'authenticated', 'authenticated', 'inactive-admin@rls.test', '', now(), '{}', '{}', now(), now()),
  ('10000000-0000-0000-0000-000000000105', 'authenticated', 'authenticated', 'inactive-tailor@rls.test', '', now(), '{}', '{}', now(), now()),
  ('10000000-0000-0000-0000-000000000106', 'authenticated', 'authenticated', 'inactive-employee@rls.test', '', now(), '{}', '{}', now(), now());

update public.profiles set role = 'admin', is_active = true where id = '10000000-0000-0000-0000-000000000101';
update public.profiles set role = 'tailor', is_active = true where id = '10000000-0000-0000-0000-000000000102';
update public.profiles set role = 'employee', is_active = true where id = '10000000-0000-0000-0000-000000000103';
update public.profiles set role = 'admin', is_active = false where id = '10000000-0000-0000-0000-000000000104';
update public.profiles set role = 'tailor', is_active = false where id = '10000000-0000-0000-0000-000000000105';
update public.profiles set role = 'employee', is_active = false where id = '10000000-0000-0000-0000-000000000106';

insert into public.fabrics (id, article, name, created_by) values ('20000000-0000-0000-0000-000000000101', 'RLS-ACTIVE-1', 'RLS active fabric', '10000000-0000-0000-0000-000000000101');
insert into public.fabric_assets (fabric_id, type, storage_path, original_filename, mime_type) values ('20000000-0000-0000-0000-000000000101', 'photo', 'rls/active.png', 'active.png', 'image/png');
insert into public.configurations (name, created_by, fabric_id, settings) values
  ('Active admin config', '10000000-0000-0000-0000-000000000101', '20000000-0000-0000-0000-000000000101', '{}'),
  ('Active tailor config', '10000000-0000-0000-0000-000000000102', '20000000-0000-0000-0000-000000000101', '{}'),
  ('Active employee config', '10000000-0000-0000-0000-000000000103', '20000000-0000-0000-0000-000000000101', '{}'),
  ('Inactive admin config', '10000000-0000-0000-0000-000000000104', '20000000-0000-0000-0000-000000000101', '{}'),
  ('Inactive tailor config', '10000000-0000-0000-0000-000000000105', '20000000-0000-0000-0000-000000000101', '{}'),
  ('Inactive employee config', '10000000-0000-0000-0000-000000000106', '20000000-0000-0000-0000-000000000101', '{}');
insert into public.fabric_imports (filename, created_by) values
  ('active-admin.csv', '10000000-0000-0000-0000-000000000101'),
  ('active-tailor.csv', '10000000-0000-0000-0000-000000000102'),
  ('inactive-admin.csv', '10000000-0000-0000-0000-000000000104'),
  ('inactive-tailor.csv', '10000000-0000-0000-0000-000000000105');
insert into storage.objects (bucket_id, name, owner_id) values ('fabric-assets', 'rls/active.png', '10000000-0000-0000-0000-000000000101');

set local role authenticated;

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000101', true);
select is((select ((exists(select 1 from public.fabrics))::int + (exists(select 1 from public.fabric_assets))::int + (exists(select 1 from public.configuration_groups))::int + (exists(select 1 from public.configuration_options))::int + (exists(select 1 from public.configurations))::int + (exists(select 1 from public.fabric_imports))::int + (exists(select 1 from storage.objects where bucket_id = 'fabric-assets'))::int)::bigint), 7::bigint, 'active admin can read permitted business data and storage');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000102', true);
select is((select ((exists(select 1 from public.fabrics))::int + (exists(select 1 from public.fabric_assets))::int + (exists(select 1 from public.configuration_groups))::int + (exists(select 1 from public.configuration_options))::int + (exists(select 1 from public.configurations))::int + (exists(select 1 from public.fabric_imports))::int + (exists(select 1 from storage.objects where bucket_id = 'fabric-assets'))::int)::bigint), 7::bigint, 'active tailor can read permitted business data and storage');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000103', true);
select is((select ((exists(select 1 from public.fabrics))::int + (exists(select 1 from public.fabric_assets))::int + (exists(select 1 from public.configuration_groups))::int + (exists(select 1 from public.configuration_options))::int + (exists(select 1 from public.configurations where created_by = auth.uid()))::int + (exists(select 1 from storage.objects where bucket_id = 'fabric-assets'))::int)::bigint), 6::bigint, 'active employee can read permitted catalog, own configuration and storage');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000104', true);
select is((select ((exists(select 1 from public.fabrics))::int + (exists(select 1 from public.fabric_assets))::int + (exists(select 1 from public.configuration_groups))::int + (exists(select 1 from public.configuration_options))::int + (exists(select 1 from public.configurations))::int + (exists(select 1 from public.fabric_imports))::int + (exists(select 1 from storage.objects where bucket_id = 'fabric-assets'))::int)::bigint), 0::bigint, 'inactive admin cannot read business data or storage');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000105', true);
select is((select ((exists(select 1 from public.fabrics))::int + (exists(select 1 from public.fabric_assets))::int + (exists(select 1 from public.configuration_groups))::int + (exists(select 1 from public.configuration_options))::int + (exists(select 1 from public.configurations))::int + (exists(select 1 from public.fabric_imports))::int + (exists(select 1 from storage.objects where bucket_id = 'fabric-assets'))::int)::bigint), 0::bigint, 'inactive tailor cannot read business data or storage');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000106', true);
select is((select ((exists(select 1 from public.fabrics))::int + (exists(select 1 from public.fabric_assets))::int + (exists(select 1 from public.configuration_groups))::int + (exists(select 1 from public.configuration_options))::int + (exists(select 1 from public.configurations))::int + (exists(select 1 from public.fabric_imports))::int + (exists(select 1 from storage.objects where bucket_id = 'fabric-assets'))::int)::bigint), 0::bigint, 'inactive employee cannot read business data or storage');

select * from finish();
rollback;