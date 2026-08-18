-- Deliberately narrow operational grants. Browser requests never use service_role.
grant select, update on public.profiles to service_role;
grant select, delete on public.fabrics to service_role;
grant select, delete on public.fabric_assets to service_role;
grant select, delete on public.configurations to service_role;
grant select, delete on public.fabric_imports to service_role;
grant select, delete on public.audit_log to service_role;
