# 🍲 MealMap — Nigerian Food & Weekly Meal Planner

A lightweight, modern web application for planning meals, managing recipes with an authentic Nigerian culinary focus, tracking kitchen inventory, and generating smart grocery shopping lists.

Built with **pure HTML, CSS, and vanilla JavaScript** — zero frameworks, zero external dependencies, no server, and no database required. All user data is persisted directly in the browser via `localStorage`.

---

## ✨ Features

### 1. 📖 Recipe Management
- **Add, View, Edit, and Delete** recipes with confirmation dialogs.
- Rich metadata: Prep time, cooking time, meal category (*Breakfast, Lunch, Dinner, Snack*), servings, ingredients, step-by-step instructions, and photo URL.
- Real-time search by recipe name or ingredients.
- Category filtering tabs and recipe counter.
- **Preloaded Nigerian Heritage Collection (18 dishes)**:
  - *Jollof Rice (Smoky Party Style)*
  - *Egusi Soup with Assorted Meat & Bitterleaf*
  - *Silky Pounded Yam (Iyan)*
  - *Efo Riro (Rich Yoruba Vegetable Soup)*
  - *Golden Crispy Akara (Bean Cakes)*
  - *Steamed Moi Moi (Savory Bean Pudding)*
  - *Yam Porridge (Asaro Elepo Rebe)*
  - *Ewa Aganyin with Spicy Sauce*
  - *Ofada Rice with Spicy Ayamase (Designer Stew)*
  - *Seafood Okra Soup (Ila Alasepo)*
  - *Traditional Ogbono Soup*
  - *Delta Banga Soup*
  - *Calabar Afang Soup*
  - *Edikang Ikong Soup*
  - *Amala with Ewedu & Gbegiri (Abula)*
  - *Nigerian Beef Suya*
  - *Fluffy Puff Puff & Meat Pie*
  - *Traditional Ogi (Pap) with Milk*
  - *International alternatives (Creamy Tuscan Chicken, Fluffy Pancakes)*

### 2. 🎲 "What Should I Eat Today?" (Smart Assistant)
- **Cuisine Discovery**: Focused on Nigerian regional dishes.
- **Smart Kitchen Match**: Analyzes recipes against your Kitchen Inventory, calculates the percentage match, and color-codes in-stock vs missing ingredients.
- **Surprise Me**: Discover a random Nigerian meal suggestion.
- **One-Click Actions**: Directly add any suggestion to your weekly meal plan or add missing ingredients to your shopping list.

### 3. 📅 Weekly Meal Planner
- Covers **Monday through Sunday** with 4 slots per day (*Breakfast, Lunch, Dinner, Snack*).
- Day switcher tabs (*All Week, Mon, Tue, Wed, Thu, Fri, Sat, Sun*).
- **Export Plan to Shopping List**: Automatically finds all missing ingredients across the week's meal plan and adds them to your shopping list.
- Friendly empty state when no meals are planned.

### 4. 🥫 Kitchen Inventory
- Track items with quantity, unit of measurement (*kg, g, derica, cups, tubers, pieces, bunch, wraps, liters, cans, tbsp, tsp, pinch*), and expiry date.
- Color-coded status badges: **Expired**, **Expiring Soon (within 3 days)**, **Running Low**, and **In Stock**.
- Real-time ingredient search and filter pills.
- One-click *"+ Shopping List"* button to replenish low or expired stock.

### 5. 🛒 Shopping List
- Interactive checkboxes to mark items as purchased (with strikethrough styling).
- **"Move Purchased to Kitchen"**: Transfers checked-off items directly into your Kitchen Inventory with a default 30-day shelf life.
- Edit, delete, and filter (*All, Pending, Purchased*).
- Search and counters for pending vs total items.

### 6. 📊 Dashboard
- Dynamic time-of-day greeting (*"Good morning / afternoon / evening, Chef!"*) with today's date.
- Real-time metric counters for saved recipes, planned meals, kitchen items, and shopping items.
- **Today's Planned Meals**: Shows today's breakfast, lunch, dinner, and snack based on the current day of the week.
- **Daily Nigerian Spotlight**: Daily featured recipe with quick shuffle.
- **Inventory Alerts**: Highlights ingredients that are expired, expiring soon, or running low.
- **Week at a Glance**: Visual glance of the week's planned meals.

---

## 🎨 Design & Styling
- Warm culinary color palette inspired by Nigerian cuisine: Ivory/Cream (`#faf8f5`), Forest Emerald Green (`#15803d`), and Spicy Jollof Terracotta (`#ea580c`).
- Desktop sidebar navigation and mobile-friendly bottom navigation bar.
- Responsive design tailored for mobile phones, tablets, and desktop displays.
- Inline SVG icons with zero external CDN dependencies.

---

## 🚀 Getting Started

1. Clone or download this repository.
2. Open `index.html` directly in any modern web browser:
   ```bash
   # On Windows
   start index.html

   # On macOS
   open index.html

   # On Linux
   xdg-open index.html
   ```
3. No build steps, Node.js, or server setup required!

---

## 📁 File Structure
```
weekly-meal-planner/
├── index.html        # App layout, views, modals, and templates
├── style.css         # Styling, color palette, responsive design & print styles
├── script.js         # State management, localStorage, business logic & starter recipes
├── README.md         # Documentation
└── .gitignore        # Git ignore rules
```

---

## 📄 License
MIT License. Created with ❤️ for food lovers and Nigerian cuisine enthusiasts.
