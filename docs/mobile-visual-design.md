# HamzaTex Mobile App — Visual Design Specification

This document describes every screen's visual layout, component placement, colors, and spacing. Use this to generate pixel-accurate mockups or UI designs — no code, no API calls, purely what the user sees and interacts with.

---

## Design System

### Color Palette

| Token | Hex | Usage |
| --- | --- | --- |
| `bg-screen` | `#F7F9FC` | Screen background |
| `bg-card` | `#FFFFFF` | Card and surface background |
| `primary` | `#1A56DB` | Buttons, active tab, links, headers |
| `primary-light` | `#EBF0FF` | Badge backgrounds, selected chips, tinted areas |
| `success` | `#0E9F6E` | Confirm buttons, positive amounts, "Delivered", "Paid" |
| `success-light` | `#ECFDF5` | Success badge background, positive highlights |
| `danger` | `#E02424` | Cancel, delete, negative amounts, errors |
| `danger-light` | `#FEE2E2` | Danger badge background, error highlights |
| `warning` | `#FF8800` | Pending status, low stock, outstanding amounts |
| `warning-light` | `#FFF3E0` | Warning badge background |
| `purple` | `#7C3AED` | Issued status, secondary charts |
| `purple-light` | `#F5F3FF` | Purple badge background |
| `text-primary` | `#111827` | Headings, important text |
| `text-secondary` | `#6B7280` | Sublabels, timestamps, helper text |
| `text-tertiary` | `#9CA3AF` | Placeholder text, disabled states |
| `divider` | `#E5E7EB` | Lines, borders, separators |
| `border` | `#D1D5DB` | Input borders (default) |
| `border-focus` | `#1A56DB` | Input borders (focused) |
| `shadow` | `rgba(0,0,0,0.06)` | Card shadow |

### Typography — Quicksand (loaded via @expo-google-fonts/quicksand)

| Style | Weight | Size | Tracking | Usage |
| --- | --- | --- | --- | --- |
| Display | Bold | 36px | 0 | Large numbers on dashboard, hero amounts |
| Title | SemiBold | 22px | 0 | Screen titles |
| Section | SemiBold | 16px | 0 | Section headers, card titles |
| Body | Regular | 14px | 0 | Paragraph text, labels |
| Caption | Regular | 12px | 0 | Timestamps, sublabels |
| Amount | Bold | 15px | 0.5px | Money values, SKUs, codes |
| Button | SemiBold | 16px | 0.5px | Button labels |

### Spacing Scale

| Token | Value | Usage |
| --- | --- | --- |
| `xs` | 4px | Tight gaps, badge padding |
| `sm` | 8px | Between icon and text |
| `md` | 12px | Between form fields |
| `lg` | 16px | Card padding, row padding |
| `xl` | 20px | Section gaps |
| `2xl` | 24px | Screen horizontal padding |
| `3xl` | 32px | Between major sections |

### Border Radius

| Element | Radius |
| --- | --- |
| Cards | 16px |
| Buttons | 12px |
| Inputs | 10px |
| Status badges | 20px (pill) |
| Avatars | Full circle |
| FAB | 28px (circle) |
| Modals | 20px top corners |

### Elevation / Shadows

| Level | Shadow | Usage |
| --- | --- | --- |
| 0 | None | Flat list rows |
| 1 | `0 1px 3px rgba(0,0,0,0.04)` | Cards in lists |
| 2 | `0 2px 8px rgba(0,0,0,0.06)` | Stat cards, detail cards |
| 4 | `0 4px 12px rgba(0,0,0,0.08)` | Modals, bottom sheets |
| 6 | `0 6px 20px rgba(0,0,0,0.12)` | FAB, notification banner |

### Status Badge Colors

| Status | Background | Text |
| --- | --- | --- |
| Pending | `#FFF3E0` | `#FF8800` |
| In Progress | `#EBF0FF` | `#1A56DB` |
| Delivered | `#ECFDF5` | `#0E9F6E` |
| Cancelled | `#FEE2E2` | `#E02424` |
| Draft | `#F3F4F6` | `#6B7280` |
| Issued | `#F5F3FF` | `#7C3AED` |
| Paid | `#ECFDF5` | `#0E9F6E` |

### Chart Colors

| Purpose | Color |
| --- | --- |
| Sales / Primary bar | `#1A56DB` |
| Purchases / Secondary bar | `#FF8800` |
| Expenses / Danger bar | `#E02424` |
| Profit / Success line | `#0E9F6E` |
| Purple segment | `#7C3AED` |
| Teal segment | `#14B8A6` |

---

## Icon Style

All icons: outline style, 24px, `text-secondary` color. Active state: filled variant, `primary` color.

| Icon Set | Usage |
| --- | --- |
| Bottom tabs | House, Users, ClipboardList, CreditCard, Grid |
| List actions | ChevronRight, Edit (Pencil), Trash, Plus |
| Status | Clock (Pending), Truck (Delivered), XCircle (Cancelled), FileText (Draft), Send (Issued), CheckCircle (Paid) |
| Categories | Package (Product), ShoppingCart (Order), Building2 (Purchase), Banknote (Payment), Receipt (Invoice), TrendingDown (Expense), ArrowUpDown (Stock), FileText (Transaction), BarChart3 (Report), Users (Client) |
| Misc | Search, Filter, Download, Share, Bell, Settings, Logout, Calendar, Eye, EyeOff, Check, AlertTriangle, Info, RefreshCw |

---

## Navigation Bar

### Bottom Tab Bar

- Height: 56px + safe area
- Background: `#FFFFFF`
- Top border: 1px `divider`
- Active tab: filled icon in `primary`, label in `primary` (SemiBold 11px)
- Inactive tab: outline icon in `text-tertiary`, label in `text-tertiary` (Regular 11px)
- Layout: 5 equal-width tabs

### Top Navigation Bar

- Height: 56px
- Background: `#FFFFFF`
- Bottom border: 1px `divider`
- Left: back arrow (if stack screen) — 24px icon, `text-primary`
- Center: screen title in Title style, `text-primary`
- Right: contextual action (edit, bell, filter icon)

---

## Screen-by-Screen Visual Layouts

---

### Screen 1: LoginScreen

```
┌─────────────────────────────────┐
│                                 │  ← Blue gradient fill
│         [  HT logo  ]          │     (#1A56DB → #0E4DAB)
│                                 │
│      HamzaTex                   │  ← White text, Title SemiBold
│      Your business, always      │  ← White text, Body, 80% opacity
│          in hand                │
│                                 │
├─────────────────────────────────┤  ← White rounded-top card
│                                 │     (border-radius 24px top)
│  ┌─────────────────────────┐   │
│  │ 👤 Username             │   │  ← Input: border #D1D5DB, r=10px
│  └─────────────────────────┘   │     48px height, 16px padding
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🔒 Password         👁 │   │  ← Eye icon toggles visibility
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │       Sign In            │   │  ← Primary button: #1A56DB bg,
│  └─────────────────────────┘   │     white text, r=12px, 52px height
│                                 │
│  ┌─────────────────────────┐   │
│  │  ☎ Use Face ID          │   │  ← Outline button: #1A56DB border,
│  └─────────────────────────┘   │     #1A56DB text (only shown if
│                                 │   biometric token exists)
│        Forgot password?         │  ← Caption, #1A56DB, center
│                                 │
│                                 │
│     ┌────────────────────┐      │  ← Error banner (when failed):
│     │ ⚠ Invalid credentials │   │     #FEE2E2 bg, #E02424 text
│     └────────────────────┘      │     slides down from top
└─────────────────────────────────┘
```

**Ratios:** Top gradient 40% / Bottom white card 60% of screen.

---

### Screen 1b: BiometricLoginScreen

