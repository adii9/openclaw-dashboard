# Openclaw Dashboard — SPEC.md

## Concept & Vision

A cyberpunk-inspired command center for Openclaw agents. The dashboard feels like stepping into a high-tech control room — dark, moody backgrounds punctuated by electric cyan and violet neon glows. Glass morphism panels float over subtle grid patterns, creating depth. Motion is intentional and cinematic: elements slide in with orchestrated timing, hover states pulse with energy, and status indicators breathe with life. This isn't just a dashboard — it's mission control.

## Design Language

### Aesthetic Direction
**Cyberpunk Command Center** — Dark base with electric neon accents, glass panels, grid overlays, and dramatic lighting effects. Think TRON meets a modern IDE.

### Color Palette
- `--bg-deep`: #0a0a0f (deepest background)
- `--bg-panel`: #12121a (panel backgrounds)
- `--bg-elevated`: #1a1a25 (elevated surfaces)
- `--accent-cyan`: #00f0ff (primary accent — electric cyan)
- `--accent-violet`: #a855f7 (secondary accent — neon violet)
- `--accent-emerald`: #10b981 (success/active states)
- `--accent-amber`: #f59e0b (warning states)
- `--accent-rose`: #f43f5e (error/stop states)
- `--text-primary`: #f0f0f5 (main text)
- `--text-muted`: #6b7280 (secondary text)
- `--glow-cyan`: 0 0 20px rgba(0, 240, 255, 0.5)
- `--glow-violet`: 0 0 20px rgba(168, 85, 247, 0.5)

### Typography
- **Display/Headers**: "Orbitron" — geometric, futuristic, commanding
- **Body/UI**: "IBM Plex Sans" — clean, technical, highly readable
- **Monospace/Code**: "IBM Plex Mono" — for logs, configs, code snippets

### Spatial System
- Base unit: 4px
- Panel padding: 24px
- Gap between panels: 16px
- Border radius: 12px (panels), 8px (buttons), 4px (inputs)
- Glass panels: backdrop-blur-xl with semi-transparent backgrounds

### Motion Philosophy
- **Entrance**: Staggered fade-up with 50ms delays between elements, ease-out curves
- **Hover**: Scale 1.02 with glow intensification, 200ms
- **Active states**: Subtle pulse animation (box-shadow breathing)
- **Page transitions**: Cross-fade with slight scale, 300ms
- **Ambient**: Subtle gradient shift on background, floating particles optional

### Visual Assets
- Icons: Lucide React (consistent, clean, good neon compatibility)
- Decorative: CSS grid patterns, scanline overlays, corner brackets on panels
- Status indicators: Glowing dots with pulse animations

## Layout & Structure

### Overall Architecture
```
┌─────────────────────────────────────────────────────────────┐
│  NAVBAR (fixed top, glass)                                   │
│  [Logo] [Agents] [Cron] [Config] [Chat]        [Status] [User]│
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌──────────────────────────────────────┐  │
│  │             │  │                                       │  │
│  │  SIDEBAR    │  │  MAIN CONTENT AREA                    │  │
│  │  (context   │  │  (changes based on active section)     │  │
│  │   sensitive)│  │                                       │  │
│  │             │  │                                       │  │
│  └─────────────┘  └──────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Page Sections
1. **Dashboard Home** — Overview with agent status grid, recent activity, quick actions
2. **Agents** — Full agent management with status, logs, config per agent
3. **Cron Jobs** — Schedule management, execution history, next run times
4. **Config** — Global and per-agent configuration with JSON editor
5. **Chat** — Direct communication interface with Openclaw

### Responsive Strategy
- Desktop-first (this is a command center)
- Tablet: Collapse sidebar to icons
- Mobile: Bottom navigation, stacked panels

## Features & Interactions

### Navigation
- Horizontal navbar with section icons + labels
- Active section has cyan underline + glow
- Hover: Text brightens, subtle scale up
- Click: Smooth transition to section

### Agent Cards
- Grid of cards showing agent name, status (running/stopped/error), last active
- Status indicator: Glowing dot (green=running, amber=idle, rose=error)
- Hover: Card lifts (translateY -4px), border glows
- Click: Opens agent detail panel

### Agent Detail Panel
- Slide-in from right (400px wide)
- Shows: Agent ID, status, created date, configuration, recent logs
- Logs displayed in monospace with syntax highlighting
- Actions: Start/Stop/Restart button, Edit Config

### Cron Jobs Table
- Columns: Name, Schedule (cron expression), Next Run, Last Run, Status, Actions
- Status badges with appropriate colors
- Hover: Row highlights
- Actions: Edit, Delete, Trigger Now
- Empty state: Illustrated graphic with "No cron jobs yet"

### Config Editor
- Split view: Config tree on left, JSON editor on right
- Syntax highlighting for JSON
- Validation indicators (red underline for errors)
- Save button with loading state
- Discard changes with confirmation

### Chat Interface
- Full-height chat panel
- Message bubbles: User (right, cyan), Openclaw (left, violet)
- Typing indicator: Three bouncing dots
- Input: Rounded, glowing border on focus
- Send on Enter, Shift+Enter for newline
- Markdown rendering in responses

### Status Bar (bottom of navbar)
- Connection status dot (green=connected)
- Last sync time
- Quick stats: Active agents / Total

## Component Inventory

### NavBar
- States: Default, scrolled (more opaque)
- Contains: Logo, nav items, status indicators, user menu

### NavItem
- States: Default, hover, active, disabled
- Active: Cyan text + underline glow

### AgentCard
- States: Default, hover, selected, loading
- Shows: Avatar/icon, name, status dot, last active

### StatusDot
- States: Running (green pulse), Idle (amber), Error (rose), Offline (gray)
- Animation: Continuous pulse for running state

### Panel (glass card)
- States: Default, hover (subtle lift), loading (shimmer)
- Decorative: Corner brackets, subtle border

### Button
- Variants: Primary (cyan), Secondary (ghost), Danger (rose)
- States: Default, hover, active, disabled, loading
- Animation: Scale down on click

### Input
- States: Default, focus (glow), error, disabled
- Dark background, subtle border

### Badge
- Variants: Success, Warning, Error, Info, Neutral
- Pill shape with appropriate color

### Table
- Hover: Row highlight
- Sortable columns with indicator arrows
- Loading: Skeleton rows

### ChatBubble
- Variants: User, Openclaw
- Timestamp on hover
- Markdown content rendering

## Technical Approach

### Stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion for animations
- Lucide React for icons
- Custom CSS for glass effects and glows

### Architecture
- App router with layout.tsx containing NavBar
- Client components for interactive elements
- Sections as separate components for clean code
- CSS variables for theming

### Key Implementation Details
- Use `use client` directive for Framer Motion components
- CSS backdrop-filter for glass morphism
- CSS @keyframes for ambient animations
- Intersection Observer for scroll-triggered animations
- Local state management with useState/useReducer