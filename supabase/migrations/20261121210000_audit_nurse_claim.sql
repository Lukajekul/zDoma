-- Assign an available rehabilitacija and record the claim in one transaction.
create function public.claim_rehab(p_rehab_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  staff_id uuid := auth.uid();
begin
  if not public.is_staff() then
    return false;
  end if;

  update public.rehabilitacije
  set assigned_nurse_id = staff_id
  where id = p_rehab_id
    and assigned_nurse_id is null
    and status = 'aktivna'
    and start_date <= public.today_lj()
    and end_date >= public.today_lj();

  if not found then
    return false;
  end if;

  insert into public.audit_log (actor_id, action, entity, entity_id, details)
  values (
    staff_id,
    'rehab_claimed',
    'rehabilitacije',
    p_rehab_id,
    jsonb_build_object('assigned_nurse_id', staff_id)
  );

  return true;
end;
$$;

revoke execute on function public.claim_rehab(uuid) from public, anon;
grant execute on function public.claim_rehab(uuid) to authenticated;