```
┌─────────────────────────────────┐
│           #F7F9FC bg            │
│                                 │
│         [  HT logo  ]          │  ← Centered, 120px from top
│                                 │
│      Welcome back, Ali          │  ← Title, text-primary
│                                 │
│         ┌─────────┐             │
│         │  🖐 or  │             │  ← Large fingerprint/Face ID icon
│         │  face   │             │     80×80px, #1A56DB, pulse anim
│         └─────────┘             │     (scale 1.0 → 1.08, loop 2s)
│                                 │
│      Authenticating…            │  ← Body, text-secondary
│                                 │
│                                 │
│    Use Password Instead         │  ← Caption, #1A56DB, underlined
│                                 │
│                                 │
│    ┌─────────────────────┐      │  ← Shown if token expired:
│    │ ⚠ Session expired.   │     │     #FFF3E0 bg, #FF8800 text
│    │   Please sign in.    │     │     with "Sign In" button
│    └─────────────────────┘      │
└─────────────────────────────────┘
```

---

### Screen 2: ForgotPasswordScreen

```
┌─────────────────────────────────┐
│ ← Reset Password                │  ← Top nav bar
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│          ┌─────────┐            │
│          │  ✉ + 🔑 │            │  ← Illustration: envelope with key
│          │         │            │     120×120px, muted blue tones
│          └─────────┘            │
│                                 │
│     Enter your email address    │  ← Body, text-secondary, centered
│     and we'll send a reset link │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ✉ Email address         │   │  ← Input field
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │    Send Reset Link       │   │  ← Primary button
│  └─────────────────────────┘   │
│                                 │
│                                 │
│    ┌────────────────────┐       │  ← Success state (after sent):
│    │ ✅ Check your email  │      │     #ECFDF5 bg, #0E9F6E icon+text
│    │   Back to login     │       │     replaces the button
│    └────────────────────┘       │
└─────────────────────────────────┘
```

---

### Screen 3: DashboardScreen

```
┌─────────────────────────────────┐
│ ← Home                    🔔 3  │  ← Bell icon with red badge (unread)
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  Good morning, Ali              │  ← Title, text-primary
│  Thursday, 14 May 2026         │  ← Caption, text-secondary
│                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│  │ 📦   │ │ 💰   │ │ 💳   │ │ ⚠    │  ← Horizontal scroll cards
│  │  4   │ │320K  │ │  7   │ │  3   │     160px wide each, r=16px
│  │Orders│ │Outst.│ │Pend. │ │LowStk│     bg-card, elevation 2
│  │45K   │ │      │ │      │ │      │     number = Display Bold
│  └──────┘ └──────┘ └──────┘ └──────┘     label = Caption
│       🔵    🟠       🟣       🔴          top accent bar 4px
│                                 │
│  Monthly Overview               │  ← Section, SemiBold 16px
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │  ▐█▌  ▐█▌  ▐█▌  ▐█▌   │   │  ← Grouped bar chart
│  │  ▐█▌  ▐█▌  ▐█▌  ▐█▌   │   │     Blue=Sales, Orange=Purchases,
│  │  ▐█▌  ▐█▌  ▐█▌  ▐█▌   │   │     Red=Expenses (rounded tops)
│  │  Feb   Mar  Apr  May    │   │     animated on mount, tap=tooltip
│  │                         │   │     200px height, scrollable
│  └─────────────────────────┘   │
│                                 │
│  Recent Orders                  │  ← Section, SemiBold 16px
│  ┌─────────────────────────┐   │
│  │ Ali Textiles       45,000│   │  ← White card, lg padding
│  │ May 14   [Delivered ✓]   │   │     client=SemiBold, amount=Amount
│  ├─────────────────────────┤   │     date=Caption, badge=pill
│  │ Usman Fabrics    120,000│   │
│  │ May 13   [Pending ⏳]    │   │
│  ├─────────────────────────┤   │
│  │ Khan Traders      85,000│   │
│  │ May 12   [In Progress]  │   │
│  └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│  🟢 Synced 2m ago              │  ← SyncStatusBar: #ECFDF5 bg
├─────────────────────────────────┤
│  🏠    👥    📋    💳    ☰     │  ← Bottom tabs
└─────────────────────────────────┘
```

---

### Screen 4: ClientListScreen

```
┌─────────────────────────────────┐
│ Clients                    ＋   │  ← ＋ = FAB-style icon in header
├─────────────────────────────────┤
│  ┌─────────────────────────┐   │
│  │ 🔍 Search clients       │   │  ← Search input with filter icon
│  └─────────────────────────┘   │     bg-card, r=10px
│                                 │
│  [All]  [Customers]  [Suppliers]│  ← Segmented control: active =
│                                 │     primary bg + white text;
│                                 │     inactive = bg-card + border
│  ┌─────────────────────────┐   │
│  │ Ali Textiles             │   │
│  │ 📞 0300-1234567  [Customer]│  ← type pill badge, xs padding
│  │                  45,000 ➤│   │     amount right-aligned, Amount
│  ├─────────────────────────┤   │     green=credit to you
│  │ Usman Fabrics            │   │     red=owes you, chevron right
│  │ 📞 0321-9876543 [Supplier] │
│  │             -120,000 ➤  │   │  ← red amount (you owe supplier)
│  ├─────────────────────────┤   │
│  │ Khan Traders             │   │
│  │ 📞 0333-5551234 [Customer] │
│  │                   0  ➤  │   │  ← neutral amount (settled)
│  └─────────────────────────┘   │
│                                 │
│            ● ● ●               │  ← Pagination dots
│                                 │
│                        ┌───┐   │
│                        │ ＋│   │  ← FAB: 56×56px circle, #1A56DB
│                        └───┘   │     white ＋, elevation 6,
│                                 │     bottom 80px + right 24px
├─────────────────────────────────┤
│  🏠    👥    📋    💳    ☰     │  ← "Clients" tab active (filled blue)
└─────────────────────────────────┘
```

**Swipe actions:**
- Swipe left → red background with white Trash icon
- Swipe right → blue background with white Pencil icon

---

### Screen 5: ClientDetailScreen

