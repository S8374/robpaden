<!-- BEGIN:nextjs-agent-rules -->

## Rules :
First Reade it than start worked .
1. Good Code structure follow and think a software engineering perspective.
2. large code split small file and split simple folder.
3. Re useable function code and component for fast development and good code strututre .
4. When creating any backend API, you MUST create corresponding Bruno API Collections inside `Robpaden_Api_Collections` in a specific module folder. In this `AGENTS.md` file, you must explicitly document exactly which API endpoints (method and path) were built and confirm that their Bruno collections exist.

## Worked Done :
--> Split Prisma schema into multiple files inside src/prisma/modules and configured Prisma 5.22.0 to support prismaSchemaFolder.
--> Fixed TypeScript and Prisma client import errors by redirecting output safely to node_modules/@prisma/client.
--> Created src/prisma/seed.ts to automatically seed the database with a Super Admin using DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD environment variables.
--> Successfully executed database push and ran seed script to create the Super Admin.
--> Migrated the hardcoded permissions array to a fully normalized Permission database table with a many-to-many relationship to the User model, supporting dynamic API addition of new permissions.
--> Renamed all 'Seller' and 'SELLER' terminology in the Prisma schema to 'Agent' and 'AGENT' to accurately match the project documentation.
--> Restructured the database architecture to support Companies, Teams, and Invitations. Managers can now create Teams with specific monthly targets and assign Agents with Team Roles (LEADER, CO_LEADER, MEMBER).
--> Built the Super Admin Login API endpoint securely using jsonwebtoken and bcrypt.
--> Refactored the architecture by moving the Admin Login functionality out of the Auth Module into a dedicated AdminLoginModule (`src/Modules/admin/admin-login`).
--> Built the Super Admin Login API (`POST /admin/v1/auth/login`) securely using jsonwebtoken and bcrypt, with a corresponding Bruno collection (`Robpaden_Api_Collections/auth/Admin Login.yml`).
--> Built the Office Management module (`src/Modules/admin/office-management`) with full CRUD operations for Companies (Offices) and their specific settings.
--> Completed the following Office Management APIs and their matching Bruno Collections in `Robpaden_Api_Collections/admin/office-management`:
    - `POST /admin/v1/offices` (Create Office with Logo upload)
    - `GET /admin/v1/offices` (Get all Offices, ordered chronologically)
    - `GET /admin/v1/offices/stats` (Get statistics e.g. totalOffices)
    - `PATCH /admin/v1/offices/:id` (Update Office Settings and Logo)
    - `DELETE /admin/v1/offices/:id` (Delete Office and cascade delete settings)
--> Implemented RustFS S3-compatible image upload architecture (`src/lib/rustfs.ts` and `src/middleware/fileUpload.ts`) using AWS SDK v3 and Multer for in-memory processing.
--> Refactored the entire database architecture to use Auto-incrementing Integers for Primary Keys across all models (Company, User, Team, Report, Invitation, Sale, Permission, CompanySettings) replacing UUIDs for sequential IDs.
--> Updated all controllers, DTO validators, and relations to strictly enforce Integer typings for IDs.
--> Implemented chronological sorting by `createdAt: 'asc'` to the get offices API.
--> Built the User Management module (`src/Modules/admin/user-management`) with `EmailService` integration using `nodemailer` to send email invitations.
--> Completed the following User Management APIs and their matching Bruno Collections in `Robpaden_Api_Collections/admin/user-management`:
    - `POST /admin/v1/users/invite` (Create an Invitation, generate secure token, and send email with `FRONTEND_LINK`)
    - `GET /admin/v1/users` (List all users)
    - `GET /admin/v1/users/stats` (Get statistics for users, managers, agents, and pending invitations)
    - `GET /admin/v1/users/invitations` (List pending invitations)
--> Built the core Authentication module (`src/Modules/Auth`) to handle Manager and Agent onboarding and login.
--> Implemented robust `src/middleware/auth.ts` JWT Authentication middleware to protect endpoints and hydrate `req.user`.
--> Completed the following Auth APIs and their matching Bruno Collections in `Robpaden_Api_Collections/auth`:
    - `POST /auth/v1/accept-invite` (Accepts the invitation token, sets user password, creates `User`, assigns role and company, and clears `Invitation`. Auto-assigns `managerId` if invited by a MANAGER)
    - `POST /auth/v1/login` (Authenticates Managers and Agents, returns `jsonwebtoken` with role/companyId embedded)
    - `GET /auth/v1/me` (Returns the detailed profile of the currently authenticated user including their permissions, company, and team)
