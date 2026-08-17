<!-- BEGIN:nextjs-agent-rules -->

## Rules :
First Reade it than start worked .
1. Good Code Structure Follow :
 --> large code split small file and split simple folder.

2. Must Followed Server Side randering for fast performance (Next.js ) .
3. Use Shadcn Colors and set a color global and use shadcn colors name.
4. Re useable function code and component for fast development .
5. Use Properly Loading  and Skeleton.
6. After Completed work must be formatted code (Prettier) and fix lint (ESlint) / errors (TSC).

## Worked Complete :
--> Complete redux setup (RTK) with TypeScript . (File structure `src/redux/`).
--> Complete Login page design and build dashboard struture . (File structure `src/app/dashboard/` and `src/app/page.tsx`) .
--> Created Sidebar component by extracting it from layout to follow "large code split small file" rule . (File structure `components/Sidebar.tsx`) .
--> Extracted Admin Sidebar into separate component and designed it (`robpaden-admin/components/Sidebar.tsx`).
--> Updated Sidebar navigation items to accurately reflect the Call Center Sales Board concept.
--> Connected the Admin Login API (`/admin/login`) to the admin frontend login page (`robpaden-admin/app/page.tsx`), adding loading states, error handling, and redirection to the dashboard.
--> Enhanced the User Management table (`robpaden-admin/app/dashboard/user-management/page.tsx`) by adding an Actions column, Edit User Modal, Delete User Confirmation Modal, and Active/Blocked status toggle.
--> Added password visibility support to the User Management table, displaying decrypted passwords.
--> Updated `user.api.ts` with full CRUD RTK Query mutations (`useUpdateUserMutation`, `useDeleteUserMutation`, `useToggleUserStatusMutation`).
--> Added Next.js Middleware (`middleware.ts`) to strictly enforce route protection: redirects unauthorized users away from `/dashboard` to `/`, and redirects already logged-in users away from `/` to `/dashboard`.
--> Removed the required 'Full Name' input field from the Admin Dashboard's Create User Modal, streamlining the onboarding process.
--> Implemented `team.api.ts` RTK Query endpoints for fetching Admin team details, updating members, and removing members.
--> Built the Admin Team Details UI (`app/dashboard/teams/[id]/page.tsx`) giving Super Admins the ability to update team member targets (Daily, Weekly, Monthly) and roles (LEADER, CO_LEADER, MEMBER).
--> Enhanced the Team Members table with a modern UI, specifically redesigning the "Targets (D/W/M)" column to use horizontal flex pills for clarity.
--> Increased Z-index on `user-management` dropdowns to fix overlay stacking bugs.
--> Removed Team Management UI: deleted app/dashboard/teams and redux/api/team.api.ts, and stripped team assignment blocks from user management interfaces.
