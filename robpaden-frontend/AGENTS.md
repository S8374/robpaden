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