--> Built the `ManagerModule` (`src/Modules/Manager/agent-management`) allowing managers to invite and manage agents. All routes are protected by JWT and a strict `MANAGER` role guard.
--> Completed the following Manager Agent Management APIs and their matching Bruno Collections in `Robpaden_Api_Collections/manager/agent-management`:
    - `POST /manager/agents/invite` (Sends an email invitation to an Agent, inheriting the Manager's companyId)
    - `GET /manager/agents` (Returns all agents assigned to the authenticated Manager)
    - `POST /manager/agents/:id/assign` (Allows a Manager to assign an existing Agent within their Company to themselves)
--> Expanded the Prisma `Team` schema to support `dailyTarget` and `weeklyTarget` in addition to `monthlyTarget`.
--> Built the `ManagerTeamModule` (`src/Modules/Manager/team-management`) for complete team orchestration.
--> Completed the following Manager Team Management APIs and their matching Bruno Collections in `Robpaden_Api_Collections/manager/team-management`:
    - `POST /manager/teams` (Creates a Team with daily, weekly, and monthly targets)
    - `GET /manager/teams` (Lists all teams in the Manager's company, including members and their specific roles)
    - `PATCH /manager/teams/:teamId/members/:agentId` (Fully updates an assigned Agent's profile including their team hierarchy role, daily/weekly goals, name, and active status)
--> Created `performance.prisma` schema with `PerformanceRecord` (for storing pre-calculated Agent/Team aggregations) and `SalesAuditLog` (for immutable tracking of manual inputs).
--> Built the `ManagerPerformanceModule` (`src/Modules/Manager/performance`) to act as an automated cascading engine for sales tracking.
--> Completed the following Manager Performance APIs and their matching Bruno Collections in `Robpaden_Api_Collections/manager/performance`:
    - `POST /manager/performance/daily-sales` (Upserts Daily Agent sales, calculates difference, and automatically cascades changes to Weekly/Monthly Agent and Team aggregated records. Returns the fully computed dataset to the frontend for zero-reload UI updates)
    - `GET /manager/performance/history` (Returns a list of `SalesAuditLog` entries showing who added or updated sales and exactly what changed)
    - `GET /manager/performance/agent/:agentId` (Returns all cascaded performance records for a specific agent)
--> Built the Public TV Module (`src/Modules/TV`) to serve highly-optimized, read-only aggregated data to frontend TV applications.
--> Completed the following TV APIs and their matching Bruno Collections in `Robpaden_Api_Collections/tv-board`:
    - `GET /tv/board/:companyId` (Public API that fetches a massive payload including Company Settings (theme, logo), and pre-sorted Daily, Weekly, and Monthly Top Agents and Top Teams leaderboards with precise percentage progress tracking)
--> Refactored the User Management and Agent Management modules to directly create users instead of relying on an Invitation flow.
    - Updated `POST /admin/v1/users/invite` and `POST /manager/agents/invite` to accept `name` and `password`, directly create the user, and send an email with login credentials.
    - Removed `POST /auth/v1/accept-invite` as it is no longer needed.
--> Replaced bcrypt hashing with AES-256-CBC reversible encryption (`src/core/utils/encryption.ts`) for user passwords. Updated `admin-login.service.ts` and `user-management.service.ts` to encrypt and decrypt passwords, satisfying the requirement for the admin to view passwords in plaintext.
--> Implemented full CRUD endpoints for the User Management Module: `PUT /admin/v1/users/:id` (Update), `DELETE /admin/v1/users/:id` (Delete), and `PATCH /admin/v1/users/:id/status` (Block/Unblock).
--> Built a public unauthenticated /auth/branding/:id endpoint to fetch company names and logos for the frontend login screen.
--> Upgraded the EmailService HTML templates to actively fetch and embed the assigned company logo and name into the welcome email.
--> Made name optional in UserManagementDTO and assigned a dynamic email prefix fallback for newly created users.
--> Built the `AdminTeamModule` (`src/Modules/admin/team-management`) to give Super Admins full access to read and update Team assignments.
--> Configured the `AdminTeamModule` to correctly extend `BaseModule` for IgnitorApp compatibility and dependency injection.
--> Completed the following Admin Team APIs:
    - `GET /admin/v1/teams/:id` (Returns team details and all assigned members)
    - `PATCH /admin/v1/teams/:id/members/:memberId` (Allows Super Admins to update individual targets and roles)
    - `DELETE /admin/v1/teams/:id/members/:memberId` (Removes a member from a team)
--> Removed Team Management architecture: dropped Team tables and relations from Prisma schema, deleted AdminTeamModule and ManagerTeamModule, and cleaned up cascading and leaderboard logic in manager-performance and tv services.
