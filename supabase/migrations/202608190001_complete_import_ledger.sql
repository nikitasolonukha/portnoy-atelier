alter table public.fabric_imports
  drop constraint if exists fabric_imports_duplicate_strategy_check;

update public.fabric_imports
set duplicate_strategy = case duplicate_strategy
  when 'upsert' then 'update'
  when 'reject' then 'skip'
  else duplicate_strategy
end;

alter table public.fabric_imports
  alter column duplicate_strategy set default 'skip';

alter table public.fabric_imports
  add constraint fabric_imports_duplicate_strategy_check
  check (duplicate_strategy in ('update', 'skip')) not valid;

alter table public.fabric_imports
  add column skipped_rows integer not null default 0,
  add column failed_rows integer not null default 0;

alter table public.fabric_imports
  add constraint fabric_import_outcome_counts_nonnegative
  check (skipped_rows >= 0 and failed_rows >= 0) not valid;

create policy "imports own update"
on public.fabric_imports
for update
to authenticated
using (created_by = auth.uid() and public.current_role() in ('admin','tailor'))
with check (created_by = auth.uid() and public.current_role() in ('admin','tailor'));

create or replace function public.write_import_audit_log() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.status is distinct from new.status and new.status in ('completed', 'failed') then
    insert into public.audit_log(actor_id, action, entity_type, entity_id, metadata)
    values (
      auth.uid(),
      'fabric_imported',
      'fabric_imports',
      new.id,
      jsonb_build_object(
        'status', new.status,
        'created', new.created_rows,
        'updated', new.updated_rows,
        'skipped', new.skipped_rows,
        'failed', new.failed_rows
      )
    );
  end if;
  return new;
end;
$$;

create trigger fabric_imports_audit
after update of status on public.fabric_imports
for each row execute function public.write_import_audit_log();

alter table public.fabric_imports validate constraint fabric_imports_duplicate_strategy_check;
alter table public.fabric_imports validate constraint fabric_import_outcome_counts_nonnegative;
