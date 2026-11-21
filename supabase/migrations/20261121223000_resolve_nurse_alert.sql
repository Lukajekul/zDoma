-- Close one open alert and log the outcome together.
create function public.resolve_nurse_alert(p_alert_id uuid, p_action text)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  staff_id uuid := auth.uid();
  target_rehab uuid;
  resolved_time timestamptz := now();
begin
  if not public.is_staff() or p_action is null or p_action not in (
    'contacted_all_ok', 'visit_booked', 'gp_notified', 'plan_adjusted'
  ) then
    return false;
  end if;

  update public.alerts as alert
  set state = 'zaprto', action = p_action, resolved_by = staff_id, resolved_at = resolved_time
  where alert.id = p_alert_id
    and alert.state = 'odprto'
    and exists (
      select 1 from public.rehabilitacije as rehab
      where rehab.id = alert.rehab_id
        and rehab.status = 'aktivna'
        and public.today_lj() between rehab.start_date and rehab.end_date
    )
  returning alert.rehab_id into target_rehab;

  if not found then
    return false;
  end if;

  insert into public.audit_log (actor_id, action, entity, entity_id, details)
  values (
    staff_id,
    'alert_resolved',
    'alerts',
    p_alert_id,
    jsonb_build_object('rehab_id', target_rehab, 'outcome', p_action)
  );

  return true;
end;
$$;

revoke execute on function public.resolve_nurse_alert(uuid, text) from public, anon;
grant execute on function public.resolve_nurse_alert(uuid, text) to authenticated;
