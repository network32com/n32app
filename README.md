# Network32 - Professional Dental Network Platform

Network32 is a professional networking and case-sharing platform designed exclusively for dental professionals. It enables dentists and clinic owners to showcase clinical cases, connect with peers, and discover expertise within the dental community.

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI
- **Database & Auth:** Supabase
- **State Management:** Zustand
- **Deployment:** Vercel

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Git

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd n32app
npm install
```

### 2. Environment Configuration

Copy the example environment file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Update `.env.local` with your actual values:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
n32app/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/
│   │   ├── backend/      # Server-side utilities
│   │   └── shared/       # Shared utilities and types
│   └── styles/           # Global styles
├── public/               # Static assets
└── docs/                 # Documentation
```

## 🧪 Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 📚 Documentation

For detailed project specifications and development roadmap, see:
- `/docs/specs.md` - Complete product requirements
- `/docs/todo.md` - Development task plan

## 🔒 Security & Compliance

Network32 is built with HIPAA-awareness and patient privacy in mind:
- All clinical cases require patient consent attestation
- Row Level Security (RLS) enabled on all database tables
- Secure authentication via Supabase Auth
- Content reporting and moderation system

## 🚢 Deployment

The application is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 📄 License

Proprietary - All rights reserved

## 👥 Contributing

This is a private project. For questions or contributions, contact the development team.