```
┌─────────────────────────────────┐
│ ← Client Details          ✏️   │  ← Edit icon top-right
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  ┌─────────────────────────┐   │
│  │   #1A56DB → #0E4DAB     │   │  ← Blue gradient header card
│  │                          │   │     r=16px, xl padding
│  │   Ali Textiles           │   │  ← White SemiBold 20px
│  │   [Customer] ● Active    │   │  ← White badge + green dot
│  │                          │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  Balance                 │   │  ← bg-card, r=16px
│  │                          │   │
│  │     PKR 45,000           │   │  ← Display Bold, #0E9F6E (green)
│  │     ● Owes You           │   │  ← green dot + Caption
│  │                          │   │
│  └─────────────────────────┘   │
│                                 │
│  📞 0300-1234567                │  ← Info rows: icon + label
│  📍 House 5, Street 2, ...     │     16px icon + Body text
│  💳 Credit Limit: 200,000      │
│  📊 Opening Balance: 10,000    │
│  📝 Wholesale textile buyer    │
│                                 │
│  ─────────────────────────────  │  ← divider
│                                 │
│  [Orders] [Payments] [Invoices] [Txns]│ ← Underline tab bar
│  ═══════                       │     active = primary underline
│                                 │
│  ┌─────────────────────────┐   │
│  │ ORD-14  45,000  [Deliv.]│   │  ← Compact list under active tab
│  │ ORD-11  30,000  [Pending]│   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

### Screen 6: ClientFormScreen

```
┌─────────────────────────────────┐
│ ← Add Client                    │
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  Client Information             │  ← Section header
│                                 │
│  Name *                         │  ← Label: Caption, text-secondary
│  ┌─────────────────────────┐   │
│  │ e.g. Ali Textiles        │   │  ← Input with placeholder
│  └─────────────────────────┘   │
│                                 │
│  Phone                          │
│  ┌─────────────────────────┐   │
│  │ e.g. 0300-1234567        │   │
│  └─────────────────────────┘   │
│                                 │
│  Address                        │
│  ┌─────────────────────────┐   │
│  │                          │   │  ← Multiline input, 80px height
│  └─────────────────────────┘   │
│                                 │
│  Client Type                    │
│  ┌──────────┐ ┌──────────┐    │  ← Chip picker: two options
│  │ Customer  │ │ Supplier  │    │     active = primary bg, white text
│  └──────────┘ └──────────┘    │     inactive = bg-card + border
│                                 │
│  Credit Limit                   │
│  ┌─────────────────────────┐   │
│  │ PKR  200,000             │   │  ← "PKR" prefix label inside input
│  └─────────────────────────┘   │
│                                 │
│  Opening Balance                │
│  ┌─────────────────────────┐   │
│  │ PKR  0                   │   │
│  └─────────────────────────┘   │
│                                 │
│  Notes                          │
│  ┌─────────────────────────┐   │
│  │                          │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │      Save Client         │   │  ← Green (#0E9F6E) CTA button
│  └─────────────────────────┘   │
│                                 │
│  ⚠ Name is required            │  ← Inline validation error:
│                                 │     #FEE2E0 bg, #E02424 text,
│                                 │     appears directly below field
└─────────────────────────────────┘
```

---

### Screen 7: ProductListScreen

```
┌─────────────────────────────────┐
│ Products                    🔍  │
├─────────────────────────────────┤
│  ┌─────────────────────────┐   │
│  │ 🔍 Search products      │   │
│  └─────────────────────────┘   │
│                                 │
│  [All]  [Low Stock ⚠]  [Out]  │  ← Filter chips
│                                 │
│  ┌─────────────────────────┐   │
│  │ Cotton Fabric             │   │
│  │ FAB-001    │  150 meters │   │  ← SKU in Amount style, unit label
│  │                    450 ➤ │   │  ← Stock qty (green if ok)
│  ├─────────────────────────┤   │
│  │ Silk Blend                │   │
│  │ SILK-005   │   80 yards  │   │
│  │                   12 ⚠  ➤│   │  ← Red qty + ⚠ if below reorder
│  ├─────────────────────────┤   │
│  │ Polyester Thread          │   │
│  │ THR-012   │  500 rolls   │   │
│  │                   500 ➤  │   │
│  └─────────────────────────┘   │
│                                 │
│                        ┌───┐   │
│                        │ ＋│   │  ← FAB
│                        └───┘   │
└─────────────────────────────────┘
```

---

### Screen 8: ProductDetailScreen

```
┌─────────────────────────────────┐
│ ← Product Detail           ✏️  │
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  ┌─────────────────────────┐   │
│  │   Cotton Fabric           │   │  ← bg-card, r=16px
│  │   FAB-001                 │   │  ← SKU in Amount, text-secondary
│  └─────────────────────────┘   │
│                                 │
│  ┌────────┐  ┌────────┐       │
│  │📦 150  │  │💰 280  │       │  ← 2×2 stat grid
│  │Stock   │  │Avg Cost│       │     bg-card, r=16px, center aligned
│  └────────┘  └────────┘       │     icon=24px, number=Display Bold
│  ┌────────┐  ┌────────┐       │     label=Caption, text-secondary
│  │🏷 450  │  │⚠ 20    │       │
│  │Avg Price│  │Reorder │       │  ← Reorder card has red accent
│  └────────┘  └────────┘       │     if stock ≤ reorder level
│                                 │
│  Stock History                  │  ← Section
│  ┌─────────────────────────┐   │
│  │     ╱╲                   │   │  ← Colorful line chart
│  │    ╱  ╲    ╱╲            │   │     smooth curve, green gradient
│  │───╱────╲──╱──╲──         │   │     fill below line, 150px height
│  │  Apr 10  Apr 20  May    │   │
│  └─────────────────────────┘   │
│                                 │
│  Recent Movements               │
│  ┌─────────────────────────┐   │
│  │ 🟢 In   +50   May 14    │   │  ← Green circle for In
│  │ 🔴 Out  -20   May 13    │   │  ← Red circle for Out
│  │ 🔵 Adj  ±0    May 10    │   │  ← Blue circle for Adjustment
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

### Screen 9: ProductFormScreen

```
┌─────────────────────────────────┐
│ ← Add Product                   │
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  Name *                         │
│  ┌─────────────────────────┐   │
│  │ e.g. Cotton Fabric        │   │
│  └─────────────────────────┘   │
│                                 │
│  SKU *                          │
│  ┌─────────────────────────┐   │
│  │ e.g. FAB-001              │   │  ← Amount style for code
│  └─────────────────────────┘   │
│                                 │
│  Unit                           │
│  ┌─────────────────────────┐   │
│  │ e.g. meters               │   │
│  └─────────────────────────┘   │
│                                 │
│  Default Cost                   │
│  ┌─────────────────────────┐   │
│  │ PKR  280                  │   │
│  └─────────────────────────┘   │
│                                 │
│  Default Price                  │
│  ┌─────────────────────────┐   │
│  │ PKR  450                  │   │
│  └─────────────────────────┘   │
│                                 │
│  Reorder Level                  │
│  ┌─────────────────────────┐   │
│  │ 20                        │   │
│  └─────────────────────────┘   │
│                                 │
│  Initial Quantity               │
│  ┌─────────────────────────┐   │
│  │ 0                         │   │  ← Helper: "Set opening stock"
│  └─────────────────────────┘   │
│  ℹ️ Sets the opening stock level│  ← Info text, text-secondary
│                                 │
│  ┌─────────────────────────┐   │
│  │      Save Product         │   │  ← Green CTA button
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

### Screen 10: OrderListScreen

```
┌─────────────────────────────────┐
│ Orders                          │
├─────────────────────────────────┤
│                                 │
│  [All] [Pending] [In Prog] [Delivered] [Cancelled]│ ← Scrollable chips
│                                 │
│  ┌─────────────────────────┐   │
│  │ ORD-14                    │   │
│  │ Ali Textiles   45,000 ➤ │   │  ← Order# in Amount, client=SemiBold
│  │ May 14  [Delivered ✓]    │   │     amount right, status badge pill
│  ├─────────────────────────┤   │
│  │ ORD-13                    │   │
│  │ Usman Fab  120,000  ➤  │   │
│  │ May 13  [Pending ⏳]     │   │
│  ├─────────────────────────┤   │
│  │ ORD-12                    │   │
│  │ Khan Tr     85,000  ➤  │   │
│  │ May 12  [Cancelled ✕]   │   │
│  └─────────────────────────┘   │
│                                 │
│                        ┌───┐   │
│                        │ ＋│   │  ← FAB
│                        └───┘   │
└─────────────────────────────────┘
```

---

### Screen 11: CreateOrderScreen

```
┌─────────────────────────────────┐
│ ← New Order                     │
├─────────────────────────────────┤
│                                 │
│  ━━━━━━●━━━━━━━━━━              │  ← Progress bar: 3 steps
│  Step 1    Step 2    Step 3     │     active dot = primary, r=6px
│  Details   Items     Review     │     completed = primary filled
│                                 │
│  ─── Step 1: Order Details ─── │
│                                 │
│  Client                         │
│  ┌─────────────────────────┐   │
│  │ 🔍 Select client...      │ ➤│  ← Tappable row → opens modal
│  └─────────────────────────┘   │
│                                 │
│  Payment Type                   │
│  ┌──────────┐ ┌──────────┐    │
│  │  Cash 💵  │ │ Credit 💳│    │  ← Chip picker
│  └──────────┘ └──────────┘    │
│                                 │
│  Notes                          │
│  ┌─────────────────────────┐   │
│  │                          │   │
│  └─────────────────────────┘   │
│                                 │
│          [Next →]               │  ← Primary button, right-aligned
│                                 │
│  ─── Step 2: Order Lines ───── │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ＋ Add Product            │   │  ← Dashed border, primary text
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Cotton Fabric (FAB-001)  │   │
│  │  [-] 10 [+]  × 450      │   │  ← Qty stepper + unit price
│  │              = 4,500    ✕│   │  ← Line total, ✕ to remove
│  ├─────────────────────────┤   │
│  │ Silk Blend (SILK-005)    │   │
│  │  [-]  5 [+]  × 1,200    │   │
│  │              = 6,000    ✕│   │
│  └─────────────────────────┘   │
│                                 │
│  ─────────────────────────────  │
│  Total                  10,500  │  ← Amount Bold, right-aligned
│                                 │
│          [Next →]               │
│                                 │
│  ─── Step 3: Review ────────── │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Client: Ali Textiles     │   │  ← Summary card
│  │ Payment: Cash            │   │
│  │                          │   │
│  │ ─────────────────────── │   │
│  │ Cotton Fabric  10 × 450 │   │
│  │ Silk Blend      5 × 1200│   │
│  │ ─────────────────────── │   │
│  │ Total           10,500   │   │  ← Amount Bold
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │     Place Order          │   │  ← Green CTA button
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

---

### Screen 12: OrderDetailScreen

```
┌─────────────────────────────────┐
│ ← Order #14              📄   │  ← PDF icon if invoice exists
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  ┌─────────────────────────┐   │
│  │  ORD-14                  │   │  ← bg-card
│  │  May 14, 2026            │   │  ← Caption, text-secondary
│  │  [Delivered ✓]           │   │  ← Status badge, pill
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 👤 Ali Textiles          │ ➤│  ← Client card, tappable
│  │    Customer              │   │
│  └─────────────────────────┘   │
│                                 │
│  Order Lines                    │  ← Section
│  ┌─────────────────────────┐   │
│  │ Product    Qty  Price Total│   │  ← Table header: Caption, bold
│  ├─────────────────────────┤   │
│  │ Cotton F.   10   450  4,500│   │  ← Alternating row bg: card/#
│  │ Silk Bl.     5  1,200 6,000│   │     F5F9FC white stripe
│  ├─────────────────────────┤   │
│  │ Total              10,500 │   │  ← Bold, right-aligned
│  └─────────────────────────┘   │
│                                 │
│  Financial Summary              │
│  ┌─────────────────────────┐   │
│  │  Subtotal         10,500│   │
│  │  Received          5,000│   │  ← Green text
│  │  ─────────────────────  │   │
│  │  Outstanding       5,500│   │  ← Orange text
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  ▶ Mark Delivered        │   │  ← Context-aware action button
│  └─────────────────────────┘   │     Delivered=green outline
│  ┌─────────────────────────┐   │     Cancelled=red text button
│  │  ▶ Generate Invoice      │   │     In Progress=blue outline
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

### Screen 13: PurchaseListScreen

```
┌─────────────────────────────────┐
│ Purchases                       │
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  [All] [Pending] [In Prog] [Delivered] [Cancelled]│
│                                 │
│  ┌─────────────────────────┐   │
│  │ PUR-08                     │   │
│  │ Ahmed Supplies   35,000 ➤│   │  ← Supplier name + total
│  │ May 13  [Delivered ✓]     │   │  ← Status badge
│  ├─────────────────────────┤   │
│  │ PUR-07                     │   │
│  │ Raza Traders     28,000 ➤│   │
│  │ May 11  [Pending ⏳]      │   │
│  ├─────────────────────────┤   │
│  │ PUR-06                     │   │
│  │ Khan Textiles    18,500 ➤│   │
│  │ May 9   [In Progress]    │   │
│  └─────────────────────────┘   │
│                                 │
│                        ┌───┐   │
│                        │ ＋│   │  ← FAB
│                        └───┘   │
└─────────────────────────────────┘
```

---

### Screen 14: CreatePurchaseScreen

```
┌─────────────────────────────────┐
│ ← New Purchase                  │
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  ━━━━━━●━━━━━━━━━━              │  ← 3-step progress bar
│  Step 1    Step 2    Step 3     │
│  Details   Items     Review     │
│                                 │
│  ─── Step 1 ────────────────── │
│                                 │
│  Supplier                       │
│  ┌─────────────────────────┐   │
│  │ 🔍 Select supplier...     │ ➤│  → Only ClientType=Supplier
│  └─────────────────────────┘   │
│                                 │
│  Payment Type                   │
│  ┌──────────┐ ┌──────────┐    │
│  │  Cash 💵  │ │ Credit 💳│    │
│  └──────────┘ └──────────┘    │
│                                 │
│  Notes                          │
│  ┌─────────────────────────┐   │
│  │                          │   │
│  └─────────────────────────┘   │
│                                 │
│  ─── Step 2: Purchase Lines ── │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ＋ Add Product            │   │  ← Dashed border
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Cotton Fabric (FAB-001)   │   │
│  │  [-] 50 [+]  × 280      │   │  ← Qty stepper + Unit Cost
│  │            = 14,000    ✕│   │
│  └─────────────────────────┘   │
│                                 │
│  ─────────────────────────────  │
│  Total                  14,000  │
│                                 │
│  ─── Step 3: Review ────────── │
│  ┌─────────────────────────┐   │
│  │ Supplier: Ahmed Supplies  │   │
│  │ Payment: Credit           │   │
│  │ ─────────────────────── │   │
│  │ Cotton Fabric  50 × 280  │   │
│  │ ─────────────────────── │   │
│  │ Total           14,000   │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │    Create Purchase        │   │  ← Green CTA
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

### Screen 15: PurchaseDetailScreen

```
┌─────────────────────────────────┐
│ ← Purchase #08            📄   │
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  ┌─────────────────────────┐   │
│  │  PUR-08                   │   │
│  │  May 13, 2026             │   │
│  │  [Delivered ✓]            │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🏢 Ahmed Supplies         │ ➤│  ← Supplier card, tappable
│  │    Supplier               │   │
│  └─────────────────────────┘   │
│                                 │
│  Purchase Lines                 │
│  ┌─────────────────────────┐   │
│  │ Product    Qty   Cost Total│   │
│  ├─────────────────────────┤   │
│  │ Cotton F.   50   280  14,000│
│  │ Silk Bl.    20   650  13,000│
│  ├─────────────────────────┤   │
│  │ Total              27,000 │   │
│  └─────────────────────────┘   │
│                                 │
│  Financial Summary              │
│  ┌─────────────────────────┐   │
│  │  Total             27,000│   │
│  │  Paid              10,000│   │  ← Green
│  │  ─────────────────────  │   │
│  │  Amount Payable    17,000│   │  ← Orange (not "Outstanding")
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  ▶ Mark Delivered         │   │  ← Context-aware buttons
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

### Screen 16: PaymentListScreen

```
┌─────────────────────────────────┐
│ Payments                        │
├─────────────────────────────────┤
│                                 │
│  [All]  [⬇ Received]  [⬆ Paid] │  ← Filter chips
│                                 │
│  ┌─────────────────────────┐   │
│  │ Ali Textiles              │   │
│  │ May 14    [Cash 💵]       │   │  ← Mode badge
│  │           ⬇ 45,000       │   │  ↓ green arrow = Received
│  ├─────────────────────────┤   │     Amount in Amount Bold
│  │ Usman Fabrics             │   │
│  │ May 13    [Bank 🏦]       │   │
│  │           ⬆ 120,000      │   │  ↑ orange arrow = Paid
│  ├─────────────────────────┤   │
│  │ Khan Traders              │   │
│  │ May 12    [Cash 💵]       │   │
│  │           ⬇ 30,000       │   │
│  └─────────────────────────┘   │
│                                 │
│                        ┌───┐   │
│                        │ ＋│   │  ← FAB
│                        └───┘   │
└─────────────────────────────────┘
```

---

### Screen 17: RecordPaymentScreen

```
┌─────────────────────────────────┐
│ ← Record Payment                │
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  Client                         │
│  ┌─────────────────────────┐   │
│  │ 🔍 Select client...      │ ➤│  → Opens SearchableModal
│  │   Balance: 45,000 owed   │   │  ← Shows balance inline once picked
│  └─────────────────────────┘   │
│                                 │
│  Amount                         │
│  ┌─────────────────────────┐   │
│  │ PKR  45,000              │   │  ← Large numeric, PKR prefix
│  └─────────────────────────┘   │
│                                 │
│  Direction                      │
│  ┌──────────┐ ┌──────────┐    │
│  │⬇ Received │ │⬆ Paid    │    │  ← Toggle: green / orange
│  └──────────┘ └──────────┘    │
│                                 │
│  Mode                           │
│  ┌────────┐ ┌────────┐ ┌──────┐│
│  │ Cash 💵 │ │ Bank 🏦│ │Cr. 💳││  ← Chip picker, 3 options
│  └────────┘ └────────┘ └──────┘│
│                                 │
│  Date                           │
│  ┌─────────────────────────┐   │
│  │ 📅 14 May, 2026          │   │  → Opens date picker
│  └─────────────────────────┘   │
│                                 │
│  ▼ Allocate to Orders           │  ← Expandable section
│  ┌─────────────────────────┐   │
│  │ ☑ ORD-14  10,500  Delivered│  │  ← Checkbox + order + amount
│  │   Amount: [10,500      ] │   │     input field per checked item
│  │ ☐ ORD-11   8,200  Delivered│  │
│  └─────────────────────────┘   │
│                                 │
│  Notes                          │
│  ┌─────────────────────────┐   │
│  │                          │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │    Record Payment        │   │  ← Green CTA
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

---

### Screen 18: InvoiceListScreen

```
┌─────────────────────────────────┐
│ Invoices                        │
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  [All] [Draft] [Issued] [Paid] [Cancelled]│ ← Scrollable status chips
│                                 │
│  ┌─────────────────────────┐   │
│  │ INV-2026-0004              │   │  ← Invoice number in Amount style
│  │ Ali Textiles    10,500 ➤ │   │  ← Client + total right-aligned
│  │ May 10   [Issued 🟣]      │   │  ← Date + purple status badge
│  ├─────────────────────────┤   │
│  │ INV-2026-0003              │   │
│  │ Usman Fabrics  25,000  ➤ │   │
│  │ May 8    [Paid ✅]         │   │  ← Green badge
│  ├─────────────────────────┤   │
│  │ INV-2026-0002              │   │
│  │ Khan Traders    8,200  ➤ │   │
│  │ May 5    [Draft ⬜]        │   │  ← Grey badge
│  ├─────────────────────────┤   │
│  │ INV-2026-0001              │   │
│  │ Ahmed Supply  35,000  ➤ │   │
│  │ May 2    [Cancelled ✕]    │   │  ← Red badge
│  └─────────────────────────┘   │
│                                 │
│  No FAB — invoices are          │  ← Created from orders/purchases
│  created from orders/purchases  │
│                                 │
└─────────────────────────────────┘
```

---

### Screen 19: InvoiceDetailScreen

```
┌─────────────────────────────────┐
│ ← Invoice INV-2026-0004    📤  │  ← Share icon
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  ┌─────────────────────────┐   │
│  │  INV-2026-0004           │   │  ← bg-card
│  │  [Issued 🟣]             │   │  ← Purple badge
│  │                          │   │
│  │  Issued: 10 May  │ Due: 20 May│ ← Dates row
│  │                   ⚠ OVERDUE  │  ← Red if past due
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 👤 Ali Textiles          │ ➤│  ← Client card, tappable
│  └─────────────────────────┘   │
│                                 │
│  Lines                          │
│  ┌─────────────────────────┐   │
│  │ Product    Qty  Price Total│   │
│  │ Cotton F.   10   450  4,500│   │
│  │ Silk Bl.     5  1,200 6,000│   │
│  │ ─────────────────────── │   │
│  │ Total           10,500   │   │
│  └─────────────────────────┘   │
│                                 │
│  Payment Summary                │
│  ┌─────────────────────────┐   │
│  │  Total            10,500│   │
│  │  Paid              5,000│   │  ← Green
│  │  Outstanding       5,500│   │  ← Orange
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  ▶ Mark Paid             │   │  ← Context-aware buttons
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │  📄 View PDF             │   │  ← Opens PDF viewer modal
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │  📤 Share PDF            │   │  ← System share sheet
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

### Screen 20: ExpenseListScreen

```
┌─────────────────────────────────┐
│ Expenses                        │
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  ┌─────────────────────────┐   │
│  │ This Month    PKR 32,500 │   │  ← Summary card with mini donut
│  │ ┌──┐ Office 22K  Home 10K│   │     bg-card, r=16px
│  └─────────────────────────┘   │
│                                 │
│  Filter: [Office] [Home] [All] │  ← Type filter chips
│  📅 Jan 2026 → May 2026        │  ← Date range picker
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🏢 Office Expenses         │   │  ← Category icon + badge
│  │ PKR 12,000  Cash  May 14  │   │  ← Amount + mode + date
│  │ Stationery and supplies   │   │  ← Notes preview, Caption
│  ├─────────────────────────┤   │
│  │ 🏠 Home Expenses           │   │
│  │ PKR 5,500   Bank  May 13  │   │
│  │ Utilities payment          │   │
│  ├─────────────────────────┤   │
│  │ 🏢 Office Expenses         │   │
│  │ PKR 8,000   Cash  May 10  │   │
│  │ Internet bill              │   │
│  └─────────────────────────┘   │
│                                 │
│                        ┌───┐   │
│                        │ ＋│   │  ← FAB
│                        └───┘   │
└─────────────────────────────────┘
```

---

### Screen 21: AddExpenseScreen

```
┌─────────────────────────────────┐
│ ← Add Expense                   │
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  Amount                         │
│  ┌─────────────────────────┐   │
│  │ PKR  12,000              │   │  ← Large numeric, PKR prefix
│  └─────────────────────────┘   │
│                                 │
│  Expense Type                   │
│  ┌──────────┐ ┌──────────┐    │
│  │🏢 Office  │ │🏠 Home   │    │  ← Chip picker, 2 options
│  └──────────┘ └──────────┘    │
│                                 │
│  Mode                           │
│  ┌────────┐ ┌────────┐ ┌──────┐│
│  │ Cash 💵 │ │ Bank 🏦│ │Cr. 💳││  ← Chip picker
│  └────────┘ └────────┘ └──────┘│
│                                 │
│  Date                           │
│  ┌─────────────────────────┐   │
│  │ 📅 14 May, 2026          │   │
│  └─────────────────────────┘   │
│                                 │
│  Notes                          │
│  ┌─────────────────────────┐   │
│  │                          │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │     Add Expense           │   │  ← Green CTA
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

### Screen 22: StockMovementListScreen

```
┌─────────────────────────────────┐
│ Stock Movements                 │
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  📦 [Select Product ▾]          │  ← Product filter dropdown
│  [All] [🟢 In] [🔴 Out] [🔵 Adj]│  ← Movement type chips
│  📅 Date range                  │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🟢  Cotton Fabric          │   │  ← Green circle = In
│  │    +50  @ PKR 280  May 14 │   │  ← qty + unit cost + date
│  ├─────────────────────────┤   │
│  │ 🔴  Silk Blend              │   │  ← Red circle = Out
│  │    -20  @ PKR 450  May 13 │   │
│  ├─────────────────────────┤   │
│  │ 🔵  Polyester Thread        │   │  ← Blue circle = Adjustment
│  │     ±0         May 10     │   │
│  ├─────────────────────────┤   │
│  │ 🟢  Cotton Fabric          │   │
│  │   +100 @ PKR 275  May 8   │   │
│  └─────────────────────────┘   │
│                                 │
│                        ┌───┐   │
│                        │ ＋│   │  ← FAB
│                        └───┘   │
└─────────────────────────────────┘
```

---

### Screen 23: AddStockMovementScreen

```
┌─────────────────────────────────┐
│ ← Record Movement               │
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  Product                        │
│  ┌─────────────────────────┐   │
│  │ 🔍 Select product...      │ ➤│  → Opens SearchableModal
│  │   Stock: 150 units        │   │  ← Shows current stock inline
│  └─────────────────────────┘   │
│                                 │
│  Movement Source                │
│  ┌────────┐ ┌────────┐ ┌──────┐│
│  │Purchase│ │ Sale   │ │Manual│ │  ← Chip picker
│  └────────┘ └────────┘ └──────┘│
│                                 │
│  Quantity                       │
│  ┌─────────────────────────┐   │
│  │  50                       │   │
│  └─────────────────────────┘   │
│                                 │
│  Unit Cost                      │  ← Label changes: Cost/Purchase
│  ┌─────────────────────────┐   │     or Price/Sale
│  │ PKR  280                  │   │
│  └─────────────────────────┘   │
│                                 │
│  Movement Type                  │  ← Only shown when Manual selected
│  ┌────────┐ ┌────────┐ ┌──────┐│
│  │🟢 In   │ │🔴 Out  │ │🔵 Adj││
│  └────────┘ └────────┘ └──────┘│
│                                 │
│  Date                           │
│  ┌─────────────────────────┐   │
│  │ 📅 14 May, 2026          │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │   Record Movement         │   │  ← Primary CTA
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

### Screen 24: TransactionListScreen

```
┌─────────────────────────────────┐
│ Transactions                    │
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  Type: [All] [Credit] [Debit]  │  ← Trans type chips
│  Category: [All] [Sales] [Purch]│ ← Category filter row
│  📅 Date range                  │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 📊 Sales                    │   │  ← Category icon + label
│  │ Ali Textiles  Cash  May 14 │   │  ← Client name + mode + date
│  │              +45,000       │   │  ← Amount: green=Credit ↓
│  ├─────────────────────────┤   │
│  │ 🛒 Purchases                │   │
│  │ Ahmed Supplies Bank May 13 │   │
│  │              -28,000       │   │  ← Amount: red=Debit ↑
│  ├─────────────────────────┤   │
│  │ 💸 Office Exp               │   │
│  │ —            Cash  May 12  │   │  ← No client (expenses)
│  │              -12,000       │   │
│  ├─────────────────────────┤   │
│  │ 💰 Cash In                   │   │
│  │ Usman Fabrics Cash May 10  │   │
│  │              +20,000       │   │
│  └─────────────────────────┘   │
│                                 │
│  No FAB — read-only list        │  ← System-generated ledger
│                                 │
└─────────────────────────────────┘
```

---

### Screen 25: ReportsHubScreen (Admin only)

```
┌─────────────────────────────────┐
│ Reports                         │
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  ┌──────────────┐ ┌──────────────┐
│  │ 📊            │ │ 👥            │
│  │ Monthly P&L   │ │ Client       │  ← 2-column grid cards
│  │               │ │ Balances     │     bg-card, r=16px, xl padding
│  │ [View] [📄]  │ │ [View] [📄]  │     icon=32px, colored
│  └──────────────┘ └──────────────┘     View=primary text, 📄=share
│
│  ┌──────────────┐ ┌──────────────┐
│  │ ↕️             │ │ 📋            │
│  │ Credit/Debit  │ │ Overall      │
│  │ Summary       │ │ Summary      │
│  │ [View] [📄]  │ │ [View] [📄]  │
│  └──────────────┘ └──────────────┘
│
│  ┌──────────────┐
│  │ 👤            │
│  │ Client Detail │  ← Full width card (odd number)
│  │ Report        │
│  │ [View] [📄]  │
│  └──────────────┘
│                                 │
└─────────────────────────────────┘
```

---

### Screen 26: ProfitLossScreen (Admin only)

```
┌─────────────────────────────────┐
│ ← Monthly P&L              📄  │  ← PDF button
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 📅 Jan 2026 → Jun 2026  │   │  ← Month range picker row
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │  ▐█▌  ▐█▌  ▐█▌  ▐█▌   │   │  ← Grouped bar chart
│  │  ▐█▌  ▐█▌  ▐█▌  ▐█▌   │   │     🔵 Sales (blue)
│  │  ▐█▌  ▐█▌  ▐█▌  ▐█▌   │   │     🟠 Purchases (orange)
│  │  ▐█▌  ▐█▌  ▐█▌  ▐█▌   │   │     🔴 Expenses (red)
│  │  Jan   Feb  Mar  Apr    │   │     rounded tops, gradient fill
│  │                         │   │     animated on mount
│  └─────────────────────────┘   │     horizontally scrollable
│                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│  │Sales │ │Purch.│ │Expns │ │Gross │ │ Net  │  ← Stat cards row
│  │450K  │ │280K  │ │45K   │ │170K  │ │125K  │     scrollable
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘     green/red amount
│                                 │
│  Monthly Breakdown              │
│  ┌─────────────────────────┐   │
│  │ Month  Sales  Purch  Net│   │  ← Table with alternating rows
│  │ May   120K   80K  25K  │   │     net positive = green tint row
│  │ Apr    95K   70K  12K  │   │
│  │ Mar   110K   65K  30K  │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

### Screen 27: ClientBalanceScreen (Admin only)

```
┌─────────────────────────────────┐
│ ← Client Balances          📄  │  ← PDF button
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  [Customers]  [Suppliers]  [All]│  ← Segmented control
│                                 │
│  ┌─────────────────────────┐   │
│  │  Total Outstanding       │   │  ← Summary card, bg-card
│  │     PKR 450,000          │   │  ← Display Bold, #FF8800
│  │  Customers owe you       │   │  ← Caption, text-secondary
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │  ██████████████  Ali T. │   │  ← Horizontal bar chart:
│  │  ██████████    Usman F. │   │     top 10 clients by balance
│  │  ████████      Khan T.  │   │     blue=owed to you
│  │  ████          Ahmed S. │   │     orange=you owe them
│  │  ██            Raza T.  │   │     sorted DESC, animated
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🔍 Search clients...     │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Ali Textiles       45,000│   │  ← green amount (owes you)
│  ├─────────────────────────┤   │
│  │ Usman Fabrics    120,000 │   │
│  ├─────────────────────────┤   │
│  │ Ahmed Supplies   -35,000 │   │  ← red amount (you owe)
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

### Screen 28: CreditDebitScreen (Admin only)

```
┌─────────────────────────────────┐
│ ← Credit / Debit           📄  │
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │     ╱╲      ╱╲          │   │  ← Smooth area line chart
│  │   ╱  ╲    ╱  ╲  ╱╲     │   │     green=Credit (money in)
│  │  ╱    ╲  ╱    ╲╱  ╲    │   │     red=Debit (money out)
│  │ ╱      ╲╱              │   │     filled area below lines
│  │ Jan Feb Mar Apr May     │   │     200px height, animated
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  Monthly Breakdown              │
│  ┌─────────────────────────┐   │
│  │ Month    Credit   Debit  Net │  ← Table with alternating rows
│  ├─────────────────────────┤   │
│  │ May     120,000  80,000 +40K │  ← green tint row (net positive)
│  │ Apr      95,000  70,000 +25K │
│  │ Mar     110,000 130,000 -20K │  ← red tint row (net negative)
│  │ Feb      80,000  60,000 +20K │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

### Screen 29: SummaryScreen (Admin only)

```
┌─────────────────────────────────┐
│ ← Overall Summary          📄  │
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  ┌────────────┐ ┌────────────┐  │
│  │ 📊 450K    │ │ 🛒 280K    │  │  ← Stat cards: icon + value
│  │ Total Sales│ │Total Purch.│  │     2-column grid, bg-card
│  └────────────┘ └────────────┘  │     r=16px, Display Bold amount
│  ┌────────────┐ ┌────────────┐  │
│  │ 💸  45K    │ │ 💰 320K    │  │
│  │Total Expns │ │Payments In │  │
│  └────────────┘ └────────────┘  │
│  ┌────────────┐ ┌────────────┐  │
│  │ 💳 180K    │ │            │  │
│  │Payments Out│ │            │  │
│  └────────────┘ └────────────┘  │
│                                 │
│  Expense Breakdown              │
│  ┌─────────────────────────┐   │
│  │         ┌───┐            │   │
│  │       ╱  🔵  ╲           │   │  ← Donut chart
│  │     ╱  🟠    🟣 ╲        │   │     blue=Office, orange=Home
│  │     ╲         ╱          │   │     vibrant segments + legend
│  │       ╲─────╱            │   │     center: total amount
│  │                         │   │
│  │  🔵 Office 32K  🟠 Home 13K│
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

### Screen 30: ClientDetailReportScreen (Admin only)

```
┌─────────────────────────────────┐
│ ← Client Detail Report    📄  │
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🔍 Select client...      │ ➤│  → Opens SearchableModal
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  Ali Textiles             │   │
│  │  Balance: PKR 45,000     │   │  ← Balance hero card
│  │  ● Owes You              │   │     green amount
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │   ╱╲                    │   │  ← Area chart: balance trend
│  │  ╱  ╲    ╱╲             │   │     over time, green fill
│  │ ╱    ╲──╱  ╲            │   │     shows how balance changed
│  │ Jan  Mar  May           │   │
│  └─────────────────────────┘   │
│                                 │
│  [Orders] [Purchases] [Payments]│  ← Underline tabs
│  ═══════                       │
│  ┌─────────────────────────┐   │
│  │ ORD-14  45,000  [Deliv.]│   │  ← Compact ledger rows
│  │ ORD-11  30,000  [Pending]│   │
│  │ PAY-08  20,000  Received│   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

### Screen 31: UserListScreen (Admin only)

```
┌─────────────────────────────────┐
│ Users                           │
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  ┌─────────────────────────┐   │
│  │ [AH]                     │   │  ← Avatar initials circle
│  │  Ali Hamza               │   │     40px, colored by role
│  │  ali@hamzatex.com        │   │     blue=Admin, green=Staff
│  │  [Admin] ● Active        │   │  ← Role badge + active chip
│  ├─────────────────────────┤   │
│  │ [US]                     │   │
│  │  Usman Khan              │   │
│  │  usman@hamzatex.com      │   │
│  │  [Staff] ● Active        │   │
│  ├─────────────────────────┤   │
│  │ [RA]                     │   │
│  │  Raza Ahmed              │   │
│  │  raza@hamzatex.com       │   │
│  │  [Staff] ○ Inactive      │   │  ← grey dot = inactive
│  └─────────────────────────┘   │
│                                 │
│                        ┌───┐   │
│                        │ ＋│   │  ← FAB
│                        └───┘   │
└─────────────────────────────────┘
```

---

### Screen 32: AdminCreateUserScreen (Admin only)

```
┌─────────────────────────────────┐
│ ← Create User                   │
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  Full Name                      │
│  ┌─────────────────────────┐   │
│  │ e.g. Ali Hamza            │   │
│  └─────────────────────────┘   │
│                                 │
│  Email                          │
│  ┌─────────────────────────┐   │
│  │ e.g. ali@hamzatex.com     │   │
│  └─────────────────────────┘   │
│                                 │
│  Username                       │
│  ┌─────────────────────────┐   │
│  │ e.g. ali_hamza            │   │
│  └─────────────────────────┘   │
│                                 │
│  Password                       │
│  ┌─────────────────────────┐   │
│  │ 🔒 ••••••••          👁 │   │
│  └─────────────────────────┘   │
│                                 │
│  Role                           │
│  ┌──────────┐ ┌──────────┐    │
│  │ Admin 🔵  │ │ Staff 🟢 │    │  ← Chip picker, role-colored
│  └──────────┘ └──────────┘    │
│                                 │
│  ℹ️ Account will be pre-confirmed│  ← Info box: #EBF0FF bg
│     — no email verification    │     #1A56DB text
│     required                   │
│                                 │
│  ┌─────────────────────────┐   │
│  │    Create Account        │   │  ← Primary button
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

### Screen 33: SyncStatusScreen

```
┌─────────────────────────────────┐
│ ← Sync Status                   │
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  ┌─────────────────────────┐   │
│  │    ✅                     │   │  ← bg-card, centered content
│  │  All data is synced      │   │     large icon 64px
│  │  Last synced: 2 min ago  │   │     Caption, text-secondary
│  │                          │   │
│  │  📱 Local data: 2.4 MB   │   │  ← Storage info
│  │  🟢 Online                │   │  ← Green dot + "Online"
│  └─────────────────────────┘   │
│                                 │
│  Pending Changes (3)            │  ← Section, hidden if 0 pending
│  ┌─────────────────────────┐   │
│  │ 📦 New Order (ORD-15)    │   │  ← Entity icon + operation + name
│  │   Created 5 min ago      │   │     Caption, text-secondary
│  ├─────────────────────────┤   │
│  │ 👤 Update Client (Ali T.)│   │
│  │   Modified 8 min ago     │   │
│  ├─────────────────────────┤   │
│  │ 💳 New Payment (45,000)  │   │
│  │   Created 12 min ago     │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  🔄 Sync Now             │   │  ← Primary blue button
│  └─────────────────────────┘   │
│                                 │
│  Sync Results (after sync):     │
│  ┌─────────────────────────┐   │
│  │ ✅ ORD-15    Accepted    │   │  ← Green checkmark
│  │ ✅ Ali T.    Accepted    │   │
│  │ ❌ Payment   Rejected    │   │  ← Red X + error message
│  │   "Amount exceeds limit" │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

### Screen 34: SettingsScreen

```
┌─────────────────────────────────┐
│ Settings                        │
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  ┌─────────────────────────┐   │
│  │  [AH]                    │   │  ← Avatar: initials circle
│  │  Ali Hamza               │   │     48px, #1A56DB bg, white text
│  │  ali@hamzatex.com        │   │     SemiBold name, Caption email
│  │  [Admin]                 │   │  ← Role badge
│  └─────────────────────────┘   │
│                                 │
│  ACCOUNT                        │  ← Section header: Caption,
│  ┌─────────────────────────┐   │     text-tertiary, uppercase
│  │ 🔒 Change Password        │ ➤│  ← Row: icon + label + chevron
│  ├─────────────────────────┤   │     bg-card, lg padding
│  │ ✉ Resend Confirmation     │ ➤│
│  └─────────────────────────┘   │
│                                 │
│  SECURITY                       │
│  ┌─────────────────────────┐   │
│  │ 🖐 Face ID / Fingerprint  │⬆│  ← Toggle switch (right side)
│  ├─────────────────────────┤   │     green when ON, grey when OFF
│  │   Use biometrics for login │  ← Caption helper text below
│  └─────────────────────────┘   │
│                                 │
│  SYNC                           │
│  ┌─────────────────────────┐   │
│  │ 🔄 Last synced: 2m ago    │ ➤│  ← "Sync Now" row
│  ├─────────────────────────┤   │
│  │ 🗑 Clear Local Data       │   │  ← Red text (destructive)
│  └─────────────────────────┘   │
│                                 │
│  NOTIFICATIONS                  │
│  ┌─────────────────────────┐   │
│  │ 🔔 Push Notifications     │⬆│  ← Toggle
│  └─────────────────────────┘   │
│                                 │
│  ABOUT                          │
│  ┌─────────────────────────┐   │
│  │ ℹ️ App Version 1.0.0      │   │
│  │ 🟢 API Connected          │   │  ← Green dot = healthy
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │     Sign Out              │   │  ← Red (#E02424) text button
│  └─────────────────────────┘   │     no bg, centered, r=12px
│                                 │
└─────────────────────────────────┘
```

---

### Screen 35: ChangePasswordScreen

```
┌─────────────────────────────────┐
│ ← Change Password               │
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  Current Password               │
│  ┌─────────────────────────┐   │
│  │ 🔒 ••••••••          👁 │   │  ← Show/hide toggle
│  └─────────────────────────┘   │
│                                 │
│  New Password                   │
│  ┌─────────────────────────┐   │
│  │ 🔒 ••••••••          👁 │   │
│  └─────────────────────────┘   │
│  ████████░░░░░░░░ Medium        │  ← Strength bar: red→orange→green
│                                 │
│  Confirm New Password           │
│  ┌─────────────────────────┐   │
│  │ 🔒 ••••••••          👁 │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │    Update Password       │   │  ← Primary button
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

### Screen 36: Push Notification Registration Flow

```
┌─────────────────────────────────┐
│         #F7F9FC bg              │
│                                 │
│                                 │
│          ┌─────────┐            │
│          │  🔔      │            │  ← Bell illustration with sparkles
│          │ ✨       │            │     120×120px, primary blue tones
│          └─────────┘            │
│                                 │
│      Stay in the loop           │  ← Title, text-primary
│                                 │
│  Get notified when orders       │  ← Body, text-secondary, centered
│  update, sync completes, or     │
│  payments are recorded          │
│                                 │
│  ┌─────────────────────────┐   │
│  │  Enable Notifications    │   │  ← Primary blue button
│  └─────────────────────────┘   │
│                                 │
│       Not Now                   │  ← Caption, text-tertiary
│                                 │
└─────────────────────────────────┘
```

---

### Screen 37: NotificationCenterScreen

```
┌─────────────────────────────────┐
│ ← Notifications      Mark all ✓│  ← "Mark all read" text button
├─────────────────────────────────┤
│           #F7F9FC bg            │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🔵 Order Delivered        │ ●│  ← Blue dot = unread (right edge)
│  │ ORD-14 marked delivered   │   │  ← Title = SemiBold
│  │ 2 min ago                 │   │  ← Caption, text-secondary
│  ├─────────────────────────┤   │
│  │ 🟢 Payment Received       │ ●│
│  │ Ali Textiles paid 45,000  │   │
│  │ 15 min ago                │   │
│  ├─────────────────────────┤   │
│  │ 🟣 Invoice Issued         │   │  ← No dot = read
│  │ INV-2026-0004 for 10,500  │   │
│  │ 1 hour ago                │   │
│  ├─────────────────────────┤   │
│  │ 🔴 Low Stock Alert        │ ●│
│  │ Silk Blend (12 remaining)  │   │
│  │ Yesterday                 │   │
│  ├─────────────────────────┤   │
│  │ 🟠 Sync Issues            │   │
│  │ 1 of 3 items failed       │   │
│  │ Yesterday                 │   │
│  └─────────────────────────┘   │
│                                 │
│  Empty state (no notifications):│
│  ┌─────────────────────────┐   │
│  │          🔔               │   │
│  │    You're all caught up   │   │  ← Illustration + message
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

### PDF Viewer Modal (overlay on any screen)

```
┌─────────────────────────────────┐
│ ✕                        📤     │  ← Close X (left), Share (right)
│                                 │     44px touch target
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │                         │   │
│  │    [PDF Content]        │   │  ← react-native-pdf component
│  │                         │   │     white background, full width
│  │                         │   │     scrollable vertically
│  │                         │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  Page 1 of 3                    │  ← Caption, centered bottom
└─────────────────────────────────┘
```

---

### NotificationBanner (overlay, slides down from top)

```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │ 🔵 Order Delivered           │ │  ← Slides down from top
│ │ ORD-14 marked delivered      │ │     #1A56DB bg, white text
│ └─────────────────────────────┘ │     r=12px, elevation 4
│                                 │     56px height, 2xl margins
│         (current screen)        │     auto-dismiss 4 seconds
│                                 │     tappable → deep links
│                                 │
```

---

### SearchableModal (full-screen overlay)

```
┌─────────────────────────────────┐
│ ✕ Select Client                 │  ← Title in nav bar
├─────────────────────────────────┤
│  ┌─────────────────────────┐   │
│  │ 🔍 Search...              │   │  ← Search input, autofocus
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Ali Textiles              │   │
│  │ Customer │ Balance: 45K  │   │  ← Sub-label with relevant info
│  ├─────────────────────────┤   │     (balance for clients,
│  │ Usman Fabrics             │   │      stock for products)
│  │ Supplier │ Balance: -120K │   │
│  ├─────────────────────────┤   │
│  │ Khan Traders              │   │
│  │ Customer │ Balance: 0     │   │
│  └─────────────────────────┘   │
│                                 │
│  ─── or ───                     │
│                                 │
│  ＋ Create New Client           │  ← Action link at bottom
│                                 │
└─────────────────────────────────┘
```

---

## Loading / Empty / Error States

### Skeleton Loader (shown during data fetch)

```
┌─────────────────────────────────┐
│  ┌─────────────────────────┐   │
│  │ ████████████  ████████   │   │  ← Animated grey gradient
│  │ ██████                     │   │     moving left → right
│  └─────────────────────────┘   │     #E5E7EB → #F3F4F6 → #E5E7EB
│  ┌─────────────────────────┐   │     r=8px for shimmer blocks
│  │ ████████████  ████████   │   │
│  │ ██████                     │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ ████████████  ████████   │   │
│  │ ██████                     │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

### Empty State

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│          ┌─────────┐            │
│          │ 📦       │            │  ← Illustration: 120×120px
│          │ (muted)  │            │     outline style, text-tertiary
│          └─────────┘            │
│                                 │
│     No orders yet               │  ← Title, text-primary
│     Create your first order     │  ← Body, text-secondary
│     to get started              │
│                                 │
│  ┌─────────────────────────┐   │
│  │     Create Order          │   │  ← Primary CTA button
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

### Error State

```
┌─────────────────────────────────┐
│                                 │
│          ┌─────────┐            │
│          │ ⚠️       │            │  ← Red warning icon, 64px
│          └─────────┘            │
│                                 │
│     Something went wrong        │  ← Title, text-primary
│     Could not load orders       │  ← Body, text-secondary
│                                 │
│  ┌─────────────────────────┐   │
│  │       Try Again           │   │  ← Outline primary button
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

### Offline State (shown with OfflineBanner)

```
┌─────────────────────────────────┐
│ ⚠ You're offline. Showing cache.│  ← #FFF3E0 bg, #FF8800 text
├─────────────────────────────────┤  ← Full-width amber strip
│         (current screen)        │     below top nav bar
│         (data from SQLite)      │
│         (may be stale)          │
│                                 │
│  ⚠ Data may be outdated         │  ← Small footer note on cards
│  Last synced 45 min ago         │     Caption, text-secondary
│                                 │
└─────────────────────────────────┘
```

---

## Syncing Overlay (shown during login sync and manual sync)

```
┌─────────────────────────────────┐
│         #F7F9FC bg              │
│                                 │
│                                 │
│          ┌─────────┐            │
│          │  🔄      │            │  ← Spinning sync icon, 64px
│          │ (blue)   │            │     #1A56DB, rotating animation
│          └─────────┘            │
│                                 │
│      Syncing your data…         │  ← Title, text-primary
│                                 │
│   ████████████░░░░░░░           │  ← Progress bar: #1A56DB fill
│         Phase 1 of 2            │     #E5E7EB track, r=4px
│      Uploading changes…         │  ← Caption, text-secondary
│                                 │     updates to "Refreshing data…"
│                                 │
└─────────────────────────────────┘
```

---

## Logout Guard Modal (shown when pending changes exist on logout)

```
┌─────────────────────────────────┐
│         (dimmed background)      │
│                                 │
│  ┌─────────────────────────┐   │
│  │                          │   │  ← bg-card, r=20px, elevation 4
│  │  ⚠️ Unsynced Changes      │   │     centered on screen
│  │                          │   │
│  │  You have 3 changes that │   │  ← Body, text-primary
│  │  haven't been synced to  │   │
│  │  the server yet.         │   │
│  │                          │   │
│  │  Signing out without     │   │  ← Caption, danger text
│  │  syncing will lose data. │   │
│  │                          │   │
│  │  ┌───────────────────┐   │   │
│  │  │ Sync & Sign Out    │   │   │  ← Green button (primary action)
│  │  └───────────────────┘   │   │
│  │                          │   │
│  │      Cancel               │   │  ← Grey text link (cancel)
│  │                          │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

## Push Notification Permission Modal (shown after first login)

```
┌─────────────────────────────────┐
│         #F7F9FC bg              │
│                                 │
│                                 │
│          ┌─────────┐            │
│          │  🔔      │            │  ← Bell illustration with sparkles
│          │ ✨       │            │     120×120px, primary blue tones
│          └─────────┘            │
│                                 │
│      Stay in the loop           │  ← Title, text-primary
│                                 │
│  Get notified when orders       │  ← Body, text-secondary, centered
│  update, sync completes, or     │
│  payments are recorded          │
│                                 │
│  ┌─────────────────────────┐   │
│  │  Enable Notifications    │   │  ← Primary blue button
│  └─────────────────────────┘   │
│                                 │
│       Not Now                   │  ← Caption, text-tertiary
│                                 │
└─────────────────────────────────┘
```
