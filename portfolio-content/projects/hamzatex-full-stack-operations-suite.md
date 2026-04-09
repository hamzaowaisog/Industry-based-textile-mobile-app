# HamzaTex Full-Stack Operations Suite

## Elevator Pitch

HamzaTex is a full-stack business operations platform focused on textile workflows: product tracking, stock movement, clients, transactions, and operational reporting. The backend carries most of the production complexity, while the frontend acts as an early client layer for CRUD-driven user flows.

## Why This Project Stands Out

- It is domain-rich, not just CRUD: inventory movement impacts pricing metrics and quantity state over time
- It combines identity, authorization, reporting, and transactional business logic in one coherent platform
- It reflects practical engineering trade-offs between shipping quickly and building for operational correctness

## Problem It Solves

Small-to-mid operational teams often run inventory and finance in disconnected tools, making daily decisions slow and error-prone. HamzaTex centralizes these flows in one system with API-driven structure.

## Architecture at a Glance

- Frontend: `React Native` (`Expo`), `Redux Toolkit`, `React Navigation`, `Axios`
- Backend: `ASP.NET Core` (`net9.0`), `Entity Framework Core`, `MySQL` provider, JWT auth, Identity
- Reporting: `QuestPDF` for generated business documents
- API docs: `Swagger/OpenAPI` with bearer token support

## Notable Engineering Decisions

- Global authenticated API posture with explicit policies (`AdminOnly`, `StaffOnly`, `AdminOrStaff`)
- Service-layer orchestration to isolate business rules from controllers
- Database-first pragmatism with migrations and business views for monthly and client-level rollups
- Backend-generated PDFs to keep report logic centralized and consistent

## Technical Depth Highlights

- Stock movement logic updates product quantity, average cost/price, and movement snapshots in one transactional flow
- Custom role claim extraction allows flexible role identity mapping without coupling to a single claim shape
- Automatic migration + seed on startup reduces environment drift across development setups
- Identity is integrated into an existing domain model with customized table mappings

## Impact Narrative (Portfolio-Friendly)

This project demonstrates the ability to design software that maps to real business events, not just UI interactions. It shows confidence in balancing correctness (inventory/finance rules), security (auth and role policies), and deliverability (frontend starter + API-first architecture).

## Honest Boundaries

- Frontend implementation currently reflects a simpler "items CRUD" client and does not yet expose the full backend domain breadth
- Production hardening elements (fine-grained CORS, deployment infra, full test coverage) are partially documented but not fully represented in this repository state

## Inferred Context

**[Inferred]** The repository appears to be in an active transition: from tutorial-like mobile scaffolding to a significantly richer operations backend. The strongest strategic move is consolidating frontends around backend domain endpoints (products, stock movements, clients, transactions).

## Visual Presentation Suggestions (Animated Portfolio)

- Hero section with split-screen: domain entities on left, system architecture animation on right
- Scroll-reveal "event timeline" showing Purchase -> Stock Movement -> Product Metrics update
- Interactive card stack for "Security", "Inventory Logic", "Reporting", each expanding on hover
- Parallax background with subtle ledger/grid motifs to evoke operations and traceability
- Animated metric counters for "Entities modeled", "Policies implemented", "Report exports"

## Suggested Tech Tags

`ASP.NET Core` `Entity Framework Core` `MySQL` `JWT` `FluentValidation` `React Native` `Redux Toolkit` `QuestPDF` `Swagger`
