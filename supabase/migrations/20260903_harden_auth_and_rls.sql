begin;

alter table public.contract_reminders enable row level security;
alter table public.customer_interactions enable row level security;
alter table public.job_expenses enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.recurring_bookings enable row level security;
alter table public.stripe_customers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.team_members enable row level security;

alter table public.users
  add column if not exists company_id uuid
  references public.leads_companies(id) on delete set null;

create index if not exists users_company_id_idx on public.users(company_id);

update public.users as u
set company_id = c.id
from public.leads_companies as c
where c.user_id = u.id
  and u.company_id is null;

drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile"
on public.users for select
to authenticated
using ((select auth.uid()) = auth_user_id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
on public.users for update
to authenticated
using ((select auth.uid()) = auth_user_id)
with check ((select auth.uid()) = auth_user_id);

drop policy if exists "Leads users can view company" on public.leads_companies;
create policy "Users can view own company"
on public.leads_companies for select
to authenticated
using (
  exists (
    select 1
    from public.users as u
    where u.auth_user_id = (select auth.uid())
      and coalesce(u.company_id, u.id) = leads_companies.id
  )
);

commit;
