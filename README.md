# TradeJournal Pro

A high-performance, utilitarian trading journal and analytics platform built with React and Supabase.

## Project Structure

```
/
├── index.html              # Entry point (Vite/React)
├── index.tsx               # Application root
├── App.tsx                 # Main application layout and routing
├── types.ts                # TypeScript definitions
├── metadata.json           # App metadata
├── supabase_schema.sql     # Database setup SQL
├── services/
│   └── tradeService.ts     # Supabase API interaction layer
├── lib/
│   └── supabaseClient.ts   # Supabase client initialization
├── utils/
│   └── analytics.ts        # Pure functions for calculating stats
├── components/
│   ├── TradeGrid.tsx       # Spreadsheet-style data entry
│   ├── AnalyticsCharts.tsx # Charts and data tables
│   └── ConditionsInput.tsx # Multi-select tag input
```

## Setup & Run Instructions

### 1. Supabase Project Setup

1.  Log in to [Supabase](https://supabase.com) and create a new project.
2.  Once the project is ready, go to the **SQL Editor** in the sidebar.
3.  Open the `supabase_schema.sql` file included in this repository.
4.  Copy the contents and paste them into the SQL Editor.
5.  Click **Run** to create the `trades` table, indexes, and RLS policies.
6.  Go to **Project Settings > API**.
7.  Copy the **Project URL** and **anon / public** key.

### 2. Environment Variables

Create a `.env` file in the root directory (or set these in your deployment platform):

```env
REACT_APP_SUPABASE_URL=your_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

*Note: The application includes a fallback configuration for demo purposes, but you should configure your own for private data persistence.*

### 3. How to Run Locally

This project uses modern ESM imports and React.

1.  **Install Dependencies** (if using a bundler like Vite):
    ```bash
    npm install
    ```
2.  **Start Development Server**:
    ```bash
    npm run dev
    ```
3.  Open `http://localhost:5173` (or the port shown in your terminal).

### 4. Deployment

The frontend is completely decoupled from the backend and can be deployed to any static host (Netlify, Vercel, Cloudflare Pages).

**Deploying to Vercel/Netlify:**

1.  Push this code to a GitHub repository.
2.  Import the repository in Vercel/Netlify.
3.  **Build Settings**:
    *   Framework Preset: Vite (or Create React App)
    *   Build Command: `npm run build`
    *   Output Directory: `dist` (or `build`)
4.  **Environment Variables**:
    *   Add `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` in the hosting dashboard settings.
5.  Deploy.

## Analytics Implementation

The analytics engine (`utils/analytics.ts`) computes metrics entirely on the client side to allow for instant filtering without database round-trips.

1.  **Model Performance**: Aggregates trades by `model` string. Calculates Win Rate (%) and Expectancy (Avg R).
2.  **Condition Impact**:
    *   Iterates through every unique condition tag found in the dataset.
    *   Calculates `Avg R` when the condition is PRESENT vs ABSENT.
    *   **Delta**: Shows the net positive/negative expectancy added by the condition.
3.  **Time Analysis**:
    *   Parses trade `time` into hourly buckets.
    *   Parses trade `date` to determine Day of Week.
    *   Generates an equity curve by cumulatively summing `r_multiple` over time.
4.  **Execution Quality**:
    *   **Efficiency**: `(Total Realized R / Total MFE) * 100` for winning trades.
    *   **MFE vs R**: Scatter plot to identify if you are exiting too early (leaving R on the table) or holding too long (turning wins to losses).
