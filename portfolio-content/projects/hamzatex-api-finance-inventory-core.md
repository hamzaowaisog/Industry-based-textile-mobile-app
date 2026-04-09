# HamzaTex API - Finance and Inventory Core

## Elevator Pitch

A backend-first API platform for textile operations, built with ASP.NET Core and EF Core, combining authentication, role-aware authorization, inventory movement intelligence, financial records, and PDF reporting.

## Core Strengths

- Rich domain model covering products, clients, purchases, orders, payments, expenses, transactions, and stock movements
- Security-forward default architecture with authenticated controllers and policy-based access control
- Business logic encoded in services, not leaked into endpoint handlers
- Operational reporting support through views and exportable PDF documents

## Engineering Decisions That Matter

- **Default-auth design:** controllers enforce authenticated access by default, reducing accidental public surface area
- **Policy strategy:** role IDs are resolved from multiple claim locations for resilient token compatibility
- **Transactional stock logic:** stock movement operations update related product metrics atomically
- **Identity integration:** ASP.NET Identity tables are mapped into a custom domain-driven schema layout
- **Startup migration flow:** automatic migration and seeding streamline local and staged environment setup

## Standout Implementation Areas

### 1) Inventory Intelligence

Stock movements do more than increment/decrement counts:

- Reject invalid movement types
- Prevent overselling with quantity checks
- Recompute average cost/price over time
- Track total purchased/sold quantities
- Persist movement-time snapshots for auditability

### 2) Security and Access Control

- JWT bearer authentication
- Claim-aware role policy evaluation
- Explicit policy names that align with business roles (`AdminOnly`, `StaffOnly`)

### 3) Reporting Layer

- QuestPDF-based table reporting with configurable columns
- Monetary formatting support for `en-PK`
- Summary formulas including multiplier-based totals (e.g., qty x price)

## Why Recruiters/Reviewers Should Care

This backend demonstrates applied architecture choices for business-critical systems: secure defaults, domain-centric modeling, and careful handling of state-changing operations.

## Honest Boundaries

- Automated testing depth is not clearly represented in this repository snapshot
- Some documentation sections in repository READMEs still describe an older simplified backend narrative

## Inferred Context

**[Inferred]** This API is likely intended as the long-term product backbone, with client applications catching up over time to leverage full domain capabilities.

## Visual Presentation Suggestions (Animated Portfolio)

- Scroll-driven architecture map where each backend layer fades in (Controllers -> Services -> EF Core -> Database Views)
- Motion diagram for secure request flow: token issuance, policy check, service execution
- Animated "stock movement simulator" widget showing quantity/cost/price deltas per transaction
- Dark-mode code panel snippets with subtle glow around policy and transaction logic

## Suggested Tech Tags

`ASP.NET Core` `Entity Framework Core` `MySQL` `JWT` `ASP.NET Identity` `FluentValidation` `QuestPDF`
