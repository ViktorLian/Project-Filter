# 🚀 FlowPilot - Komplett Setup og Testing Guide (Norsk)

## Del 1: Hva Du Må Gjøre Selv (Kan Ikke Automatiseres)

### 1. **Kjør Supabase SQL-Schema** 
Du må kjøre databaseskriptene selv i Supabase SQL-editor:

1. Gå til https://app.supabase.com
2. Velg ditt prosjekt
3. Gå til **SQL Editor**
4. Åpne filen `prisma/supabase-setup.sql` fra kode-mappen
5. Kopier HELE innholdet
6. Lim inn i SQL-editoren
7. Klikk **Run** (grønn knapp øverst til høyre)

**Hva skjer:** Databasetabellene opprettes (leads, forms, invoices, lead_groups, email_campaigns, osv)

**Hvis du får feil:** "relation 'leads' already exists" - det er OK! Skriptene bruker `CREATE TABLE IF NOT EXISTS`, så det hopper over tabeller som finnes.

---

### 2. **Skaff API-Nøkler**

Du trenger disse nøklene:

#### A. OpenAI API-nøkkel (for Chatbot og Lead Analysis)
```
1. Gå til https://platform.openai.com
2. Logg inn (lag konto hvis du ikke har)
3. Gå til "API keys" i sidemenyen
4. Klikk "+ Create new secret key"
5. Kopier nøkkelen (ser slik ut: sk-proj-...)
6. Lim inn i .env.local som OPENAI_API_KEY
```

#### B. Stripe API Keys (for Betaling)
```
1. Gå til https://dashboard.stripe.com
2. Logg inn
3. Gå til "API keys" (Developers → API keys)
4. Du ser to nøkler:
   - "Publishable key" (begynner med pk_)
   - "Secret key" (begynner med sk_)
5. Kopier begge og legg inn:
   - STRIPE_SECRET_KEY (hemlig nøkkel)
   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (kan være offentlig)
```

#### C. Stripe Webhook Secret
```
1. I Stripe Dashboard, gå til "Webhooks" (under Developers)
2. Klikk "+ Add endpoint"
3. Legg inn URL: https://flowpilot.no/api/stripe/webhook
   (lokalt: http://localhost:3000/api/stripe/webhook)
4. Velg events: "checkout.session.completed"
5. Klikk "Add endpoint"
6. Kopier "Signing secret" (whsec_...)
7. Lim inn som STRIPE_WEBHOOK_SECRET i .env.local
```

#### D. SMTP-Credentials (for E-post)
Du kan bruke **Gmail gratis**:
```
1. Gå til https://myaccount.google.com/security
2. Slå på "Less secure app access" (eller bruk App Password)
3. I .env.local, legg inn:
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=din@gmail.com
   SMTP_PASS=ditt_passord_eller_app_password
   SMTP_SECURE=false
```

Eller bruk **Resend** (gratis):
```
1. Gå til https://resend.com
2. Lag konto
3. Kopier API-nøkkel
4. Legg inn som RESEND_API_KEY
```

---

### 3. **Oppdater .env.local**

Åpne `.env.local` og fyll inn alle REPLACE_ME-verdiene:

```env
# Eksempel:
OPENAI_API_KEY=sk-proj-YOUR_OPENAI_KEY_HERE
NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-YOUR_OPENAI_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
STRIPE_PRICE_LOOKUP_STARTER=price_1234567890
STRIPE_PRICE_LOOKUP_PRO=price_1234567891
STRIPE_PRICE_LOOKUP_ENTERPRISE=price_1234567892
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=din@gmail.com
SMTP_PASS=ditt_passord
```

---

## Del 2: Lokal Testing (Localhost)

### Start Utviklingsserver

```bash
cd c:\leads
npm run dev
```

Du skal se:
```
✓ Ready in 2.5s
✓ Fast Refresh enabled
→ Local:   http://localhost:3000
```

**Åpne browser:** http://localhost:3000

---

### Test Alle Nye Features

#### 1. **Prising-Side**
```
http://localhost:3000
Sjekk: Priser vises i NOK (799, 1999, 4990)
Klikk: "Abonner (månedlig)" eller "Betal 6 måneder"
```

#### 2. **PDF Invoice Generator**
```bash
# Test med curl:
curl -X POST http://localhost:3000/api/generate-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Ola Nordmann",
    "amount": 5000,
    "invoiceNumber": "INV-001",
    "businessName": "FlowPilot AS",
    "businessEmail": "hei@flowpilot.no",
    "dueDate": "2024-03-15"
  }'

# Eller åpne dashboard og generer derfra
```

#### 3. **AI Chatbot**
```
http://localhost:3000
Scroll ned, se "💬 FlowPilot Assistant"-knapp nederst til høyre
Klikk og skriv: "Hva koster Pro-planen?"
Bot skal svare på norsk!
```

#### 4. **Auto-Review Email**
```bash
curl -X POST http://localhost:3000/api/send-review-request \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Kari",
    "customerEmail": "kari@example.com",
    "businessName": "Snekker Ola AS",
    "userId": "user-uuid-here"
  }'

# Sjekk e-postboksen din for review-forespørsel
```

