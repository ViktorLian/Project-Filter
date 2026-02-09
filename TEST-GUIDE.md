# FlowPilot Test Guide

## Steg-for-steg testing av alle funksjoner

### 1. Forms (Skjemabygger)
1. Gå til `/dashboard/forms`
2. Klikk "New Form"
3. Fyll inn:
   - Form Name: "Boligprosjekt"
   - Description: "For nye boligprosjekter"
4. Legg til spørsmål:
   - Navn (text, required)
   - Email (email, required)
   - Prosjekttype (select: Nybygg, Påbygg, Renovering)
   - Budsjett (number)
5. Klikk "Create Form"
6. Kopier form URL (f.eks. `localhost:3000/f/abc123`)

### 2. Test Form (Fyll ut skjema)
1. Åpne form URL i ny fane (eller send til "kunde")
2. Fyll ut alle feltene
3. Submit
4. Sjekk at du får bekreftelses-melding

### 3. Leads (Se innsendte leads)
1. Gå tilbake til `/dashboard/leads`
2. Du skal nå se den nye leaden
3. Klikk på leaden for å se detaljer
4. Test:
   - Export CSV (laste ned alle leads)
   - Convert to Invoice (lage faktura fra lead)
   - Filter/søk funksjoner

### 4. CashFlow (Økonomioversikt)
1. Gå til `/dashboard/cashflow`
2. Legg til inntekt:
   - Amount: 50000
   - Description: "Prosjekt A - betaling"
   - Date: i dag
   - Type: INCOME
3. Legg til utgift:
   - Amount: 15000
   - Description: "Materialer"
   - Type: EXPENSE
4. Sjekk:
   - Health indicator (GREEN/YELLOW/RED)
   - Runway calculation (hvor lenge penger varer)
   - Charts/graphs

### 5. Invoices (Fakturaer)
1. Gå til `/dashboard/invoices`
2. Klikk "New Invoice"
3. Fyll inn:
   - Customer name & email
   - Line items (beskrivelse, pris, antall)
   - Due date
4. Klikk "Create & Send"
5. Sjekk:
   - PDF genereres
   - Email sendes til kunde
   - Status vises som "SENT"
6. Test å markere som "PAID"

### 6. Analytics
1. Gå til `/dashboard/analytics`
2. Se charts for:
   - Leads over tid (per uke/måned)
   - Revenue trends
   - Conversion rate (leads → invoices)
   - Top form performance

### 7. Settings
1. Gå til `/dashboard/settings`
2. Test:
   - Company info (navn, logo, adresse)
   - Billing settings (Stripe)
   - User management (legg til team members)
   - API keys for Zapier integrasjon

## Hva som skal fungere:

✅ **Landing page** - moderne design, pricing, contact form
✅ **Authentication** - login/register med email/password
✅ **Dashboard** - oversikt over alt
⏳ **Forms** - create, edit, share forms (må implementeres fullt)
⏳ **Leads** - capture, view, export (trenger form submission backend)
⏳ **CashFlow** - add entries, health calc, charts (må bygges)
⏳ **Invoices** - create PDF, send email (må implementeres)
⏳ **Analytics** - charts og metrics (må bygges)
⏳ **Settings** - alle innstillinger (må bygges)

## Kjente bugs/mangler:
- Forms viser tom liste (ingen forms laget enda)
- Leads viser tom liste (ingen data)
- Analytics mangler helt
- Settings mangler helt
- Invoice PDF generation ikke ferdig
- Email sending trenger SMTP config
