# Issue Tracker

A small issue tracking app. Users report issues and discuss them in comments. An admin assigns issues and moves them through Open, In Progress and Closed. The frontend is React (Vite) and the backend is Supabase. It is hosted on Vercel.

- Live app: https://issue-tracker-system-we83.vercel.app/login
- Source:GitHub repo URL: https://github.com/DINU-ROBIN/Issue-Tracker-System.git
- Requirements doc: Issue Tracker System - Business Requirements Document.pdf

## Demo accounts

| Role  | Login page     | Email                | Password            |
| ----- | -------------- | -------------------- | ------------------- |
| Admin | `/admin/login` | `<admin email>`      | `<admin password>`  |
| User  | `/login`       | `<user email>`       | `<user password>`   |

The database runs on the Supabase free plan, which pauses a project after about a week of inactivity. If the app shows errors or never finishes loading, open the Supabase dashboard and click Restore on the project.

## Features

Users
- Register and log in at `/register` and `/login`
- Create issues (title and description)
- Edit or delete their own issues
- Browse every issue, with a "My issues" filter
- Comment on any issue and delete their own comments
- Cannot assign issues or change status

Admins
- Separate login at `/admin/login`, no public registration
- Dashboard with total, open, in progress and closed counts
- Assign issues to users
- Change issue status
- Delete any issue or comment
- Comment on any issue

Sessions are kept in `sessionStorage`, so closing the tab or browser logs you out. A refresh keeps you logged in.

## Tech stack

- React and Vite for the frontend
- React Router for routing
- `@supabase/supabase-js` as the client
- Supabase for Postgres, Auth and the auto-generated REST API
- Vercel for hosting

Exact versions are in `package.json`.

## Architecture

There is no custom server. The browser talks straight to Supabase, and Row Level Security (RLS) in Postgres decides what each user is allowed to do. Hiding a button in the UI is only a convenience, the policies are the actual access control.

```text
Browser (React SPA on Vercel)
   |
   |  supabase-js
   v
Supabase
   |-- Auth       (email + password, JWT sessions)
   |-- Postgres   (profiles, issues, comments + RLS)
   `-- REST API   (PostgREST, generated from the tables)
```

Project layout:

```text
src/
  supabase.js            client setup
  AuthContext.jsx        session + profile (role) provider
  dashboardStyles.js     shared styles and status labels
  hooks/
    useIssues.js         loads issues and users
  components/
    ProtectedRoute.jsx   role-based route guard
    IssueCard.jsx        issue + role-specific controls
    IssueForm.jsx        create form
    EditIssueForm.jsx    edit form (title, description)
    CommentSection.jsx   comments on an issue
    StatCard.jsx         count card
  pages/
    Login.jsx            user login
    AdminLogin.jsx       admin login
    Register.jsx
    UserDashboard.jsx
    AdminDashboard.jsx
    IssueDetail.jsx
supabase/
  schema.sql             tables, trigger, grants and RLS policies
docs/
  BRD.md
vercel.json              SPA rewrite
```

## Routes

| Route          | What it is                  | Who can open it |
| -------------- | --------------------------- | --------------- |
| `/`            | Redirects by role           | Anyone          |
| `/login`       | User login                  | Anyone          |
| `/register`    | User registration           | Anyone          |
| `/admin/login` | Admin login                 | Anyone          |
| `/dashboard`   | User dashboard              | Users           |
| `/admin`       | Admin dashboard with counts | Admins          |
| `/issues/:id`  | Issue details               | Logged in       |

Each login page rejects the other role's accounts. An admin who tries the user login, or a user who tries the admin login, is signed out again with an error. The route guard also sends anyone who opens the wrong dashboard back to their own.

## Roles and permissions

| Action                     | User                | Admin |
| -------------------------- | ------------------- | ----- |
| View all issues            | yes                 | yes   |
| Create an issue            | yes                 | yes   |
| Edit title / description   | own issues          | no (UI) |
| Delete an issue            | own issues          | any   |
| Assign an issue            | no                  | yes   |
| Change status              | no                  | yes   |
| Comment on an issue        | yes                 | yes   |
| Delete a comment           | own comments        | any   |
| See dashboard counts       | no                  | yes   |

Assignment and status are also blocked for non-admins in the database by a trigger on `issues`, so calling the API directly does not get around it.

## Local setup

You need Node.js 18 or newer, npm, and a free Supabase account.

1. Clone the repo and install dependencies.

   ```sh
   git clone <repo url>
   cd issue-tracker
   npm install
   ```

2. Create a Supabase project and save the database password.

3. In the Supabase dashboard open the SQL Editor, paste the contents of `supabase/schema.sql` and run it.

4. Under Authentication, Sign In / Providers, open the Email provider. Keep the provider enabled and turn Confirm email off, then save. With confirmation on, signups depend on Supabase's built-in mailer, which allows only a few emails per hour.

5. Copy the Project URL and the anon (publishable) key from Project Settings, API.

6. Create your env file and fill in the two values (see below).

   ```sh
   cp .env.example .env
   ```

7. Start the dev server.

   ```sh
   npm run dev
   ```

   The app runs at http://localhost:5173.

### Creating the first admin

Admins are not created from the app. Add a user under Authentication, Users, Add user (tick Auto Confirm User), or register one normally, then promote it in the SQL Editor:

```sql
update profiles set role = 'admin' where email = 'admin@yourmail.com';
```

Always keep the `where` clause, otherwise every user becomes an admin. Then sign in at `/admin/login`.

## Environment variables

| Variable                 | Description                                             |
| ------------------------ | ------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | Supabase project URL, e.g. `https://xxxx.supabase.co`   |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon or publishable key                        |

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

