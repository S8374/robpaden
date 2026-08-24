<!-- BEGIN:nextjs-agent-rules -->
##  Rules : 
Must FOllows it step by step (all rules you do than start worked) :

1. First go to the c:/Sabbir/robpaden/project_files directory and analyze :
 --> Reade Projects_Details.pdf && main_worked_follow_this_projects.md  file .
 Clear your conception about the project , Than start worked and if you find any wrong which floows is not match my things and his follow than immediately ask me . (Don't change my things without ask me) .

2. If i say you worked frontend / backend  / admin :
 --> Than go to `frontend` folder or `backend` folder or `admin` folder (whiwh i said) --> reade AGENTS.md file . (Don't change my things without ask me) this file given instruction reade and do work .

 3. When you change and update anything : (Don't change my things without ask me) .
  --> Must Be update AGENTS.md file , Which things you change and update write in AGENTS.md file .(if you worked frontend / backend / admin must be update respective folder AGENTS.md file ) .

 4. Must Be followed good code struture  .

## Worked Done :
--> Update AGENTS.md file for frontend, backend and admin.
--> Extracted Admin Sidebar into separate component and designed it (`robpaden-admin/components/Sidebar.tsx`).
--> Updated Sidebar navigation items to accurately reflect the Call Center Sales Board concept (Live TV Board, Sales History, Agents, Reports).
--> Added "Managers" link to the Sidebar for Super Admin use.
--> Split Prisma schema into multiple files inside src/prisma/modules and successfully configured Prisma 5.22.0 to support prismaSchemaFolder.
--> Fixed TypeScript and Prisma client import errors by redirecting output safely to node_modules/@prisma/client.
--> Created src/prisma/seed.ts to automatically seed the database with a Super Admin using DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD environment variables.
--> Migrated the hardcoded permissions array to a fully normalized Permission database table with a many-to-many relationship to the User model, supporting dynamic API addition of new permissions.
--> Renamed all 'Seller' terminology in the backend schema to 'Agent' to match the PDF documentation.
--> Restructured the database architecture to support Companies, Teams, and Invitations. Managers can now create Teams with specific monthly targets and assign Agents with Team Roles (LEADER, CO_LEADER, MEMBER).
--> Built the Super Admin Login API endpoint securely using jsonwebtoken and bcrypt.
--> Refactored the architecture by moving the Admin Login functionality out of the Auth Module into a dedicated AdminLoginModule (`src/Modules/admin/admin-login`).
--> Created `Robpaden_Api_Collections/auth/Admin Login.yml` Bruno collection for testing the Admin login API.
--> Built the Office Management module (`src/Modules/admin/office-management`) to allow Super Admins to create and manage Companies (Offices) and their specific settings (e.g., daily targets, weekly goals, TV themes).
--> Created Bruno API Collections for Create Office, Get Offices, and Update Office Settings.
--> Implemented RustFS S3-compatible image upload architecture (`src/lib/rustfs.ts` and `src/middleware/fileUpload.ts`) using AWS SDK v3 and Multer for in-memory processing.
--> Refactored user addition flow: Admins and Managers now directly create users (providing name and password) instead of sending invitations. Users receive a welcome email with their credentials and a direct login link, eliminating the need for an 'accept-invite' step.
--> Connected the Admin Login API (`/admin/login`) to the admin frontend login page (`robpaden-admin/app/page.tsx`), adding loading states, error handling, and redirection to the dashboard.
--> Replaced bcrypt hashing with AES-256-CBC reversible encryption (`src/core/utils/encryption.ts`) to allow the Super Admin to view plain-text passwords in the dashboard, resolving user management requirements.
--> Built full CRUD API for User Management (`PUT`, `DELETE`, `PATCH /status`) in the backend.
--> Enhanced the Admin Dashboard User Management table (`robpaden-admin/app/dashboard/user-management/page.tsx`) by adding decrypted password visibility, an Actions column with Edit/Delete modals, and Block/Unblock toggles using RTK Query.
--> Built a public unauthenticated /auth/branding/:id endpoint to fetch company names and logos for the frontend login screen.
--> Upgraded the EmailService HTML templates to actively fetch and embed the assigned company logo and name into the welcome email.
--> Made 
ame optional in UserManagementDTO and assigned a dynamic email prefix fallback for newly created users.
--> Removed the required 'Full Name' input field from the Admin Dashboard's Create User Modal, streamlining the onboarding process.
--> Implemented an animated skeleton loader for the frontend login screen while fetching branding.
--> Dynamically configured the frontend to use NEXT_PUBLIC_API_URL for API fetching.
--> Enhanced the sizing and aesthetics of the dynamically loaded Office Logo in the frontend login page.
--> Refactored the frontend Manager Dashboard entirely to match the new UI mockups (SalesCards, GoalCards, AgentTables with pill-bars and solid pie slices).
--> Replaced standard loading states with fully animated skeleton loaders for all dashboard components to ensure a premium professional feel.
--> Built out the full Manager "Agents" page with RTK Query integrations (`GET`, `POST`, `PUT`, `DELETE`, `PATCH` status).
--> Implemented strict manager-level backend guards so managers can only modify the agents assigned to them.
--> Updated the `EmailService` to hide passwords and login instructions for Agents, directing them straight to an "Add Sales" token page instead of the main dashboard login.
--> Built out the full Team Management UI (`app/dashboard/teams/page.tsx`) including Redux API integrations (`GET`, `POST`, `PATCH`).
--> Added a "Teams" navigation item to the Manager Sidebar with the `Network` icon.
--> Implemented `CreateTeamModal` to allow managers to define team names and sales targets.
--> Implemented `ManageTeamMembersModal` to allow managers to dynamically assign agents to their teams and manage roles (`LEADER`, `CO_LEADER`, `MEMBER`).
--> Built `AdminTeamModule` in the backend (`src/Modules/admin/team-management`), extending `BaseModule` properly to support dependency injection.
--> Fixed TS compilation errors in the backend related to module structure and authentication middleware.
--> Implemented `team.api.ts` Redux integration in `robpaden-admin` with queries and mutations to fetch team details, update members, and remove members.
--> Built out the Admin Team Details UI (`app/dashboard/teams/[id]/page.tsx`) allowing Super Admins to fully view and edit team member targets and roles.
--> Redesigned the "Targets (D/W/M)" table column in the Admin dashboard into clear horizontal UI pills.
--> Removed the entire Team Management architecture across backend, admin frontend, and manager frontend as requested.
--> Overhauled the TV Board Dashboard (`app/tv/[companyId]/page.tsx`) to strictly match the provided high-contrast UI designs.
--> Fixed layout spacing and scaling issues across the TV Board (Team Goal, Daily Recognition, and Leaderboard components).
--> Increased sizing and visibility of TV Footer Action Cards while balancing the "POSITIVE ATTITUDE..." motto to prevent wrapping.
--> Improved visual whitespace in the TV Leaderboard to eliminate vertical squishing between rows.
--> Rounded the monthly progress bar in the TV Board Team Goal block for a modern pill-shape look.
--> Implemented Agent Sales Correction functionality, allowing managers to reverse or edit specific sales transactions directly from the dashboard sidebar.
--> Implemented Agent Sales Correction functionality, allowing managers to reverse or edit specific sales transactions directly from the dashboard sidebar.
--> Created new backend endpoints (`/audit-today`, `/reverse`, `/edit`) and dynamically linked them to the frontend using Redux RTK Query.
--> Migrated the entire Sales architecture to use the actual `Sale` table instead of the `SalesAuditLog`, ensuring that adding, reversing, and editing sales properly updates individual `Sale` records and correctly increments/decrements `PerformanceRecord` totals.
