begin;
create extension if not exists pgtap with schema extensions;
select plan(4);

select has_column('public', 'fabric_imports', 'skipped_rows', 'import ledger stores skipped rows');
select has_column('public', 'fabric_imports', 'failed_rows', 'import ledger stores failed rows');
select policies_are(
  'public',
  'fabric_imports',
  array['imports own read','imports staff create','imports own update'],
  'import ledger has exact read/create/update policies'
);
select col_default_is('public', 'fabric_imports', 'duplicate_strategy', '''skip''::text', 'skip is the safe default strategy');

select * from finish();
rollback;