Vite bundles every `VITE_*` value into the browser code, so only the public key goes here. Never use the `service_role` key or the database password in this project. `.env` is in `.gitignore`. Restart `npm run dev` after changing it.

## Database

The full setup is in `supabase/schema.sql`.

| Table      | Columns                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------- |
| `profiles` | `id` (same as `auth.users.id`), `email`, `full_name`, `role` (`user` or `admin`), `created_at` |
| `issues`   | `id`, `title`, `description`, `status`, `created_by`, `assignee_id`, `created_at`, `updated_at` |
| `comments` | `id`, `issue_id`, `author_id`, `body`, `created_at`                                      |

- `status` is an enum: `open`, `in_progress`, `closed`. New issues default to `open`.
- `issues.created_by` and `issues.assignee_id` reference `profiles.id`. The frontend relies on the default constraint names `issues_created_by_fkey` and `issues_assignee_id_fkey` for its joins, so don't rename them.
- `comments.issue_id` references `issues.id` and cascades on delete.
- A trigger on `auth.users` creates a `profiles` row with role `user` on every signup.
- RLS is enabled on all three tables. There is no update policy on `profiles`, so nobody can change their own role through the API.

## API usage

The app calls the Supabase client instead of its own endpoints.

| Area     | Call                                                                 | Used for                      |
| -------- | -------------------------------------------------------------------- | ----------------------------- |
| Auth     | `auth.signUp({ email, password, options: { data: { full_name } } })` | Registration                  |
| Auth     | `auth.signInWithPassword({ email, password })`                       | User and admin login          |
| Auth     | `auth.getSession()`, `auth.onAuthStateChange()`                      | Restoring the session         |
| Auth     | `auth.signOut()`                                                     | Logout                        |
| Profiles | `from('profiles').select(...)`                                       | Role lookup, assignee list    |
| Issues   | `from('issues').select('*, creator:..., assignee:...')`              | Issue lists and counts        |
| Issues   | `.insert()`, `.update()`, `.delete()`                                | Create, edit, assign, status, delete |
| Comments | `from('comments').select()`, `.insert()`, `.delete()`                | Issue discussion              |

## Deployment

The frontend is on Vercel and deploys from the `main` branch on GitHub. Supabase hosts the database and auth.

1. Push the repo to GitHub.
2. In Vercel choose Add New, Project and import the repo. The Vite defaults are fine (build `npm run build`, output `dist`).
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under Environment Variables, then deploy.
4. In Supabase go to Authentication, URL Configuration and set the Site URL to the Vercel URL.
5. Open the live URL and check registration, both logins, creating an issue, assigning it and commenting.

`vercel.json` rewrites every path to `index.html`, which is what lets a refresh on `/dashboard` or `/issues/3` work.

Updating: push to `main` and Vercel redeploys on its own. For schema changes, run the new SQL in the Supabase SQL Editor and add it to `supabase/schema.sql`.

## Scripts

| Command           | What it does                    |
| ----------------- | ------------------------------- |
| `npm run dev`     | Dev server with hot reload      |
| `npm run build`   | Production build into `dist/`   |
| `npm run preview` | Serve the production build locally |
| `npm run lint`    | Run ESLint                      |

## Troubleshooting

- White screen on start: check the browser console. A missing `.env`, or a page file with no default export, are the usual causes.
- "Invalid login credentials": wrong email or password, or the `.env` points at a different Supabase project.
- "Email not confirmed": the account was created while Confirm email was on. Fix it with
  `update auth.users set email_confirmed_at = now() where email_confirmed_at is null;`
- "Email rate limit exceeded": Confirm email is still on. Turn it off, or create the user from the Supabase dashboard with Auto Confirm User ticked.
- "Email logins are disabled": the Email provider itself got switched off. Turn it back on and keep only Confirm email off.
- Permission denied on a table: run the `grant` statements at the end of the table setup in `supabase/schema.sql`.
- Everything errors on the live site: the free Supabase project may be paused. Restore it from the dashboard.
