# MedAI — Medical Health Record App

Premium frontend prototype for a digital healthcare platform built with Expo, React Native, and NativeWind.

## Stack

- Expo SDK 57 + Expo Router
- TypeScript
- NativeWind (Tailwind)
- React Native Reanimated + Gesture Handler
- React Query (mocked APIs)
- React Hook Form + Zod
- FlashList, Zustand, Heroicons, SVG

## Run

```bash
npm install
npx expo start
```

Then press `a` for Android, `i` for iOS, or scan the QR code with Expo Go.

## Demo flow

1. Splash → Get started
2. Login with any email/password (min 6 chars) — mocked auth
3. Explore Home, Records, Medicines, Chat, Profile tabs
4. Stack screens: appointments, prescriptions, history timeline, reports, dashboard, emergency, search, notifications

## Structure

```
app/           Expo Router screens
components/    Reusable UI + cards
dummy/         Interconnected JSON data
hooks/         React Query hooks
services/      Mocked API layer
store/         Zustand auth + app state
theme/         Colors, spacing, shadows
types/         Shared TypeScript types
```

## Theme

| Token | Value |
|-------|-------|
| Primary | `#B8E986` |
| Secondary | `#6BCB77` |
| Background | `#F8FAF9` |
| Card | `#FFFFFF` |
| Text | `#111827` / `#6B7280` |
| Radius | 24px |

Frontend only — all data is local dummy JSON with simulated API latency.
