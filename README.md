# Veil

A poetry reading app for iOS and Android. Browse and read poems from your Notion database with a warm, paper-toned aesthetic and smooth animations.

## Features

- Library of poems pulled from Notion, sorted by date
- Fuzzy search across poem titles and content (powered by fuzzysort)
- Full-screen poem reader with estimated reading time
- Share poems natively via the system share sheet
- Pull-to-refresh and auto-refresh every 5 minutes
- Scroll-to-top button, animated success toasts, and haptic feedback
- About sidebar with writer info
- Warm paper aesthetic: `#FAF7F0` background, `#8B5A3C` primary, Libre Baskerville typography

## Tech Stack

- **Framework**: React Native + Expo (Expo Router)
- **Language**: TypeScript
- **Backend**: Notion API
- **Search**: fuzzysort
- **UI**: Custom StyleSheet, Libre Baskerville font, Feather icons
- **Animations**: React Native Reanimated, React Native Worklets

## Prerequisites

- Node.js 18+
- Expo CLI
- A Notion integration token and database ID
- iOS Simulator / Android Emulator or a physical device

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/darshan-regmi/veil.git
   cd veil
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure your Notion credentials in `utils/storage.ts`.

4. Start the dev server:
   ```bash
   pnpm run dev
   ```

## Project Structure

```
veil/
├── app/
│   ├── (tabs)/
│   │   └── index.tsx       # Poem library with search
│   ├── poem/[id].tsx       # Full-screen poem reader
│   └── _layout.tsx
├── components/
│   ├── NoteCard.tsx
│   └── AboutSidebar.tsx
├── hooks/
└── utils/
    └── storage.ts          # Notion API integration
```

## Scripts

| Command | Description |
|---|---|
| `pnpm run dev` | Start Expo dev server |
| `pnpm run ios` | Run on iOS |
| `pnpm run android` | Run on Android |
| `pnpm run build:web` | Export for web |
