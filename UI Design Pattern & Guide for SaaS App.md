Got it — let’s design a **UI/UX system** for your SaaS app that covers both the **marketing site** and the **authenticated dashboard**. This will be your blueprint so everything looks consistent, scalable, and modern.

---

# 🎨 UI Design Pattern & Guide for SaaS App

---

## 1. **Design Philosophy**

* **Minimal, clean, and consistent**

  * Use **TailwindCSS 4** with a design token system (colors, spacing, typography).
  * Stick to a **8px spacing scale** (4/8/12/16/24/32).
  * Rounded corners (e.g. `rounded-2xl`) and soft shadows for cards/buttons.
* **Responsive-first**

  * Layout should adapt gracefully to mobile → tablet → desktop.
  * Use grid/flex layouts with `gap-*` instead of fixed padding.
* **Dark mode ready**

  * Tailwind’s `dark:` variant for background/foreground consistency.
* **Framer Motion** for subtle animations (fade-in, hover lift, modal transitions).
* **Accessibility**

  * Semantic HTML (`<button>`, `<label>`, `<nav>`).
  * ARIA roles where needed (menus, modals).
  * High color contrast.

---

## 2. **Color Palette (example system)**

| Role         | Light Mode             | Dark Mode              |
| ------------ | ---------------------- | ---------------------- |
| Background   | `#ffffff`              | `#0f172a` (slate-950)  |
| Surface      | `#f8fafc` (slate-50)   | `#1e293b` (slate-800)  |
| Text Primary | `#0f172a`              | `#f8fafc`              |
| Text Muted   | `#475569`              | `#94a3b8`              |
| Brand        | `#2563eb` (blue-600)   | `#3b82f6` (blue-500)   |
| Accent       | `#f97316` (orange-500) | `#fb923c` (orange-400) |
| Border       | `#e2e8f0`              | `#334155`              |
| Error        | `#dc2626`              | `#ef4444`              |
| Success      | `#16a34a`              | `#22c55e`              |

👉 Define these as **CSS variables** in `globals.css`:

```css
:root {
  --color-bg: #ffffff;
  --color-surface: #f8fafc;
  --color-text: #0f172a;
  --color-brand: #2563eb;
}

.dark {
  --color-bg: #0f172a;
  --color-surface: #1e293b;
  --color-text: #f8fafc;
  --color-brand: #3b82f6;
}
```

---

## 3. **Typography System**

Use **Tailwind’s font scale** with one brand font (e.g., Inter, Geist, or Manrope).

* **Display (landing headlines)** → `text-5xl font-bold`
* **H1 (page titles)** → `text-3xl font-bold`
* **H2 (section titles)** → `text-2xl font-semibold`
* **H3 (cards, sub-sections)** → `text-xl font-medium`
* **Body** → `text-base leading-relaxed`
* **Muted/labels** → `text-sm text-muted`

---

## 4. **UI Components Pattern**

Define a reusable set of components in `components/ui/`.

### 🔑 Core Components

* **Button** → Primary / Secondary / Ghost / Destructive
* **Input** → Text, Password, Email, Textarea
* **Select / Dropdown**
* **Card** → Shadowed surface with header/body/footer
* **Modal/Dialog** → Centered with overlay, close button
* **Tabs** → Horizontal navigation inside dashboard
* **Badge** → Status indicators (`success`, `error`, `warning`)
* **Table** → With sticky header, responsive collapse for mobile
* **Skeleton Loader** → Gray placeholders

### Example: Button.tsx

```tsx
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const button = cva(
  "px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50",
  {
    variants: {
      intent: {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200",
        ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800",
        destructive: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        sm: "text-sm px-3 py-1.5",
        md: "text-base px-4 py-2",
        lg: "text-lg px-6 py-3",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
    },
  }
);

export function Button({ intent, size, className, ...props }) {
  return <button className={cn(button({ intent, size }), className)} {...props} />;
}
```

---

## 5. **Page Layouts**

### 📢 Marketing Site (`app/(site)`)

* **Navigation bar**

  * Logo left
  * Links (`Pricing`, `Docs`, `Login`) right
  * CTA button (`Get Started`)
* **Hero section**

  * Big headline
  * Subtext
  * CTA button + secondary CTA (e.g., “See Docs”)
  * Illustration or 3D animation (Three.js fits here since you have it installed)
* **Feature showcase**

  * Grid of cards with icons
* **Testimonials / Social proof**
* **Pricing**
* **Footer**

  * Logo, quick links, social icons

### 🛠️ Dashboard (`app/(app)/w/[workspaceId]`)

* **Sidebar navigation**

  * Logo
  * Menu items: Dashboard, Projects, API Keys, Webhooks, Settings
  * Collapsible with icons
* **Topbar**

  * Search, notifications, user avatar dropdown
* **Content area**

  * Responsive grid layout
  * Cards for usage stats, subscription status
  * Tables for API keys, logs
* **Settings**

  * Tabs: General, Billing, Members, Security

### 📱 Mobile adaptations

* Replace sidebar with a bottom navigation bar (or drawer menu).
* Collapsible tables → card-style on small screens.

---

## 6. **Motion & Interactions**

* Page transitions: fade-in + slide-up (`framer-motion`).
* Buttons: subtle scale up (`whileHover={{ scale: 1.05 }}`).
* Modals: spring pop-in.
* Loading states: skeleton shimmer.

---

## 7. **Design Tokens & Variants**

* Stick to **design tokens** for spacing, color, radius, shadow.
* Centralize them in Tailwind config for consistency.
* Example:

```ts
theme: {
  extend: {
    colors: {
      brand: { DEFAULT: "#2563eb", dark: "#1e40af" },
    },
    borderRadius: {
      xl: "1rem",
      "2xl": "1.5rem",
    },
    boxShadow: {
      card: "0 4px 12px rgba(0,0,0,0.08)",
    },
  },
}
```

---

## 8. **UX Checklist**

* [ ] Consistent **empty states** (illustration + CTA).
* [ ] **Toast notifications** for success/error (e.g., `react-hot-toast`).
* [ ] **Loading states**: skeletons instead of spinners where possible.
* [ ] **Error boundaries** in dashboard pages.
* [ ] **Keyboard shortcuts** for power users (Ctrl+K search).

---

## 9. **Docs & Dev UX**

* Use **MDX** for docs pages with a sidebar navigation.
* Show **copy-paste examples** with “copy to clipboard” buttons.
* Ensure **dark mode** looks polished in docs.

---

✅ With this system, your app’s **UI will feel cohesive** across marketing, dashboard, and developer docs while remaining **scalable and easy to maintain**.

---
