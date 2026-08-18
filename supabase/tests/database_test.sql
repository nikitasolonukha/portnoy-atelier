begin;
create extension if not exists pgtap with schema extensions;
select plan(18);

select has_table('public', 'profiles', 'profiles exists');
select has_table('public', 'fabrics', 'fabrics exists');
select has_table('public', 'fabric_assets', 'fabric_assets exists');
select has_table('public', 'configuration_groups', 'configuration_groups exists');
select has_table('public', 'configuration_options', 'configuration_options exists');
select has_table('public', 'configurations', 'configurations exists');
select has_table('public', 'fabric_imports', 'fabric_imports exists');
select has_table('public', 'audit_log', 'audit_log exists');

select col_is_pk('public', 'fabrics', 'id', 'fabrics id is primary key');
select col_is_unique('public', 'fabrics', 'article', 'article has a unique constraint');
select has_index('public', 'fabrics', 'fabrics_article_case_insensitive_idx', 'article is case-insensitive unique');
select has_index('public', 'fabrics', 'fabrics_name_search_idx', 'fabric name supports indexed search');
select has_trigger('public', 'fabrics', 'fabrics_audit', 'fabric audit trigger exists');
select has_trigger('public', 'configurations', 'configurations_validate_settings', 'configuration DB validation exists');
select has_trigger('public', 'profiles', 'profiles_set_updated_at', 'profiles updated_at trigger exists');
select policies_are('public', 'fabrics', array['catalog authenticated read','catalog staff insert','catalog staff update','catalog admin delete'], 'fabric RLS policies are exact');
select policies_are('public', 'configurations', array['configurations own read','configurations own insert','configurations own update','configurations own delete'], 'configuration RLS policies are exact');
select results_eq('select count(*)::bigint from public.configuration_groups where is_active', array[7::bigint], 'all Stage 1 groups are seeded');

select * from finish();
rollback;