#### 5. **Lead Submission (Med Quota Check)**
```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "formId": "form-uuid",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+47 99999999",
    "answers": {}
  }'

# Hvis Starter-plan: Etter 100 leads får du HTTP 403 "Lead limit reached"
```

#### 6. **Form Creation (Med Quota Check)**
```bash
# Trenger session først
# Login på http://localhost:3000/login
# Deretter:
curl -X POST http://localhost:3000/api/forms \
  -H "Content-Type: application/json" \
  -H "Cookie: your_session_cookie" \
  -d '{
    "name": "Contact Form",
    "description": "Test form",
    "questions": [
      {
        "question_text": "What is your budget?",
        "question_type": "text",
        "required": true
      }
    ]
  }'

# Hvis Starter-plan: Etter 2 forms, får 403 "Form limit reached"
```

#### 7. **Chatbot API**
```bash
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hva er Enterprise-planen?"}
    ]
  }'

# Response: {"reply": "Enterprise-planen koster..."}
```

---

## Del 3: Deploy til Vercel

### Setup Vercel Secrets

1. Gå til https://vercel.com
2. Velg ditt FlowPilot-prosjekt
3. Gå til **Settings → Environment Variables**
4. Legg inn alle nøkler fra `.env.local`:

```
OPENAI_API_KEY = sk-proj-...
NEXT_PUBLIC_OPENAI_API_KEY = sk-proj-...
STRIPE_SECRET_KEY = sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_...
STRIPE_WEBHOOK_SECRET = whsec_...
STRIPE_PRICE_LOOKUP_STARTER = price_...
STRIPE_PRICE_LOOKUP_PRO = price_...
STRIPE_PRICE_LOOKUP_ENTERPRISE = price_...
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = din@gmail.com
SMTP_PASS = ditt_passord
SUPABASE_SERVICE_KEY = eyJ...
ZAPIER_WEBHOOK_URL = https://hooks.zapier.com/...
NEXTAUTH_SECRET = (generer ny: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
NEXTAUTH_URL = https://flowpilot.no
NEXT_PUBLIC_APP_URL = https://flowpilot.no
```

### Push til Git

```bash
cd c:\leads
git add .
git commit -m "Add Tier 4 features: invoices, chatbot, reviews, lead quotas"
git push origin main
```

**Vercel deployer automatisk!** ✅

---

## Del 4: Stripe Setup Produksjon

### Create Prices på Stripe

1. Gå til https://dashboard.stripe.com
2. **Products → Create product**

```
Starter (799 kr/mnd):
- Name: FlowPilot Starter
- Type: Service
- Price: 799 NOK
- Billing: Monthly
- Lookup key: starter

Pro (1999 kr/mnd):
- Name: FlowPilot Pro
- Type: Service
- Price: 1999 NOK
- Billing: Monthly
- Lookup key: pro

Enterprise (4990 kr/mnd):
- Name: FlowPilot Enterprise
- Type: Service
- Price: 4990 NOK
- Billing: Monthly
- Lookup key: enterprise
```

3. Kopier Price IDs og legg inn i Vercel env:
```
STRIPE_PRICE_LOOKUP_STARTER=price_1Abc...
STRIPE_PRICE_LOOKUP_PRO=price_2Def...
STRIPE_PRICE_LOOKUP_ENTERPRISE=price_3Ghi...
```

---

## Del 5: Zapier Integration (Allerede Satt Opp)

Zapier er allerede konfigurert! Men her er hva som skjer:

```
1. Lead fyller form → POST /api/leads
2. Backend sender webhook → ZAPIER_WEBHOOK_URL
3. Zapier mottar → Gjør automatisering:
   - Logger i Google Sheets
   - Sender auto-reply e-post
   - Sender alert til bedrift
```

**For å se Zapier-logger:**
- Gå til https://zapier.com/app/
- Velg ditt Zap
- Klikk "Logs"
- Se history av leads

---

## Oppsummering: Hva Er Bygget?

### ✅ Ferdig:
- [x] Prising-side (NOK, 6-mnd rabatt)
- [x] PDF Invoice Generator
- [x] AI Chatbot (FlowPilot info)
- [x] Auto-Review Email (Google Maps)
- [x] Lead & Form Quota Checks
- [x] Lead Groups + Email Campaigns
- [x] Churn Detection
- [x] Stripe Checkout (månedlig + 6-mnd)
- [x] Zapier Integration

### ⚠️ Trenger Produksjon-Setup:
- [ ] Kjør Supabase SQL
- [ ] Skaff OpenAI API-nøkkel
- [ ] Skaff Stripe API-nøkkler
- [ ] Setup SMTP (Gmail/Resend)
- [ ] Deploy til Vercel
- [ ] Test alle flows

---

## Troubleshooting

### "OPENAI_API_KEY is undefined"
→ Sjekk at du fylte inn `OPENAI_API_KEY` i `.env.local`

### "Stripe API failed"
→ Sjekk at `STRIPE_SECRET_KEY` starter med `sk_`

### "SMTP error: Authentication failed"
→ Hvis Gmail: Sjekk at du genererte App Password (ikke bare passord)

### "Lead limit reached" før forventet
→ Sjekk `subscription_plan` i Supabase users-tabell

---

## Support

**Spørsmål?** Kontakt: hei@flowpilot.no

**Kode-repo:** GitHub (push fra VS Code)

---

**Lykke til! 🚀**
