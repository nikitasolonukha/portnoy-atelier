create or replace function public.has_active_profile()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and is_active = true
  )
$$;

revoke all on function public.has_active_profile() from public;
grant execute on function public.has_active_profile() to authenticated, service_role;

drop policy "catalog authenticated read" on public.fabrics;
create policy "catalog authenticated read" on public.fabrics
for select to authenticated
using (public.has_active_profile());

drop policy "assets authenticated read" on public.fabric_assets;
create policy "assets authenticated read" on public.fabric_assets
for select to authenticated
using (public.has_active_profile());

drop policy "groups authenticated read" on public.configuration_groups;
create policy "groups authenticated read" on public.configuration_groups
for select to authenticated
using (public.has_active_profile() and (is_active = true or public.current_role() = 'admin'));

drop policy "options authenticated read" on public.configuration_options;
create policy "options authenticated read" on public.configuration_options
for select to authenticated
using (
  public.has_active_profile()
  and (
    public.current_role() = 'admin'
    or (
      is_active = true
      and exists (
        select 1 from public.configuration_groups
        where configuration_groups.id = configuration_options.group_id
          and configuration_groups.is_active = true
      )
    )
  )
);

drop policy "configurations own read" on public.configurations;
create policy "configurations own read" on public.configurations
for select to authenticated
using (public.has_active_profile() and (created_by = auth.uid() or public.current_role() in ('admin','tailor')));

drop policy "configurations own insert" on public.configurations;
create policy "configurations own insert" on public.configurations
for insert to authenticated
with check (public.has_active_profile() and created_by = auth.uid());

drop policy "configurations own update" on public.configurations;
create policy "configurations own update" on public.configurations
for update to authenticated
using (public.has_active_profile() and (created_by = auth.uid() or public.current_role() = 'admin'))
with check (public.has_active_profile() and (created_by = auth.uid() or public.current_role() = 'admin'));

drop policy "configurations own delete" on public.configurations;
create policy "configurations own delete" on public.configurations
for delete to authenticated
using (public.has_active_profile() and (created_by = auth.uid() or public.current_role() = 'admin'));

drop policy "imports own read" on public.fabric_imports;
create policy "imports own read" on public.fabric_imports
for select to authenticated
using (public.has_active_profile() and (created_by = auth.uid() or public.current_role() = 'admin'));

drop policy "fabric assets storage read" on storage.objects;
create policy "fabric assets storage read" on storage.objects
for select to authenticated
using (bucket_id = 'fabric-assets' and public.has_active_profile());
