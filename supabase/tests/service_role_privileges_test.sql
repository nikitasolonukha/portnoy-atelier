begin;
create extension if not exists pgtap with schema extensions;
select plan(4);

select ok(has_table_privilege('service_role', 'public.profiles', 'UPDATE'), 'service role can prepare profile fixtures');
select ok(has_table_privilege('service_role', 'public.fabrics', 'DELETE'), 'service role can clean fabric fixtures');
select ok(has_table_privilege('service_role', 'public.configurations', 'DELETE'), 'service role can clean configuration fixtures');
select ok(has_table_privilege('service_role', 'public.audit_log', 'DELETE'), 'service role can clean audit fixtures');

select * from finish();
rollback;
