# Zapier Integration Setup

## Oversikt
ProjectFilter sender automatisk nye leads til Zapier når de blir opprettet. Derfra kan Zapier sende dataene til Google Sheets, Slack, CRM, Email, etc.

## Environment Variables
Legg til i `.env.local` og Vercel:

```bash
ZAPIER_WEBHOOK_SECRET=din-hemmelige-nøkkel-her
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/XXXXX/XXXXX/
```

## Steg 1: Generer Webhook Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Legg denne inn som `ZAPIER_WEBHOOK_SECRET` i Vercel environment variables.

## Steg 2: Sett opp Zapier Zap

### Trigger (Step 1)
1. Velg "Webhooks by Zapier"
2. Velg "Catch Hook"
3. Kopier webhook URL du får
4. Legg inn som `ZAPIER_WEBHOOK_URL` i Vercel

### Action (Step 2+)
Velg hva du vil gjøre med dataene:

**Google Sheets:**
- App: Google Sheets
- Action: Create Spreadsheet Row
- Map fields:
  - customer_name → Navn
  - customer_email → E-post
  - customer_phone → Telefon
  - company_name → Bedrift
  - score → Score
  - dashboard_url → Link

**Slack:**
- App: Slack
- Action: Send Channel Message
- Message: `Ny lead: {{customer_name}} ({{customer_email}}) - Score: {{score}}`

**Email:**
- App: Email by Zapier
- Action: Send Outbound Email
- To: din-epost@bedrift.no
- Subject: `Ny lead: {{customer_name}}`
- Body: Bruk alle feltene fra lead

## Steg 3: Test Connection
```bash
curl -X GET \
  https://project-filter-woad.vercel.app/api/webhooks/zapier \
  -H "Authorization: Bearer DIN_WEBHOOK_SECRET"
```

Skal returnere:
```json
{
  "status": "ok",
  "message": "Zapier webhook is configured correctly",
  "timestamp": "2026-02-07T..."
}
```

## Data Format
Zapier mottar følgende data:

```json
{
  "lead_id": "uuid",
  "customer_name": "string",
  "customer_email": "string",
  "customer_phone": "string",
  "company_name": "string",
  "form_name": "string",
  "status": "NEW|CONTACTED|QUALIFIED|...",
  "score": 85,
  "risk_level": "LOW|MEDIUM|HIGH",
  "answers": {
    "question1": "answer1",
    "question2": "answer2"
  },
  "created_at": "2026-02-07T12:00:00Z",
  "dashboard_url": "https://project-filter-woad.vercel.app/dashboard/leads/uuid"
}
```

## Sikkerhet
- Webhook secret autentiserer alle requests
- Kun server-side kode har tilgang til secrets
- Zapier URL er hemmelig (ikke del den)

## Deployment
1. Legg til environment variables i Vercel
2. Commit og push kode
3. Vercel deployer automatisk
4. Test med en test-lead

## Troubleshooting
- Sjekk Vercel logs hvis webhook feiler
- Test Zapier URL med curl
- Verifiser at secrets er riktig satt i Vercel
