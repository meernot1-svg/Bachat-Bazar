---
Task ID: 1
Agent: Main Agent
Task: Fix Bachat Bazar e-commerce app - fonts, banners, admin panel, images, colors, routing

Work Log:
- Read all source files (BachatBazarApp.tsx, data.ts, store.ts, globals.css, layout.tsx)
- Updated layout.tsx to use Inter (body) + Poppins (headings) fonts via next/font/google
- Updated globals.css with improved color scheme, glass effect, font references, hero animations
- Updated data.ts with proper product image IDs matching categories, added BannerData/SaleData interfaces and default data
- Updated store.ts with banner CRUD (addBanner, updateBanner, deleteBanner, toggleBanner) and sale CRUD (addSale, updateSale, deleteSale, toggleSale) plus updateOrderStatus
- Completely rewrote BachatBazarApp.tsx with:
  - Pakistani-style gradient hero banners (no dependency on external images)
  - Active sales strip and admin-managed banners on homepage
  - Prominent green gradient Admin button in navbar with pulse animation
  - Comprehensive admin panel with 6 tabs: Dashboard, Products, Orders, Banners, Sales, Categories
  - Fixed product click routing using window.location.hash
  - Fixed SSR hydration error with typeof window guard
  - All headings use Poppins font, body uses Inter
  - Improved color combination with glass-effect header
- Build passes successfully, dev server returns HTTP 200

Stage Summary:
- All reported issues addressed: fonts, banners, admin panel, product images, color scheme, routing, text mixing
- Build successful with no errors
- Key files modified: layout.tsx, globals.css, data.ts, store.ts, BachatBazarApp.tsx
