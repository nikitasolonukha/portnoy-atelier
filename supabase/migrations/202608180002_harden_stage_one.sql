create extension if not exists pg_trgm;

alter table public.fabrics add constraint fabrics_article_not_blank check (btrim(article) <> '') not valid;
alter table public.fabrics add constraint fabrics_name_not_blank check (btrim(name) <> '') not valid;
alter table public.configurations add constraint configurations_settings_object check (jsonb_typeof(settings) = 'object') not valid;
alter table public.fabric_imports add column content_sha256 text;
alter table public.fabric_imports add column duplicate_strategy text not null default 'reject' check (duplicate_strategy in ('reject','upsert'));
alter table public.fabric_imports add constraint fabric_import_counts_nonnegative check (total_rows >= 0 and valid_rows >= 0 and invalid_rows >= 0 and created_rows >= 0 and updated_rows >= 0) not valid;

create unique index fabrics_article_case_insensitive_idx on public.fabrics(lower(article));
create index fabrics_name_search_idx on public.fabrics using gin(name gin_trgm_ops);
create index fabrics_article_search_idx on public.fabrics using gin(article gin_trgm_ops);
create index audit_log_entity_idx on public.audit_log(entity_type, entity_id, created_at desc);
create index audit_log_actor_idx on public.audit_log(actor_id, created_at desc);
create unique index completed_import_content_idx on public.fabric_imports(created_by, content_sha256) where status = 'completed' and content_sha256 is not null;
create unique index fabric_asset_storage_path_idx on public.fabric_assets(storage_path);

create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger fabrics_set_updated_at before update on public.fabrics for each row execute function public.set_updated_at();
create trigger configuration_options_set_updated_at before update on public.configuration_options for each row execute function public.set_updated_at();
create trigger configurations_set_updated_at before update on public.configurations for each row execute function public.set_updated_at();

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), 'employee')
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.validate_configuration_settings() returns trigger
language plpgsql set search_path = public as $$
declare setting record;
begin
  if jsonb_typeof(new.settings) <> 'object' then raise exception 'configuration settings must be an object' using errcode = '23514'; end if;
  for setting in select * from jsonb_each_text(new.settings)
  loop
    if not exists (
      select 1 from public.configuration_groups g
      join public.configuration_options o on o.group_id = g.id
      where g.key = setting.key and g.is_active = true and o.key = setting.value and o.is_active = true
    ) then
      raise exception 'invalid configuration option %.%', setting.key, setting.value using errcode = '23514';
    end if;
  end loop;
  return new;
end;
$$;
create trigger configurations_validate_settings before insert or update of settings on public.configurations for each row execute function public.validate_configuration_settings();

create or replace function public.write_audit_log() returns trigger
language plpgsql security definer set search_path = public as $$
declare record_id uuid; event_action text;
begin
  record_id := coalesce(new.id, old.id);
  event_action := case
    when tg_table_name = 'fabrics' and tg_op = 'INSERT' then 'fabric_created'
    when tg_table_name = 'fabrics' and tg_op = 'DELETE' then 'fabric_deleted'
    when tg_table_name = 'fabrics' and tg_op = 'UPDATE' and old.is_active and not new.is_active then 'fabric_archived'
    when tg_table_name = 'fabrics' and tg_op = 'UPDATE' then 'fabric_updated'
    when tg_table_name = 'configurations' and tg_op = 'INSERT' then 'configuration_created'
    when tg_table_name = 'configurations' and tg_op = 'DELETE' then 'configuration_deleted'
    else 'configuration_updated'
  end;
  insert into public.audit_log(actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), event_action, tg_table_name, record_id, jsonb_build_object('operation', tg_op));
  return coalesce(new, old);
end;
$$;
create trigger fabrics_audit after insert or update or delete on public.fabrics for each row execute function public.write_audit_log();
create trigger configurations_audit after insert or update or delete on public.configurations for each row execute function public.write_audit_log();

grant usage on schema public to authenticated;
grant select on public.profiles, public.fabrics, public.fabric_assets, public.configuration_groups, public.configuration_options, public.configurations, public.fabric_imports to authenticated;
grant insert, update on public.fabrics, public.fabric_assets, public.configurations, public.fabric_imports to authenticated;
grant delete on public.fabrics, public.fabric_assets, public.configurations to authenticated;
grant select on public.audit_log to authenticated;

alter table public.fabrics validate constraint fabrics_article_not_blank;
alter table public.fabrics validate constraint fabrics_name_not_blank;
alter table public.configurations validate constraint configurations_settings_object;
alter table public.fabric_imports validate constraint fabric_import_counts_nonnegative;
