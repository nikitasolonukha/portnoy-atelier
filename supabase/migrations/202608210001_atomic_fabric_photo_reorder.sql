-- Atomic fabric photo reorder with full-set conflict detection.
-- SECURITY INVOKER: RLS on fabric_assets still applies to the UPDATEs.

create or replace function public.reorder_fabric_photos(
  p_fabric_id uuid,
  p_ordered_ids uuid[]
)
returns setof public.fabric_assets
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_role public.app_role;
  v_current_ids uuid[];
  v_input_count integer;
  v_distinct_count integer;
  v_idx integer;
begin
  v_role := public.current_role();
  if v_role is distinct from 'admin' and v_role is distinct from 'tailor' then
    raise exception 'photo_order_forbidden'
      using errcode = '42501';
  end if;

  if p_fabric_id is null then
    raise exception 'photo_order_invalid'
      using errcode = '22023';
  end if;

  if p_ordered_ids is null then
    raise exception 'photo_order_invalid'
      using errcode = '22023';
  end if;

  v_input_count := coalesce(cardinality(p_ordered_ids), 0);
  if v_input_count = 0 then
    raise exception 'photo_order_invalid'
      using errcode = '22023';
  end if;

  select count(distinct asset_id)::integer
  into v_distinct_count
  from unnest(p_ordered_ids) as asset_id;

  if v_distinct_count <> v_input_count then
    raise exception 'photo_order_duplicate'
      using errcode = '22023';
  end if;

  select coalesce(array_agg(id order by sort_order, id), '{}'::uuid[])
  into v_current_ids
  from public.fabric_assets
  where fabric_id = p_fabric_id
    and type = 'photo';

  if coalesce(cardinality(v_current_ids), 0) <> v_input_count then
    raise exception 'photo_order_conflict'
      using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from unnest(p_ordered_ids) as requested(id)
    where requested.id <> all (v_current_ids)
  ) then
    raise exception 'photo_order_conflict'
      using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.fabric_assets
    where fabric_id = p_fabric_id
      and id = any (p_ordered_ids)
      and type <> 'photo'
  ) then
    raise exception 'photo_order_type_invalid'
      using errcode = '22023';
  end if;

  -- Two-phase update keeps intermediate sort_order values unique if a future unique index is added.
  update public.fabric_assets
  set sort_order = sort_order + 1000000
  where fabric_id = p_fabric_id
    and type = 'photo'
    and id = any (p_ordered_ids);

  for v_idx in 1 .. v_input_count loop
    update public.fabric_assets
    set sort_order = v_idx - 1
    where fabric_id = p_fabric_id
      and id = p_ordered_ids[v_idx]
      and type = 'photo';

    if not found then
      raise exception 'photo_order_conflict'
        using errcode = 'P0001';
    end if;
  end loop;

  return query
    select *
    from public.fabric_assets
    where fabric_id = p_fabric_id
      and type = 'photo'
    order by sort_order asc, id asc;
end;
$$;

revoke all on function public.reorder_fabric_photos(uuid, uuid[]) from public;
grant execute on function public.reorder_fabric_photos(uuid, uuid[]) to authenticated, service_role;

comment on function public.reorder_fabric_photos(uuid, uuid[]) is
  'Atomically reassigns contiguous photo sort_order values for one fabric; rejects stale or partial ID sets.';
