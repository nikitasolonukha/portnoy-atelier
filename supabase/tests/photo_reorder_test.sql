begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '30000000-0000-0000-0000-000000000301',
  'authenticated', 'authenticated', 'photo-reorder@portnoy.local', '', now(),
  '{}'::jsonb, '{"full_name":"Photo reorder"}'::jsonb, now(), now()
);

update public.profiles
set role = 'admin', is_active = true, full_name = 'Photo reorder'
where id = '30000000-0000-0000-0000-000000000301';

insert into public.fabrics (id, article, name, created_by)
values ('30000000-0000-0000-0000-000000000f01', 'REORDER-1', 'Reorder fabric', '30000000-0000-0000-0000-000000000301');

insert into public.fabric_assets (id, fabric_id, type, storage_path, original_filename, mime_type, sort_order) values
  ('30000000-0000-0000-0000-000000000a01', '30000000-0000-0000-0000-000000000f01', 'photo', 'reorder/a.png', 'photo-a.png', 'image/png', 0),
  ('30000000-0000-0000-0000-000000000a02', '30000000-0000-0000-0000-000000000f01', 'photo', 'reorder/b.png', 'photo-b.png', 'image/png', 1),
  ('30000000-0000-0000-0000-000000000a03', '30000000-0000-0000-0000-000000000f01', 'photo', 'reorder/c.png', 'photo-c.png', 'image/png', 2),
  ('30000000-0000-0000-0000-000000000a04', '30000000-0000-0000-0000-000000000f01', 'texture', 'reorder/tex.png', 'texture.png', 'image/png', 0);

insert into public.fabrics (id, article, name, created_by)
values ('30000000-0000-0000-0000-000000000f02', 'REORDER-2', 'Other fabric', '30000000-0000-0000-0000-000000000301');

insert into public.fabric_assets (id, fabric_id, type, storage_path, original_filename, mime_type, sort_order)
values ('30000000-0000-0000-0000-000000000a99', '30000000-0000-0000-0000-000000000f02', 'photo', 'reorder/other.png', 'other.png', 'image/png', 0);

set local role authenticated;
select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000301', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select lives_ok(
  $$select * from public.reorder_fabric_photos(
    '30000000-0000-0000-0000-000000000f01',
    array[
      '30000000-0000-0000-0000-000000000a03'::uuid,
      '30000000-0000-0000-0000-000000000a01'::uuid,
      '30000000-0000-0000-0000-000000000a02'::uuid
    ]
  )$$,
  'admin can reorder the full photo set atomically'
);

select results_eq(
  $$select original_filename from public.fabric_assets
    where fabric_id = '30000000-0000-0000-0000-000000000f01' and type = 'photo'
    order by sort_order$$,
  $$values ('photo-c.png'), ('photo-a.png'), ('photo-b.png')$$,
  'successful reorder writes contiguous sort_order from draft order'
);

select throws_ok(
  $$select * from public.reorder_fabric_photos(
    '30000000-0000-0000-0000-000000000f01',
    array[
      '30000000-0000-0000-0000-000000000a03'::uuid,
      '30000000-0000-0000-0000-000000000a03'::uuid,
      '30000000-0000-0000-0000-000000000a01'::uuid
    ]
  )$$,
  '22023',
  'photo_order_duplicate',
  'duplicate photo ids are rejected'
);

select throws_ok(
  $$select * from public.reorder_fabric_photos(
    '30000000-0000-0000-0000-000000000f01',
    array[
      '30000000-0000-0000-0000-000000000a03'::uuid,
      '30000000-0000-0000-0000-000000000a01'::uuid
    ]
  )$$,
  'P0001',
  'photo_order_conflict',
  'missing existing photo ids conflict without partial write'
);

select results_eq(
  $$select original_filename from public.fabric_assets
    where fabric_id = '30000000-0000-0000-0000-000000000f01' and type = 'photo'
    order by sort_order$$,
  $$values ('photo-c.png'), ('photo-a.png'), ('photo-b.png')$$,
  'failed reorder leaves previous sort_order unchanged'
);

select throws_ok(
  $$select * from public.reorder_fabric_photos(
    '30000000-0000-0000-0000-000000000f01',
    array[
      '30000000-0000-0000-0000-000000000a03'::uuid,
      '30000000-0000-0000-0000-000000000a01'::uuid,
      '30000000-0000-0000-0000-000000000a99'::uuid
    ]
  )$$,
  'P0001',
  'photo_order_conflict',
  'foreign fabric asset ids conflict'
);

select throws_ok(
  $$select * from public.reorder_fabric_photos(
    '30000000-0000-0000-0000-000000000f01',
    array[
      '30000000-0000-0000-0000-000000000a03'::uuid,
      '30000000-0000-0000-0000-000000000a01'::uuid,
      '30000000-0000-0000-0000-000000000a04'::uuid
    ]
  )$$,
  'P0001',
  'photo_order_conflict',
  'texture id instead of photo conflicts on full photo set'
);

select throws_ok(
  $$select * from public.reorder_fabric_photos(
    '30000000-0000-0000-0000-000000000f01',
    array[
      '30000000-0000-0000-0000-000000000a01'::uuid,
      '30000000-0000-0000-0000-000000000a02'::uuid,
      '30000000-0000-0000-0000-000000000a03'::uuid,
      '30000000-0000-0000-0000-000000000a04'::uuid
    ]
  )$$,
  'P0001',
  'photo_order_conflict',
  'including texture among four ids still conflicts against three photos'
);

select * from finish();
rollback;
