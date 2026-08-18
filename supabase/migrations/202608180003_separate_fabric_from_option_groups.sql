alter table public.configurations disable trigger configurations_validate_settings;

update public.configurations
set settings = settings - 'fabric'
where settings ? 'fabric';

alter table public.configurations enable trigger configurations_validate_settings;

delete from public.configuration_groups
where key = 'fabric';

alter table public.configuration_groups
  add constraint configuration_groups_fabric_reserved
  check (key <> 'fabric') not valid;

alter table public.configuration_groups
  validate constraint configuration_groups_fabric_reserved;
