# ProjectFilter

**B2B SaaS for Construction Companies** - Pre-qualify project leads with custom intake forms, automated scoring, and lead management.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database
```bash
# Copy environment variables
cp .env.example .env

# Edit .env and add your PostgreSQL database URL
# DATABASE_URL="postgresql://user:password@localhost:5432/projectfilter"

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

### 3. Configure Environment Variables
Edit `.env` file:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for dev)
- `NEXT_PUBLIC_APP_URL` - Same as NEXTAUTH_URL

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📦 Features

✅ **Authentication** - Secure email/password login with NextAuth  
✅ **Custom Intake Forms** - Build forms with 9+ field types  
✅ **Lead Scoring** - Automatic qualification based on weighted answers  
✅ **Risk Detection** - Flag high-risk projects with red flag values  
✅ **Lead Management** - Full CRM with notes, status tracking  
✅ **Analytics** - Acceptance rates, average scores, performance metrics  
✅ **Public Forms** - Shareable URLs for customer submissions  
✅ **Company Scoping** - Multi-tenant architecture  

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js
- **UI:** Tailwind CSS + shadcn/ui
- **Validation:** Zod
- **Deployment:** Vercel-ready

## 📁 Project Structure

```
leads/
├── app/
│   ├── api/          # API routes
│   ├── dashboard/    # Protected dashboard pages
│   ├── forms/        # Public form pages
│   ├── login/        # Auth pages
│   └── register/
├── components/
│   ├── layout/       # Sidebar, Topbar
│   ├── leads/        # Lead components
│   ├── forms/        # Form builder & renderer
│   └── ui/           # shadcn components
├── lib/
│   ├── auth.ts       # NextAuth config
│   ├── prisma.ts     # Database client
│   ├── scoring.ts    # Lead scoring logic
│   └── automation.ts # Auto-qualification
└── prisma/
    └── schema.prisma # Database schema
```

## 🎯 Usage

### 1. Register Your Company
- Go to `/register`
- Create owner account
- Company gets unique slug

### 2. Create an Intake Form
- Dashboard → Forms → New Form
- Add questions (text, dropdown, etc.)
- Set score weights per question
- Configure red flag values

### 3. Share Form URL
- Copy public form URL: `/forms/{company-slug}/{form-slug}`
- Add to your website or share with customers
- Customers fill out form

### 4. Review Leads
- New leads auto-scored and appear in dashboard
- View detailed responses, scores, risk level
- Accept/reject leads
- Add notes for team collaboration

## 🔐 Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="generate-with-openssl"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Database Options
- **Supabase** (recommended for free tier)
- **Neon** (serverless PostgreSQL)
- **Railway**
- **AWS RDS**

## 📊 Scoring System

Each question can have:
- **Weight** - Points added to total score
- **Red Flags** - Specific answers that trigger rejection
- **Required** - Enforce completion

Leads are automatically:
- ✅ **Accepted** - High score, no red flags
- ⚠️ **Reviewed** - Medium score
- ❌ **Rejected** - Below threshold or red flag triggered

## 🔧 Customization

### Adjust Score Thresholds
Edit `lib/scoring.ts`:
```ts
const minAcceptedScore = 10; // Change threshold
```

### Add Custom Email Notifications
Edit `lib/notifications.ts` to integrate SendGrid, Resend, etc.

### Extend Database Schema
Edit `prisma/schema.prisma` and run:
```bash
npx prisma migrate dev --name your_migration_name
```

## 📝 TODO (Future Enhancements)

- [ ] Stripe billing integration
- [ ] Email notifications (SendGrid/Resend)
- [ ] File upload support
- [ ] Export leads to CSV/PDF
- [ ] Webhook integrations
- [ ] Team member invitations
- [ ] Mobile app
- [ ] Advanced analytics charts

## 🤝 Contributing

This is an MVP. Feel free to fork and extend!

## 📄 License

MIT

---

**Built with ❤️ for construction companies who want better leads**
