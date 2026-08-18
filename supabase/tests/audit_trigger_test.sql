begin;
create extension if not exists pgtap with schema extensions;
select plan(2);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000901',
  'authenticated', 'authenticated', 'audit-test@portnoy.local', '', now(),
  '{}'::jsonb, '{"full_name":"Audit test"}'::jsonb, now(), now()
);

select lives_ok(
  $$insert into public.configurations(name, created_by, settings)
    values ('Audit trigger regression', '00000000-0000-0000-0000-000000000901', '{"jacket":"single"}'::jsonb)$$,
  'configuration inserts do not access fabric-only fields'
);

select is(
  (select count(*)::bigint from public.audit_log where action = 'configuration_created' and entity_type = 'configurations'),
  1::bigint,
  'configuration creation is audited'
);

select * from finish();
rollback;
