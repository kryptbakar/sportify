# Design Guidelines: Football-Themed Turf Booking & Matchmaking Platform

## Design Approach

**Reference-Based Approach**: Drawing inspiration from sports platforms like ESPN, FotMob, and FIFA's digital experiences, combined with booking platforms like Airbnb's card-based layouts. The design must embrace a bold football aesthetic throughout - this is not a subtle corporate application but an immersive sports experience.

## Typography

**Font Families**:
- Primary: 'Inter' (Google Fonts) - for body text and UI elements
- Display: 'Bebas Neue' or 'Oswald' (Google Fonts) - for headlines, scores, and athletic emphasis
- Monospace: 'Roboto Mono' - for match times, countdowns, and statistics

**Hierarchy**:
- Hero Headlines: Display font, 48-72px, uppercase, bold
- Section Headers: Display font, 32-48px, uppercase, semi-bold
- Card Titles: Primary font, 20-24px, semi-bold
- Body Text: Primary font, 16px, regular
- Stats/Numbers: Monospace, 18-24px for emphasis
- Timestamps: Monospace, 14px

## Layout System

**Spacing Units**: Use Tailwind spacing of 4, 6, 8, 12, 16, 20, and 24 for consistent rhythm (e.g., p-4, gap-8, mt-12, py-20).

**Grid Strategy**:
- Desktop: 3-4 column grids for turf listings, match cards, team profiles
- Tablet: 2 column layouts
- Mobile: Single column stacking
- Maximum content width: max-w-7xl with px-4 padding

## Core Components

### Navigation
- Top navbar with football pitch line pattern border-bottom
- Logo area with football/goal icon
- Primary navigation items with scoreboard-style active indicators
- User profile dropdown with team badge styling
- Admin toggle switch with referee whistle icon

### Hero Sections
**User Portal Landing**:
- Full-width hero with turf field image background (aerial view of green pitch with white markings)
- Centered content with headline + search/CTA
- Subtle grass texture overlay
- Hero height: 70vh on desktop, natural on mobile

**Admin Dashboard**:
- Stats banner with match scoreboard styling
- Key metrics in goalkeeper glove-shaped containers
- Live status indicators mimicking score displays

### Turf Listing Cards
- Photo with pitch markings overlay
- Turf name in display font
- Location with map pin icon
- Price in scoreboard number style
- Availability status (green circle = available, red = booked)
- Quick book button with grass texture background

### Team Profile Cards
- Player card aesthetic with team photo/logo
- Team name in display font
- ELO rating badge (Bronze/Silver/Gold/Platinum) with metallic finish
- Win/Loss/Draw stats in scoreboard format
- Recent match history timeline

### Match History Display
- Scoreboard-style results cards
- Team A vs Team B layout with score prominently displayed
- Date/time in monospace
- Field location indicator
- Goals scored/conceded breakdown with football icons

### Booking Calendar
- Week view with pitch lane styling
- Time slots as grass-colored blocks
- Booked slots in darker shade
- Selected slot highlighted with white pitch lines
- Hover state with subtle goal net pattern

### Ranking Leaderboard
- Table with alternating grass shade rows
- Position numbers in large display font
- Team badges/logos
- ELO rating progress bars
- Tier badges (use metallic Bronze/Silver/Gold/Platinum shields)

### Tournament Cards
- Stadium-style card design
- Tournament bracket icon
- Registration deadline countdown (monospace)
- Prize information in trophy icon callout
- Featured tournaments use champion's podium styling

### Forms & Inputs
- Input fields with subtle grass texture border
- Focus state: bright white border (like pitch lines)
- Labels in uppercase display font
- Submit buttons styled as referee whistles or goal posts
- Date pickers with football calendar icons

### Admin Dashboard Components
- Booking management table with sortable columns
- Approval/reject actions with referee flag icons
- Revenue charts with green gradient fills
- Real-time booking notifications with whistle sound icon
- Turf slot editor with drag-and-drop pitch timeline

### Modals & Overlays
- Stadium entrance-style slide-in panels
- Confirmation dialogs with referee card aesthetic
- Success messages with goal celebration styling
- Error states with red card visual treatment

## Images

**Hero Images**:
1. **User Landing**: Aerial view of pristine football turf with white pitch markings, vibrant green grass, evening golden hour lighting - place as full-width background
2. **About/Features Section**: Action shot of players on turf field, slightly blurred background with focused foreground
3. **Admin Portal**: Dashboard doesn't need large hero, use smaller banner with turf texture

**Supporting Images**:
- Turf listing cards: Photos of actual football pitches, 16:9 aspect ratio
- Team profiles: Team photos or logo placeholders with stadium background
- Tournament banners: Trophy and crowd celebration imagery
- Testimonials: User photos with football field background blur

**Image Treatment**: All images should have subtle grass texture overlay where appropriate, maintaining the football aesthetic without obscuring content.

## Accessibility

- Maintain WCAG 2.1 AA contrast ratios (especially important with green backgrounds)
- All interactive elements minimum 44x44px touch target
- Form inputs with clear focus indicators (white pitch line borders)
- Icon buttons include aria-labels
- Keyboard navigation with visible focus states

## Football Theme Visual Elements

**Patterns & Textures**:
- Subtle grass texture on card backgrounds
- Pitch line patterns for section dividers
- Goal net patterns for overlays
- Scoreboard LED number styling for stats

**Icons**: Use Font Awesome or Heroicons, prioritize:
- Football/soccer ball, goal posts, whistle, trophy, map pin, calendar, clock, star (for ratings), shield (for tiers), users (for teams)

**Visual Motifs**:
- Corner flag elements for page corners
- Penalty box lines for content containers
- Center circle patterns for loading states
- Yellow/red card indicators for alerts

## Animations

Use sparingly and purposefully:
- Score counter animations when displaying match results
- Smooth transitions for booking calendar interactions
- Subtle hover lift on cards (2-4px transform)
- Loading states with rotating football icon
- Success confirmations with goal celebration micro-interaction