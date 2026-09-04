
alter table public.jobs add column if not exists external_order_id text;
create unique index if not exists jobs_company_external_order_unique
 on public.jobs(company_id, external_order_id) where external_order_id is not null;
create unique index if not exists customers_company_email_unique
 on public.customers(company_id, email) where email is not null;
