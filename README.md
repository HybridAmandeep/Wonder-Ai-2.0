# ✈️ WanderAI — AI-Powered Travel Booking & Itinerary Platform

![WanderAI Banner](assets/logo.png)

> **WanderAI** is a world-class, high-converting travel booking portal and AI itinerary planner designed with inspiration from **Booking.com**, **Kayak**, **MakeMyTrip**, and **Agoda**, fully optimized for **16:9 Full-Bleed Widescreen Coverage**, **Desktop & Mobile Access**, and **all browser zoom levels (50% to 300%+)**.

---

## 🖥️ 16:9 Widescreen Full-Bleed & Zoom Adaptable UI

- **Zero White Side Strips on 16:9 Monitors**: All top utility bars, main headers, hero backgrounds, section wrappers, and footers bleed 100% edge-to-edge across any 16:9 display resolution (1080p, 1440p, 4K, 8K) with zero side margins.
- **Adaptable Across All Zoom Levels (50% to 300%+)**: Uses fluid typography (`clamp()`), flex wrapping, and responsive container bounds (`max-width: 100%`) so elements never break or trigger unwanted horizontal scrollbars when zooming in/out.
- **Fixed Mobile Bottom Navigation (`.mobile-nav`)**: Touch-friendly bottom tabs (**Home**, **Stays**, **AI Plan**, **Saved**, **Account**) for smartphone viewports.
- **Slide-Over Mobile Drawer (`.mobile-slide-menu`)**: Smooth hamburger menu transition with backdrop blur overlay.

---

## 🌟 Key Features & Highlights

### 🏨 1. Multi-Modal Booking Search Widget
- **Tabs**: Search for **Stays**, **Flights**, **AI Trip Planner**, **Packages**, and **Cars**.
- **Guests & Rooms Counter Popover**: Interactive counter controls (+ / -) for adults, children, and room allocation.
- **Flight Route Controls**: One-click origin/destination airport swap button.
- **Twin Datepicker**: Integrated range selection via Flatpickr.
- **Autocomplete Search**: Instant dropdown search for global destinations.

### ✨ 2. Live AI Itinerary Generator & Playground
- **Prompt Switcher**: One-click prompt pills for Kyoto, Maldives, Swiss Alps, and Santorini.
- **Interactive Timeline**: Renders day-by-day travel breakdown, activity tags, estimated budget, best travel season, and weather forecasts.

### 🏔️ 3. Global Explore & Search Portal (`booking.html`)
- **Filter Panel**: Refine results by keyword search, vibe/category (Beach, Ski, Nature, Culture), max budget slider, and duration slider.
- **Destination Detail View Modal**: Features live **OpenWeatherMap API** integration (temperature, humidity, wind speed, weather icon), included activities list, and real-time cost calculator.

### 💳 4. Secure Checkout & Demo Payment Gateway (`checkout.html`)
- **Step Progress Bar**: `1. Select Destination ➔ 2. Traveler & Billing ➔ 3. Instant Payment`.
- **Itemized Summary Card**: Auto-populates base rate, Genius member discount, taxes, and total.
- **Coupon Code Engine**: Validates promo codes (`WANDERAI20`, `GENIUS15`, `FLYAI10`) with live price recalculation.
- **Demo Payment Gateway Popup Modal**:
  - **UPI / QR Code Tab**: QR Scanner graphic & VPA ID input (e.g. `user@upi`).
  - **Debit / Credit Card Tab**: Real-time card input formatting.
- **Automated Dashboard Sync**: 1.5-second realistic authorization simulation, instant success toast, and automatic redirection to `dashboard.html`.

### 🧳 5. User Travel Desk & Dashboard (`dashboard.html`)
- **Genius Loyalty Tier Badge**: Displays active user membership status (Genius Level 2).
- **My Confirmed Trips**: Renders all completed bookings stored in `localStorage`.
- **Account Settings**: Interactive user profile form.

### 💖 6. Saved Wishlist (`wishlist.html`)
- **Live Wishlist Sync**: Heart toggle buttons on destination cards sync instantly with top utility bar counter (`#navWishlistCount`).
- **Wishlist Grid**: Saved cards feature 1-click remove and direct "Book Saved Trip" CTAs.
- **Empty State UI**: Clean call-to-action when no trips are saved.

### 👑 7. Membership Tiers & Pricing (`pricing.html`)
- **Plans**: Explorer ($0/mo), Nomad Pass ($12/mo), and Atlas VIP ($29/mo).
- **Interactive Toggle Switch**: Smooth Monthly vs. Annual Billing switch with a white circular knob (saves 20% on annual plans).

### 🎨 8. Brand Identity & Design System (`moodboard.html`)
- **Curated Color Tokens**: Brand Navy (`#003580`), Booking Blue (`#006CE4`), Genius Gold (`#FFB700`), AI Cyan (`#0EA5E9`), and Coral Pink (`#F43F5E`).
- **Typography & Components**: Plus Jakarta Sans & Inter font hierarchy, outlined iconography, and card specimens.

---

## 📁 Repository File Structure

```
wanderai-integrated/
├── index.html         # Main Landing Page & Search Engine
├── booking.html       # Explore Portal & Destination Search
├── checkout.html      # Secure Checkout & Demo Payment Gateway
├── dashboard.html     # User Travel Desk & Confirmed Trips
├── wishlist.html      # Saved Wishlist Grid & Empty State UI
├── pricing.html       # Membership Tiers & Annual Billing Toggle
├── login.html         # Auth Sign In Portal
├── signup.html        # Auth Registration Portal
├── moodboard.html     # Brand Guide & Design System
├── style.css          # Unified Global CSS Design Tokens & Components
├── script.js         # Modular UI Controllers & Event Handlers
├── data.js           # Central Data Layer & localStorage Persistence
├── assets/           # Logos & UI Brand Assets
└── images/           # Destination & Hero Photography
```

---

## 🛠️ Technology Stack

- **Frontend Core**: HTML5, Vanilla JavaScript (ES6+), Vanilla CSS3 (CSS Variables, Flexbox/Grid, Glassmorphism).
- **Iconography**: [Lucide Icons](https://lucide.dev/) & [Phosphor Icons](https://phosphoricons.com/).
- **Date Picker**: [Flatpickr](https://flatpickr.js.org/).
- **Live Weather API**: [OpenWeatherMap API](https://openweathermap.org/api) integration with fallback simulation.

---

## 🚀 How to Run Locally

1. Clone or download this repository to your local machine.
2. Open `index.html` directly in any modern web browser (Chrome, Edge, Firefox, Safari), or serve using VS Code **Live Server** extension:
   ```bash
   npx http-server .
   ```
3. Navigate through the portal:
   - Search for stays or flights on `index.html`.
   - Filter destinations on `booking.html`.
   - Complete a test booking on `checkout.html` using the **Demo Payment Gateway**.
   - View your confirmed trip in `dashboard.html`.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information. Inspired by Booking.com, Kayak, MakeMyTrip, and Agoda design systems.
