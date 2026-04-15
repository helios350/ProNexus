# ProNexus — Complete Project Context Document

> **Purpose**: This document captures the A-Z state of the ProNexus project as of April 3, 2026. It is designed so that any AI model or developer can pick up exactly where work left off with zero context loss.

---

## 1. What Is ProNexus?

ProNexus is a **centralized academic project management system** for a college. It manages the complete lifecycle of minor and major academic projects across three user roles: **Admin**, **Teacher**, and **Student**.

### Core User Flows

- **Admin** creates batches (academic cohorts), creates student/teacher accounts with assigned passwords, and manages all entities.
- **Teacher** creates projects (linked to batches), creates groups of students within a project (with problem statement, tech stack, mentor name), creates tasks/reviews, marks batch-wide attendance by date, and views student submissions.
- **Student** views their assigned projects and group details, submits files (PDF/PPT/DOC) for open tasks, and views their attendance history with calendar visualization.

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Framework** | React (Vite) | React 19.2.4, Vite 8.0.1 |
| **Language** | TypeScript | ~5.9.3 |
| **Styling** | Tailwind CSS v4 | 4.2.2 (via `@tailwindcss/vite` plugin) |
| **Routing** | React Router | 7.13.2 |
| **Icons** | Lucide React | 1.7.0 |
| **Backend** | Supabase (BaaS) | supabase-js 2.100.1 |
| **Database** | PostgreSQL 17 (hosted on Supabase) | |
| **Auth** | Supabase Auth (email+password) | |
| **Storage** | Supabase Storage (`submissions` bucket) | |
| **Edge Functions** | Deno (Supabase Edge Functions) | |

### Build Commands
```bash
npm run dev      # Start Vite dev server (localhost:5173)
npm run build    # tsc -b && vite build
npm run preview  # Preview production build
```

---

## 3. Project File Structure

```
C:/Users/Asus/Desktop/ProNexus/
├── DESIGN.md                    # "Kinetic Architect" design system spec
├── CONTEXT.md                   # THIS FILE
├── implementation_plan.md       # Original phased execution plan
├── backend_implementation_plan.md # Detailed backend integration plan
├── stitch.json                  # Stitch MCP project link
├── stitch_workflow.md           # Stitch UI generation workflow
├── stitch-skills-0.1/          # Stitch skills (enhance-prompt, stitch-loop, react-components)
├── next-prompt.md               # Stitch baton file for next generation
├── queue/                       # Staging area for Stitch output
├── pronexus/                    # The React application
│   ├── .env                     # Supabase URL + anon key
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── src/
│   │   ├── main.tsx             # React entrypoint (StrictMode → App)
│   │   ├── App.tsx              # BrowserRouter with all routes + ProtectedRoute guards
│   │   ├── index.css            # DESIGN SYSTEM: all color tokens, fonts, utilities
│   │   ├── lib/
│   │   │   └── supabase.ts      # Supabase client initialization
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx   # Auth state, session persistence, profile fetch
│   │   ├── hooks/
│   │   │   └── useAuth.ts       # Login hook (signInWithPassword + role redirect)
│   │   ├── data/                # MOCK DATA (mostly deprecated, used by some child components)
│   │   │   ├── mockData.ts      # Login page text content
│   │   │   ├── mockAdminData.ts # DEPRECATED — AdminSidebar no longer imports this
│   │   │   ├── mockTeacherData.ts # Still used by TeacherDashboard header
│   │   │   └── mockStudentData.ts # Type exports still used by ProjectHeroCard, TeamSection
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── AdminDashboard.tsx    # Live Supabase CRUD
│   │   │   ├── TeacherDashboard.tsx  # Live project data
│   │   │   ├── ProjectDetail.tsx     # Live groups/tasks/submissions
│   │   │   ├── StudentDashboard.tsx  # ✅ Live Supabase queries (was mock)
│   │   │   ├── StudentProjectDetail.tsx # ✅ NEW — group, tasks, file upload
│   │   │   └── StudentAttendance.tsx    # ✅ NEW — calendar, session log, stats
│   │   └── components/
│   │       ├── ProtectedRoute.tsx    # Role-based route guard
│   │       ├── Header.tsx            # Login page top nav
│   │       ├── Footer.tsx            # Login page footer
│   │       ├── LoginForm.tsx         # Email/password form
│   │       ├── AdminSidebar.tsx      # Collapsible sidebar (self-contained nav items)
│   │       ├── AdminHeader.tsx       # Top bar with batch context
│   │       ├── DashboardStats.tsx    # Admin stat cards
│   │       ├── BatchList.tsx         # Admin batch listing (static status mapping)
│   │       ├── ActiveEnrollment.tsx  # Admin student listing
│   │       ├── CreateBatchModal.tsx  # Modal: create batch (live insert)
│   │       ├── CreateUserModal.tsx   # Modal: create user (calls edge function)
│   │       ├── TeacherSidebar.tsx    # Teacher nav sidebar
│   │       ├── TeacherHeader.tsx     # Teacher top bar
│   │       ├── ProjectOverviewCard.tsx # Teacher project cards
│   │       ├── AttendanceLedger.tsx  # Teacher attendance grid (live upsert)
│   │       ├── CreateProjectModal.tsx # Teacher project creation
│   │       ├── CreateGroupModal.tsx  # Teacher group creation (with problem_statement)
│   │       ├── GroupCard.tsx         # Group display card
│   │       ├── TaskManager.tsx       # Task list with status toggling
│   │       ├── SubmissionsView.tsx   # Submission list viewer
│   │       ├── StudentSidebar.tsx    # Student nav sidebar
│   │       ├── StudentHeader.tsx     # Student top bar
│   │       ├── ProjectHeroCard.tsx   # Student active project with review timeline
│   │       ├── TeamSection.tsx       # Student team member list
│   │       ├── SubmissionPortal.tsx  # Student file upload placeholder
│   │       ├── BentoStats.tsx        # Student stat cards
│   │       ├── HistoricalProjects.tsx # Student past projects sidebar
│   │       └── BatchUpdates.tsx      # Student notification feed
│   └── temp/                    # Downloaded Stitch HTML references
└── supabase/                    # Edge function source (local copy)
```

