# HamzaTex Mobile CRUD Client

## Elevator Pitch

A React Native (Expo) mobile client implementing clean CRUD flows, asynchronous state management with Redux Toolkit, and a modular API utility layer for rapid product iteration.

## What Makes It Valuable

- Fast-to-ship mobile baseline with clear screen architecture
- Reliable async patterns for create/read/update/delete operations
- Practical UI states for loading, empty lists, retries, and destructive confirmations
- Good foundation for evolving into a fully domain-aware operational app

## Technical Snapshot

- Framework: `React Native` + `Expo`
- State: `Redux Toolkit` with `createAsyncThunk`
- Networking: `Axios` instance + request/response interceptors
- Navigation: stack-based flow with dedicated screens

## Engineering Decisions

- Centralized API utilities reduce duplicate request code
- Redux async thunks keep network orchestration outside UI components
- UI and state handling are structured for extension, not one-off demos
- Error and loading states are modeled in store for consistent behavior

## Product Flow

- Home list fetches and displays items
- Add screen creates records with lightweight validation
- Details screen updates records
- Delete action includes a confirmation prompt to reduce accidental loss

## Honest Boundaries

- API integration currently targets simplified `items` endpoints
- Auth token injection and secure session flow are scaffolded in comments, not fully wired
- Domain-specific backend capabilities (stock, finance, reporting) are not yet surfaced in UI

## Inferred Context

**[Inferred]** This mobile app appears to be an intentionally lean client used to validate interaction patterns and backend connectivity before integrating full business-domain flows.

## Visual Presentation Suggestions (Animated Portfolio)

- Device mockup carousel with vertical swipe transitions between Home/Add/Details
- Micro-animations for loading skeletons and optimistic action feedback
- Scroll-triggered "state flow" animation (dispatch -> thunk -> API -> reducer -> UI)
- Floating action button pulse effect to highlight primary action ergonomics

## Suggested Tech Tags

`React Native` `Expo` `Redux Toolkit` `Axios` `React Navigation`
