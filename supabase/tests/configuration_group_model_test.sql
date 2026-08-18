begin;
create extension if not exists pgtap with schema extensions;
select plan(3);

select results_eq(
  $$ select count(*)::bigint from public.configuration_groups where key = 'fabric' $$,
  array[0::bigint],
  'fabric is not an option group'
);

select results_eq(
  $$ select count(*)::bigint from public.configuration_groups where is_active $$,
  array[6::bigint],
  'six suit option groups are active'
);

select results_eq(
  $$ select count(*)::bigint from public.configurations where settings ? 'fabric' $$,
  array[0::bigint],
  'fabric is stored only in fabric_id'
);

select * from finish();
rollback;
