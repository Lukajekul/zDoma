-- T-38: patient QR login. The token is the Supabase password of <davcna>@zdoma.local
-- (Auth keeps only its hash). A copy is kept here so staff can reprint the same
-- prijavni listek and show "Pokaži QR za prijavo". Server-only: RLS on, no policies,
-- read and written only with the service role after an explicit permission check.

create table public.patient_qr_tokens (
  patient_id uuid primary key references public.profiles (id) on delete cascade,
  token text not null check (length(token) >= 22),
  created_at timestamptz not null default now()
);

alter table public.patient_qr_tokens enable row level security;
revoke all on public.patient_qr_tokens from anon, authenticated;

-- "Nova koda QR": sign the user out on every device. Service role only.
create function public.revoke_user_sessions(p_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from auth.refresh_tokens where user_id = p_user::text;
  delete from auth.sessions where user_id = p_user;
end;
$$;

revoke execute on function public.revoke_user_sessions(uuid) from public, anon, authenticated;
grant execute on function public.revoke_user_sessions(uuid) to service_role;
