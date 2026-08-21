begin;
select plan(2);

select is(
  (select o.name from public.configuration_options o
    join public.configuration_groups g on g.id = o.group_id
   where g.key = 'jacket' and o.key = 'single'),
  'Однобортный',
  'jacket/single label is correct UTF-8 Russian'
);

select is(
  (select o.name from public.configuration_options o
    join public.configuration_groups g on g.id = o.group_id
   where g.key = 'lapel' and o.key = 'peak'),
  'Острые',
  'lapel/peak label is correct UTF-8 Russian'
);

select * from finish();
rollback;
