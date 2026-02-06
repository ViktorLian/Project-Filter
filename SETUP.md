# 🚀 SETUP GUIDE - ProjectFilter

## Trinn 1: Installer Dependencies
```bash
cd C:\leads
npm install
```

## Trinn 2: Sett opp Database

### Bruk Supabase (Anbefalt - Gratis)
1. Gå til [supabase.com](https://supabase.com)
2. Lag nytt prosjekt
3. Kopier Database URL fra Settings → Database
4. Lim inn i `.env`:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres"
```

### Eller Lokal PostgreSQL
```bash
# Installer PostgreSQL
# Opprett database: createdb projectfilter
DATABASE_URL="postgresql://postgres:password@localhost:5432/projectfilter"
```

## Trinn 3: Konfigurer Environment
```bash
# Kopier .env.example til .env
copy .env.example .env

# Generer secret
npx -y tsx -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Rediger .env og fyll inn:
# - DATABASE_URL (fra Supabase eller lokal)
# - NEXTAUTH_SECRET (generert over)
# - NEXTAUTH_URL="http://localhost:3000"
# - NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Trinn 4: Kjør Database Migrations
```bash
npx prisma generate
npx prisma migrate dev --name init
```

## Trinn 5: Start Prosjektet
```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000)

## 🎯 Første Gang Bruk

1. **Registrer bruker**: Gå til /register
2. **Lag et skjema**: Dashboard → Forms → New Form
3. **Legg til spørsmål**: Gi score-weights til viktige felt
4. **Del URL**: Kopier public form URL og test

## ✅ Ferdig!

Du har nå:
- ✅ Authentication system
- ✅ Form builder
- ✅ Lead scoring engine
- ✅ Dashboard og analytics
- ✅ Public intake forms

## 🚀 Deploy til Vercel

```bash
# Push til GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin [YOUR-REPO-URL]
git push -u origin main

# Gå til vercel.com
# Import repo
# Legg til env variables
# Deploy
```

## 📝 Hva mangler?

- Stripe billing (stub er klar)
- Email notifications (stub er klar)
- File uploads (felt finnes, trenger storage)

Alle core features er implementert og fungerer!
