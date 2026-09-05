<!-- BEGIN:nextjs-agent-rules -->

## Rules :
First Reade it than start worked .
1. Good Code Structure Follow :
 --> large code split small file and split simple folder.

2. Must Followed Server Side randering for fast performance (Next.js ) .

3. Use Shadcn Colors and set a color global and use shadcn colors name .
4. Re useable function code and component for fast development .
5. Use Properly Loading  and Skeleton.
6. After Completed work must be formatted code (Prettier) and fix lint (ESlint) / errors (TSC).

## Worked Complete :
--> Complete redux setup (RTK) with TypeScript . (File structure `src/redux/`)
--> Built the highly customized `TV Live Screen` frontend at `app/tv/[companyId]/page.tsx` with:
    - Lightning abstract background image `public/images/tv-bg.png`.
    - Custom neon Tailwind Box-Shadows and Glow effects in `app/globals.css`.
    - Static Mock Data (MOCK_AGENTS) so the design can be viewed without a backend connection.
    - Exact UI matching for the Top 10 Leaderboard, Team Goals progress bar, Daily Recognition cards, and Bell Ringer sections.
--> Implemented an animated skeleton loader for the frontend login screen while fetching branding.
--> Dynamically configured the frontend to use NEXT_PUBLIC_API_URL for API fetching.
--> Enhanced the sizing and aesthetics of the dynamically loaded Office Logo in the frontend login page.
--> Removed Team Management UI: deleted app/dashboard/teams, components/dashboard/teams, and redux/api/team.api.ts. Removed Team Goals widget from the TV Board page.
--> Fixed `z-index` layering issues in `AgentsTable` so that the Date Picker appears correctly beneath the agent Correction Sidebar.
--> Implemented "Remember Me" functionality in the manager frontend login page (`localStorage` saving/loading).
--> Built a complete 3-step "Forgot Password" flow (`app/forgot-password/page.tsx`).
--> Connected the new forgot password API endpoints to the frontend using RTK Query in `auth.api.ts`.
--> Refactored Admin User Details Page by extracting UI and logic into local _components and _hooks directories.
--> Refactored Admin Dashboard Overview by moving all dashboard widgets into components/dashboard/.
--> Created Bruno API Collections for the Manager Report module (/manager/reports/*).
--> Created Bruno API Collections for the Manager Notifications module (/notifications).
--> Fixed rendering issues in Manager Performance Bruno collections by converting legacy .bru files to the supported .yml format with corrected JSON bodies.
--> Refactored the frontend Forgot Password page (app/forgot-password/page.tsx) using the enterprise architecture, extracting the state into a useForgotPassword hook and splitting the UI into RequestOtpForm, VerifyOtpForm, and ResetPasswordForm components.
--> Implemented the live API connection for the TV Board (\pp/tv/[companyId]/page.tsx\) with support for multiple offices via URL path matching.
--> Updated the backend \	v.service.ts\ to calculate Team Goal progress, Daily Recognition (First Sale, Most Sale, Closest to Goal), and the live Bell Ringer.
--> Created \useGetTVBoardQuery\ in \edux/api/tv.api.ts\ with a 10-second polling interval for live TV updates.
--> Reverted the dynamic logo logic in the TV Board header to always use the fixed \/images/tvsidelogo.png\ (American Energy Advisors) per the client's visual requirements.
