# Team Task Manager — Frontend

Frontend built with Next.js, Tailwind CSS, and React Context API.

## Live URL

https://team-task-manager-frontend-mu.vercel.app

---

## Tech Stack

| Tech | Version |
|------|---------|
| Next.js | 16.2.4 |
| React | 19.2.4 |
| Tailwind CSS | 4 |
| Axios | 1.15.2 |

---

## Project Structure

```
frontend/
├── app/
│   ├── dashboard/page.js     # Dashboard with task stats
│   ├── login/page.js         # Login page
│   ├── signup/page.js        # Signup page
│   ├── projects/page.js      # Projects list + create
│   ├── tasks/page.js         # Kanban task board
│   ├── layout.js             # Root layout
│   └── page.js               # Redirects to /dashboard
├── components/
│   ├── AppShell.js           # Sidebar + layout wrapper
│   ├── Sidebar.js            # Navigation sidebar
│   └── ProtectedRoute.js     # Auth guard component
├── context/
│   └── AuthContext.js        # Global auth state
├── services/
│   └── api.js                # Axios instance
└── package.json
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env.local` file

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Run the app

```bash
npm run dev
```

App runs on `http://localhost:3000`

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/dashboard` |
| `/signup` | Register a new account |
| `/login` | Login to existing account |
| `/dashboard` | Task stats overview |
| `/projects` | Create and manage projects |
| `/tasks` | Kanban board per project |

---

## Deployment (Vercel)

1. Push to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Add environment variable in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend.vercel.app/api`

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