---

## 4. Current Routes

```tsx
// src/App.tsx — ALL routes are protected by ProtectedRoute with role checks
<BrowserRouter>
  <AuthProvider>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

      {/* Teacher */}
      <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/project/:projectId" element={<ProtectedRoute role="teacher"><ProjectDetail /></ProtectedRoute>} />

      {/* Student */}
      <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/project/:id" element={<ProtectedRoute role="student"><StudentProjectDetail /></ProtectedRoute>} />
      <Route path="/student/attendance/:projectId" element={<ProtectedRoute role="student"><StudentAttendance /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </AuthProvider>
</BrowserRouter>
```

✅ Auth guards are fully implemented via `AuthContext` + `ProtectedRoute`.

---

## 5. Design System — "Kinetic Architect"

Full spec lives in `DESIGN.md`. Key rules:

- **No-Line Rule**: Sectioning via background color shifts, not borders.
- **Tonal Layering**: `surface` → `surface-container-low` → `surface-container-lowest` → `surface-container-high`.
- **Primary CTA Gradient**: 135° from `primary` (#2a14b4) to `primary-container` (#4338ca).
- **Glassmorphism**: Floating elements use `backdrop-blur-md` + 85% opacity white bg.
- **Typography**: Inter (headlines, body) + JetBrains Mono (IDs, codes, technical labels).
- **Sharp corners**: `0.125rem`–`0.75rem` max. No large border-radius.
- **Ghost Shadows**: `0 4px 20px -2px rgba(25,28,30,0.04), 0 2px 8px -2px rgba(25,28,30,0.02)`.
- **Status Badges**: Soft & Saturated — COMPLETED (`secondary_fixed`), ONGOING (`tertiary_fixed`), CLOSED (`surface_container_high`).

### CSS Token System (`src/index.css`)
All colors are defined as Tailwind v4 `@theme` variables. 40+ tokens total. Custom utilities include `.architectural-grid`, `.input-focus-ring`, `.primary-gradient`.

---

## 6. Supabase Configuration

### Project Details
| Field | Value |
|---|---|
| Project Name | ProNexus |
| Project ID | `zaqlzqswllgvgcyyvgui` |
| Region | `ap-southeast-1` |
| Status | `ACTIVE_HEALTHY` |
| Postgres | v17.6.1 |
| URL | `https://zaqlzqswllgvgcyyvgui.supabase.co` |

### Environment Variables (`.env`)
```
VITE_SUPABASE_URL=https://zaqlzqswllgvgcyyvgui.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphcWx6cXN3bGxndmdjeXl2Z3VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMDk5NTAsImV4cCI6MjA4OTU4NTk1MH0.iqE01bYua99l8QoepJjLDzytm1T1dRTGXBKlamInKy0
```

---

## 7. Database Schema (Live, Audited — April 3, 2026)

All 8 tables exist. RLS is ENABLED on every table.

### 7A. `profiles`
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, FK → `auth.users(id)` |
| `email` | text | |
| `full_name` | text | |
| `role` | text | `'admin'` / `'teacher'` / `'student'` |
| `roll_no` | text | UNIQUE (students only) |
| `contact` | text | (students only) |
| `batch_id` | uuid | FK → `batches(id)` (students only) |

### 7B. `batches`
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `name` | text | NOT NULL (e.g. "CSE-AIML 2023-27") |
| `created_at` | timestamptz | default `now()` |

### 7C. `projects`
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `title` | text | NOT NULL |
| `description` | text | |
| `batch_id` | uuid | FK → `batches(id)` |
| `created_by` | uuid | ✅ FK → `profiles(id)` (was `auth.users`, fixed) |
| `created_at` | timestamptz | default `now()` |

### 7D. `groups`
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `project_id` | uuid | FK → `projects(id)` |
| `name` | text | |
| `group_code` | text | |
| `problem_statement` | text | |
| `tech_stack` | text | |
| `mentor_name` | text | |

### 7E. `group_members`
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `group_id` | uuid | FK → `groups(id)`, UNIQUE(group_id, student_id) |
| `student_id` | uuid | FK → `profiles(id)`, UNIQUE(group_id, student_id) |

### 7F. `tasks`
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `project_id` | uuid | FK → `projects(id)` |
| `title` | text | NOT NULL |
| `deadline` | timestamptz | |
| `is_open` | boolean | default `true` |
| `created_at` | timestamptz | ✅ default `now()` (added April 3, 2026) |

### 7G. `submissions`
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `task_id` | uuid | FK → `tasks(id)` |
| `group_id` | uuid | FK → `groups(id)` |
| `file_url` | text | |
| `file_name` | text | |
| `file_type` | text | |
| `submitted_by` | uuid | FK → `profiles(id)` |
| `submitted_at` | timestamptz | default `now()` |

### 7H. `attendance_logs`
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `student_id` | uuid | FK → `profiles(id)` |
| `project_id` | uuid | FK → `projects(id)` |
| `date` | date | UNIQUE(`project_id`, `student_id`, `date`) |
| `status` | text | `'present'` / `'absent'` / `'excused'` |
| `marked_by` | uuid | FK → `profiles(id)` |

---

## 8. RLS Policies (Live)

### Helper Functions
```sql
get_my_role()        -- returns current user's role text from profiles
is_admin()           -- returns true if role = 'admin'
is_staff()           -- returns true if role IN ('admin', 'teacher')
is_group_member(uuid) -- returns true if current user is member of given group
handle_new_user()    -- TRIGGER on auth.users INSERT → upserts profiles row
                     -- ✅ Fixed: now uses ON CONFLICT DO UPDATE to preserve roll_no/contact/batch_id
```

### Policy Pattern
Every table follows this pattern:
- `Public Read [Table]` → SELECT for all `authenticated`, `qual: true`
- `Staff Modify [Table]` → ALL for `authenticated` where `is_staff()` = true

**Special policies:**
- `profiles`: "Users Update Own Profile" — UPDATE where `id = auth.uid()`
- `submissions`: "Students Insert/Update/Delete Own Group Submissions" — uses `get_my_role() = 'student' AND is_group_member(group_id)`. ✅ DELETE policy now correctly uses `authenticated` role (was `public`).

### Storage Policies (Consolidated)
4 clean policies on `storage.objects` for the `submissions` bucket:
- `Authenticated Read Submissions Files` (SELECT, authenticated)
- `Staff Upload Submissions` (INSERT, authenticated, is_staff())
- `Staff Delete Submissions` (DELETE, authenticated, is_staff())
- `Students Upload Submissions` (INSERT, authenticated, get_my_role() = 'student')

---

## 9. Edge Functions (Live)

### `create-sub-user` (v4, ACTIVE, verify_jwt: true)

**What it does**: Admin/teacher calls this to create new users. It:
1. Validates the caller is authenticated
2. Checks caller's `profiles.role` is `admin` or `teacher`
3. Prevents teachers from creating admin accounts
4. Creates auth user via `supabase.auth.admin.createUser()` with `email_confirm: true`
5. The `handle_new_user` trigger auto-creates the `profiles` row with all fields from metadata

**Fields accepted**: `email`, `password`, `role`, `firstName`, `lastName`, `batchId`, `rollNo`, `contact`

### `create-user` (v1, ACTIVE — LEGACY)
Not used by the frontend. Should be manually deleted from the Supabase dashboard.

---

## 10. Supabase Storage

- **Bucket**: `submissions` (private, `public: false`)
- **Path convention**: `{group_id}/{task_id}/{timestamp}_{filename}`
- **Max file size**: 20MB
- **Allowed types**: PDF, PPT, DOC
- **Storage RLS**: ✅ Fully configured (4 policies, see Section 8)

---

## 11. Current Frontend State

### Phase Completion Status
| Phase | Description | Status |
|---|---|---|
| A | Schema Migrations | ✅ Complete |
| B | Auth Context + Route Guards | ✅ Complete |
| C | Admin Live CRUD | ✅ Complete |
| D | Teacher Live Features | ✅ Complete |
| E | Student Live Features | ✅ Complete |

### What Works (All Roles)
- ✅ Login with email/password → auto-redirect to role dashboard
- ✅ Auth context with session persistence + profile fetching
- ✅ Role-based route guards (admin, teacher, student)
- ✅ Sign-out in all sidebars
- ✅ `npm run build` passes with zero TypeScript errors

### Admin
- ✅ Create batches (live insert)
- ✅ Create users via edge function (admin, teacher, student)
- ✅ View batches, students, stats from live DB
- ✅ Delete batches and users

### Teacher
- ✅ Create projects (linked to batch)
- ✅ View projects dashboard (live query)
- ✅ Project detail page with groups, tasks, submissions
- ✅ Create groups with student multi-select, problem statement, tech stack
- ✅ Create/toggle tasks with deadlines
- ✅ Mark attendance by date (upsert)
- ✅ View submissions per task/group

### Student
- ✅ Dashboard with live project, team, and stats data
- ✅ Project detail page with group info, task list, and file upload
- ✅ File upload to Supabase Storage with task selection
- ✅ Delete own submissions
- ✅ Attendance record page with calendar grid, session log, streaks, stats
- ✅ Navigation between dashboard ↔ project detail ↔ attendance

### Remaining Items (Non-Critical)
- ⚠️ Legacy `create-user` edge function still deployed (manual delete needed)
- ⚠️ `mockStudentData.ts` types still imported by `ProjectHeroCard`, `TeamSection`, `HistoricalProjects`, `BatchUpdates` (data is live, but type interfaces reference mock file)
- ⚠️ Admin delete only removes `profiles` row, not the `auth.users` entry
- ⚠️ Sidebar nav links are placeholder `<a href="#">` (navigation not wired to routes)

---

## 12. Design Decisions (Confirmed)

| Decision | Answer |
|---|---|
| Attendance scope | Teacher sees **entire batch**, picks a **date** via date picker |
| Attendance status | Text field: `'present'` / `'absent'` / `'excused'` |
| Mentor field in groups | **Free text** input, not a dropdown |
| Student selection in groups | **Multi-select dropdown** populated from the batch's student list |
| File types for submissions | **PDF, PPT, DOC** only |
| Max file size | **20MB** |
| Batch naming | Single `name` field (e.g. "CSE-AIML 2023-27"), not split |
| Student uniqueness | One `profiles` row, many `group_members` entries across projects |
| Password policy | Admin assigns password; no self-registration |

---

## 13. Stitch MCP Integration

ProNexus uses **Stitch** for UI generation. The Stitch project ID is `12165715772171747684`.

Existing screens in Stitch:
- `Admin Dashboard` (screen `65c0326da9a940ef9395e967d81770a6`)
- `Teacher Dashboard` (screen `a6013c4e6059482daef01e9a322f3c21`)
- `Student Dashboard` (screen `84791414571f44ef882ea6991352f6cd`)
- `Sign In - ProNexus` (screens `f66a55c795704c24bcd0d3e136ab011a`, `dbdf755a7efd4011b80e0587a38bf89e`)
- `Student Project Detail` (screen `1add8049546f492b8d2779252c5be832`) ✅ NEW
- `Attendance Record Detail` (screen `3f4719bb44a84729be6d9623bf610208`) ✅ NEW

Design system asset: `assets/b933d6f9e5a14e1faa140f217b40272f` (Kinetic Architect)

### Stitch Workflow
Follow `stitch_workflow.md` for any new UI generation:
1. `/enhance-prompt` — transform vague ideas into structured Stitch prompts
2. `/stitch-loop` — generate and iterate on designs
3. `/react-components` — convert Stitch output to modular React components

---

## 14. How to Resume Work

1. **Read this document** to understand the full project state.
2. **Read `DESIGN.md`** for the exact design language rules.
3. All backend phases (A–E) are complete. The project is in a **functional state** with live data across all three roles.
4. Use `npm run dev` (in `pronexus/`) to run the dev server on `localhost:5173`.
5. The Supabase MCP tools can be used to run SQL, deploy edge functions, and manage the project.
6. All React components follow the Kinetic Architect design system — maintain the no-line rule, tonal layering, Inter + JetBrains Mono typography, and primary gradient CTA style.
7. For new UI screens, follow the Stitch workflow documented in `stitch_workflow.md`.
