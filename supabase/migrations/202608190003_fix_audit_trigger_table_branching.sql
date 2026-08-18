create or replace function public.write_audit_log() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  record_id uuid;
  event_action text;
begin
  if tg_op = 'DELETE' then
    record_id := old.id;
  else
    record_id := new.id;
  end if;

  if tg_table_name = 'fabrics' then
    if tg_op = 'INSERT' then
      event_action := 'fabric_created';
    elsif tg_op = 'DELETE' then
      event_action := 'fabric_deleted';
    elsif old.is_active and not new.is_active then
      event_action := 'fabric_archived';
    else
      event_action := 'fabric_updated';
    end if;
  elsif tg_table_name = 'configurations' then
    if tg_op = 'INSERT' then
      event_action := 'configuration_created';
    elsif tg_op = 'DELETE' then
      event_action := 'configuration_deleted';
    else
      event_action := 'configuration_updated';
    end if;
  else
    raise exception 'unsupported audited table %', tg_table_name;
  end if;

  insert into public.audit_log(actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), event_action, tg_table_name, record_id, jsonb_build_object('operation', tg_op));

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;
