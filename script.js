/**
 * ==============================================================================
 * MEALMAP APP — SCRIPT.JS (LUXURY CULINARY EDITION)
 * Authentic Nigerian Food Guide, Kitchen Inventory & Weekly Meal Planner
 * Pure Vanilla JavaScript (Zero external dependencies, 100% localStorage)
 * ==============================================================================
 */

const App = (function () {
  'use strict';

  // ----------------------------------------------------------------------------
  // 1. STORAGE KEYS & CONSTANTS
  // ----------------------------------------------------------------------------
  const STORAGE_KEYS = {
    RECIPES: 'mealmap_recipes_data',
    INVENTORY: 'mealmap_inventory_data',
    PLANNER: 'mealmap_planner_data',
    SHOPPING: 'mealmap_shopping_data',
    // Dedicated per-browser profile record: { name, greetingPref, createdAt, updatedAt }
    PROFILE: 'mealmap_user_profile_v1',
    // Legacy keys (pre-profile-screen versions). Only READ once to migrate a name the
    // visitor themself saved in this browser; never written again.
    LEGACY_USER_NAME: 'mealmap_user_name',
    LEGACY_GREETING_PREF: 'mealmap_greeting_pref',
    INITIALIZED: 'mealmap_is_initialized'
  };

  const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'];

  // ----------------------------------------------------------------------------
  // 2. NIGERIAN MULTI-LINGUAL GREETINGS POOL
  // ----------------------------------------------------------------------------
  const NIGERIAN_GREETINGS = [
    // English, time-aware (first in the pool so a new profile reads "Good afternoon, <name>.")
    { lang: 'English', text: 'Good morning', punct: '.', timeOfDay: 'morning', subtitle: 'What are we cooking today?' },
    { lang: 'English', text: 'Good afternoon', punct: '.', timeOfDay: 'afternoon', subtitle: 'Time for a hearty lunch.' },
    { lang: 'English', text: 'Good evening', punct: '.', timeOfDay: 'evening', subtitle: 'Ready for a comforting dinner?' },

    // Yoruba
    { lang: 'Yoruba', text: 'Ẹ káàbọ̀', timeOfDay: 'any', subtitle: 'Welcome to your kitchen!' },
    { lang: 'Yoruba', text: 'Ẹ kú àárọ̀', timeOfDay: 'morning', subtitle: 'Good morning! What are we cooking today?' },
    { lang: 'Yoruba', text: 'Ẹ kú ọ̀sán', timeOfDay: 'afternoon', subtitle: 'Good afternoon! Time for a hearty lunch.' },
    { lang: 'Yoruba', text: 'Ẹ kú alẹ́', timeOfDay: 'evening', subtitle: 'Good evening! Ready for a comforting dinner?' },
    { lang: 'Yoruba', text: 'Oúnjẹ aládùn ń bọ̀', timeOfDay: 'any', subtitle: 'Delicious food is on the way!' },

    // Igbo
    { lang: 'Igbo', text: 'Nnọọ', timeOfDay: 'any', subtitle: 'Welcome back to your kitchen!' },
    { lang: 'Igbo', text: 'Ụtụtụ ọma', timeOfDay: 'morning', subtitle: 'Good morning! Let us make something delicious.' },
    { lang: 'Igbo', text: 'Ehihie ọma', timeOfDay: 'afternoon', subtitle: 'Good afternoon! Ready for a wonderful meal?' },
    { lang: 'Igbo', text: 'Mgbede ọma', timeOfDay: 'evening', subtitle: 'Good evening! Time to wind down and dine.' },
    { lang: 'Igbo', text: 'Nri dị ụtọ', timeOfDay: 'any', subtitle: 'Tasty authentic delicacies await you.' },

    // Hausa
    { lang: 'Hausa', text: 'Sannu', timeOfDay: 'any', subtitle: 'Greetings! Let us prepare a wonderful feast.' },
    { lang: 'Hausa', text: 'Ina kwana', timeOfDay: 'morning', subtitle: 'Good morning! Hope you had a restful night.' },
    { lang: 'Hausa', text: 'Barka da rana', timeOfDay: 'afternoon', subtitle: 'Good afternoon! Time for an energizing lunch.' },
    { lang: 'Hausa', text: 'Barka da yamma', timeOfDay: 'evening', subtitle: 'Good evening! Enjoy your evening dinner.' },
    { lang: 'Hausa', text: 'Barka da zuwa', timeOfDay: 'any', subtitle: 'Welcome warmly to your kitchen sanctuary.' },

    // Nigerian Pidgin
    { lang: 'Nigerian Pidgin', text: 'How far', timeOfDay: 'any', subtitle: 'Wetin we dey cook today? Body go sweet you!' },
    { lang: 'Nigerian Pidgin', text: 'You don chop?', timeOfDay: 'any', subtitle: 'Make we prepare correct original chow!' },
    { lang: 'Nigerian Pidgin', text: 'Abeg, wetin we go cook today?', timeOfDay: 'any', subtitle: 'Check your pantry and let us make magic.' },

    // Edo & Urhobo
    { lang: 'Edo', text: 'Kóyo', timeOfDay: 'any', subtitle: 'Warm greetings from the heart of Benin heritage!' },
    { lang: 'Urhobo', text: 'Migwo', timeOfDay: 'any', subtitle: 'Respectful greetings! Welcome to your kitchen.' },

    // English
    { lang: 'English', text: 'Welcome to your kitchen', timeOfDay: 'any', subtitle: 'Let’s make something truly delicious today.' },
    { lang: 'English', text: 'Good to have you here', timeOfDay: 'any', subtitle: 'Your weekly culinary planner is ready.' }
  ];

  // ----------------------------------------------------------------------------
  // 3. BESPOKE MEAL ART SVG GENERATOR (Accurate Neutral Visuals)
  // Ensures every meal has an exact visual representation and never a wrong photo
  // ----------------------------------------------------------------------------
  function generateBespokeMealCard(recipe) {
    const name = (recipe && recipe.name) ? recipe.name : 'Heritage Meal';
    const category = (recipe && recipe.category) ? recipe.category.toUpperCase() : 'MEAL';
    const region = (recipe && recipe.region) ? recipe.region : 'Heritage Nigerian';
    const isNigerian = !recipe || recipe.origin !== 'international';

    // Tailored culinary glyph based on recipe name / type
    const lower = name.toLowerCase();
    let glyph = '🍲';
    let iconLabel = 'Tradition';

    if (lower.includes('jollof') || lower.includes('rice')) {
      glyph = '🍚';
      iconLabel = 'Grain Platter';
    } else if (lower.includes('egusi') || lower.includes('soup') || lower.includes('efo') || lower.includes('banga') || lower.includes('okra') || lower.includes('ogbono') || lower.includes('afang') || lower.includes('edikang')) {
      glyph = '🍲';
      iconLabel = 'Heritage Soup Pot';
    } else if (lower.includes('pounded yam') || lower.includes('iyan') || lower.includes('amala') || lower.includes('eba') || lower.includes('fufu') || lower.includes('swallow')) {
      glyph = '🥣';
      iconLabel = 'Swallow & Mortar';
    } else if (lower.includes('suya') || lower.includes('beef')) {
      glyph = '🍢';
      iconLabel = 'Yaji Spiced Grill';
    } else if (lower.includes('puff') || lower.includes('akara') || lower.includes('pie') || lower.includes('snack')) {
      glyph = '🥟';
      iconLabel = 'Artisanal Pastry';
    } else if (lower.includes('ogi') || lower.includes('pap') || lower.includes('pancake')) {
      glyph = '🥞';
      iconLabel = 'Morning Comfort';
    } else if (lower.includes('pasta')) {
      glyph = '🍝';
      iconLabel = 'Continental Cuisine';
    }

    // Clean escaping for SVG XML
    const escapeXml = (unsafe) => {
      return (unsafe || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const cleanTitle = escapeXml(name);
    const cleanCategory = escapeXml(category);
    const cleanRegion = escapeXml(isNigerian ? `🇳🇬 ${region}` : `🌍 ${region}`);

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="480" viewBox="0 0 800 480">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#140d12"/>
            <stop offset="45%" stop-color="#2e0915"/>
            <stop offset="85%" stop-color="#180e14"/>
            <stop offset="100%" stop-color="#0a0608"/>
          </linearGradient>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fae392"/>
            <stop offset="50%" stop-color="#dfb547"/>
            <stop offset="100%" stop-color="#ad831c"/>
          </linearGradient>
          <pattern id="motif" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 0 20 L 20 0 L 40 20 L 20 40 Z" fill="none" stroke="rgba(223, 181, 71, 0.05)" stroke-width="1"/>
          </pattern>
        </defs>

        <!-- Luxury Textured Background -->
        <rect width="800" height="480" fill="url(#bgGrad)"/>
        <rect width="800" height="480" fill="url(#motif)"/>

        <!-- Gold Ornamental Border -->
        <rect x="20" y="20" width="760" height="440" rx="14" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" stroke-opacity="0.45"/>
        <rect x="28" y="28" width="744" height="424" rx="10" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"/>

        <!-- Top Badges -->
        <rect x="45" y="45" width="220" height="32" rx="16" fill="rgba(255, 255, 255, 0.1)"/>
        <text x="155" y="66" fill="#f5e4ab" font-family="'DM Sans', sans-serif" font-size="12" font-weight="700" letter-spacing="1.2" text-anchor="middle">${cleanRegion}</text>

        <rect x="620" y="45" width="135" height="32" rx="16" fill="rgba(223, 181, 71, 0.2)"/>
        <text x="687" y="66" fill="#ffffff" font-family="'DM Sans', sans-serif" font-size="12" font-weight="700" letter-spacing="1" text-anchor="middle">${cleanCategory}</text>

        <!-- Central Culinary Emblem -->
        <circle cx="400" cy="180" r="62" fill="rgba(255, 255, 255, 0.04)" stroke="url(#goldGrad)" stroke-width="1.5"/>
        <text x="400" y="196" font-size="64" text-anchor="middle" dominant-baseline="middle">${glyph}</text>

        <text x="400" y="260" fill="rgba(223, 181, 71, 0.85)" font-family="'DM Sans', sans-serif" font-size="11" font-weight="600" letter-spacing="2" text-anchor="middle">${escapeXml(iconLabel.toUpperCase())}</text>

        <!-- Dish Exact Name in Playfair Serif -->
        <text x="400" y="325" fill="#fcf9f2" font-family="'Playfair Display', Georgia, serif" font-size="34" font-weight="800" text-anchor="middle" letter-spacing="-0.5">${cleanTitle}</text>

        <!-- Subtle Branded Footer -->
        <line x1="320" y1="365" x2="480" y2="365" stroke="url(#goldGrad)" stroke-width="1" stroke-opacity="0.5"/>
        <text x="400" y="398" fill="rgba(255, 255, 255, 0.65)" font-family="'DM Sans', sans-serif" font-size="13" font-weight="500" letter-spacing="0.8" text-anchor="middle">MealMap Verified Recipe &bull; Authentic Cuisine</text>
      </svg>
    `;

    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg.trim());
  }

  // ----------------------------------------------------------------------------
  // 3b. IMAGE LIBRARY — the single source of truth for image <-> item associations
  //
  // * Recipe photographs live in assets/images/recipes/ and are keyed by RECIPE ID.
  // * Ingredient photographs live in assets/images/ingredients/ and are keyed by
  //   INGREDIENT ID (see INGREDIENT_CATALOG). Records store that id (`ingredientId`)
  //   when they are created/renamed, so an image never depends on array position.
  // * Only assets that physically exist in the project are listed here. An item with
  //   no photograph yet falls back to an accurate, clearly-labelled card for THAT item
  //   (never to a photograph of a different food).
  // ----------------------------------------------------------------------------
  const IMAGE_PATHS = {
    recipes: 'assets/images/recipes/',
    ingredients: 'assets/images/ingredients/'
  };

  // Verified culinary reference URLs keyed strictly by recipe ID.
  const RECIPE_IMAGE_URLS = {
    rec_jollof_party: "https://commons.wikimedia.org/wiki/Special:FilePath/Party_Nigerian_jollof_rice.jpg",
    rec_egusi_soup: "https://www.smokybowls.com.au/images/egusi-soup.jpg",
    rec_pounded_yam: "https://commons.wikimedia.org/wiki/Special:FilePath/A_Plate_of_Pounded_Yam_(Iyan)_served_in_Birmingham_UK.JPG",
    rec_efo_riro: "https://static.wixstatic.com/media/df7f9c_0508ceeb7d8c48d18aac5591a07e1122~mv2.jpg",
    rec_akara_crispy: "https://commons.wikimedia.org/wiki/Special:FilePath/Akara_Okpoto_01.jpg",
    rec_moi_moi: "https://daintyfoods.me/assets/moi-moi-Cx2xXsXx.jpg",
    rec_yam_porridge: "https://cdn.foodaciously.com/static/recipe/dRoNPQJZFl8vCaB2BpTg/nigerian-yam-porrige-eeaf55a0d0f5aab31dcb4f9ced326a81-1280-q60.jpg",
    rec_ewa_aganyin: "https://beeolafoods.com/cdn/shop/files/IMG-4173.png?v=1771616938",
    rec_ofada_ayamase: "https://tkpe6wrwxmgsladx.public.blob.vercel-storage.com/recipes/nigerian-ofada-rice.jpg",
    rec_okra_soup: "https://oceanova.ng/storage/meals/01KN22BD7BQF71KR6AG5VZK63Y.png",
    rec_ogbono_soup: "https://emiroo.com/cdn/shop/files/ogbono_soup_w_goat.png?v=1754201007&width=1946",
    rec_banga_soup: "https://www.nkosiagro.com/cdn/shop/articles/hf_20260510_205936_f138f8dc-4e17-44aa-b567-92df520466ab.png?v=1778475008&width=1200",
    rec_afang_soup: "https://snapcalorie-webflow-website.s3.us-east-2.amazonaws.com/media/food_pics_v2/medium/afang_soup.jpg",
    rec_edikang_ikong: "https://snapcalorie-webflow-website.s3.us-east-2.amazonaws.com/media/food_pics_v2/medium/edikaikong_soup.jpg",
    rec_amala_abula: "https://files.chowdeck.com/images/2024/2024-09-20/Q22m0gE6QKJ5xHlStbHje.jpg",
    rec_beef_suya: "https://daintyfoods.me/assets/suya-BH_cXW5_.jpg",
    rec_puff_puff: "https://emiroo.com/cdn/shop/files/bofrot.png?v=1755491782&width=1946",
    rec_meat_pie: "https://snapcalorie-webflow-website.s3.us-east-2.amazonaws.com/media/food_pics_v2/medium/nigerian_meat_pie.jpg",
    rec_nigerian_fried_rice: "https://commons.wikimedia.org/wiki/Special:FilePath/Fried_rice_and_chicken_garnished_with_sweet_corn%2C_carrot_and_green_peas.jpg",
    rec_ogi_pap: "https://snapcalorie-webflow-website.s3.us-east-2.amazonaws.com/media/food_pics_v2/medium/nigerian_pap.jpg",
    rec_intl_pancakes: "https://commons.wikimedia.org/wiki/Special:FilePath/Fruit_Pancakes_(45112010972).jpg"
  };

  // Verified Wikimedia Commons photographs for raw ingredients keyed strictly by ingredient ID.
  const INGREDIENT_IMAGE_URLS = {
    rice: "https://commons.wikimedia.org/wiki/Special:FilePath/Rice_Grains.jpg",
    beans: "https://commons.wikimedia.org/wiki/Special:FilePath/BlackEyedPeas.JPG",
    yam: "https://commons.wikimedia.org/wiki/Special:FilePath/Yam_tuber.jpg",
    tomatoes: "https://commons.wikimedia.org/wiki/Special:FilePath/Tomatoes_plain_and_sliced.jpg",
    tatashe: "https://commons.wikimedia.org/wiki/Special:FilePath/Red_bell_pepper.jpg",
    'bell-pepper': "https://commons.wikimedia.org/wiki/Special:FilePath/Red_bell_pepper.jpg",
    'green-peppers': "https://commons.wikimedia.org/wiki/Special:FilePath/Green-Bell-Pepper.jpg",
    'scotch-bonnet': "https://commons.wikimedia.org/wiki/Special:FilePath/Scotch_bonnet_chili_pepper.jpg",
    onions: "https://commons.wikimedia.org/wiki/Special:FilePath/Red_Onion_on_White.JPG",
    'palm-oil': "https://commons.wikimedia.org/wiki/Special:FilePath/Red_Palm_oil_at_Bakin_Dogo_market_Kaduna_01.jpg",
    egusi: "https://commons.wikimedia.org/wiki/Special:FilePath/Egusi_seeds.jpg",
    crayfish: "https://commons.wikimedia.org/wiki/Special:FilePath/Dried_crayfish_on_a_tray.jpg",
    stockfish: "https://commons.wikimedia.org/wiki/Special:FilePath/Stockfish_LC0149.jpg",
    'smoked-fish': "https://commons.wikimedia.org/wiki/Special:FilePath/Smoked_Catfish_Badagry_Market.jpg",
    'vegetable-oil': "https://commons.wikimedia.org/wiki/Special:FilePath/Corn_oil_(mais).jpg",
    ugwu: "https://commons.wikimedia.org/wiki/Special:FilePath/Ugwu_leaf.jpg",
    garlic: "https://commons.wikimedia.org/wiki/Special:FilePath/Garlic_Cloves.jpg",
    plantain: "https://commons.wikimedia.org/wiki/Special:FilePath/Plantains.jpg",
    ginger: "https://commons.wikimedia.org/wiki/Special:FilePath/Ginger_root.jpg",
    eggs: "https://commons.wikimedia.org/wiki/Special:FilePath/Eggs.jpg",
    potatoes: "https://commons.wikimedia.org/wiki/Special:FilePath/Potatoes.jpg",
    okra: "https://commons.wikimedia.org/wiki/Special:FilePath/Okra.jpg",
    butter: "https://commons.wikimedia.org/wiki/Special:FilePath/Butter.jpg",
    honey: "https://commons.wikimedia.org/wiki/Special:FilePath/Runny_hunny.jpg"
  };

  // Source attribution records for culinary photographs.
  const IMAGE_ATTRIBUTIONS = {
    recipes: {
      rec_jollof_party: { name: 'Smoky Party Jollof Rice', file: 'Party_Nigerian_jollof_rice.jpg', pageUrl: 'https://commons.wikimedia.org/wiki/File:Party_Nigerian_jollof_rice.jpg', artist: 'Halima Waziri', license: 'CC BY-SA 4.0' },
      rec_egusi_soup: { name: 'Authentic Lump-Style Egusi Soup', file: 'egusi-soup.jpg', pageUrl: 'https://www.smokybowls.com.au/', artist: 'Smoky Bowls Premium Cuisine', license: 'Restaurant Feature' },
      rec_pounded_yam: { name: 'Silky Pounded Yam (Iyan)', file: 'A_Plate_of_Pounded_Yam_(Iyan)_served_in_Birmingham_UK.JPG', pageUrl: 'https://commons.wikimedia.org/wiki/File:A_Plate_of_Pounded_Yam_(Iyan)_served_in_Birmingham_UK.JPG', artist: 'Jovianeye', license: 'CC BY-SA 3.0' },
      rec_efo_riro: { name: 'Rich Yoruba Efo Riro', file: 'df7f9c_0508ceeb7d8c48d18aac5591a07e1122~mv2.jpg', pageUrl: 'https://www.honeypotafricanrestaurant.co.uk/product-page/nigerian-eforiro-soup-yoruba-eforiro-soup', artist: 'Honeypot African Restaurant', license: 'Restaurant Feature' },
      rec_akara_crispy: { name: 'Crispy Golden Akara (Bean Cakes)', file: 'Akara_Okpoto_01.jpg', pageUrl: 'https://commons.wikimedia.org/wiki/File:Akara_Okpoto_01.jpg', artist: 'Linason Blessing', license: 'CC BY-SA 4.0' },
      rec_moi_moi: { name: 'Steamed Moi Moi', file: 'moi-moi-Cx2xXsXx.jpg', pageUrl: 'https://daintyfoods.me/', artist: 'Dainty Foods', license: 'Culinary Feature' },
      rec_yam_porridge: { name: 'Savory Asaro (Yam Porridge)', file: 'nigerian-yam-porrige-eeaf55a0d0f5aab31dcb4f9ced326a81-1280-q60.jpg', pageUrl: 'https://foodaciously.com/recipe/nigerian-yam-porridge', artist: 'Foodaciously', license: 'Culinary Feature' },
      rec_ewa_aganyin: { name: 'Traditional Ewa Aganyin', file: 'IMG-4173.png', pageUrl: 'https://beeolafoods.com/', artist: 'Beeola Foods', license: 'Culinary Feature' },
      rec_ofada_ayamase: { name: 'Designer Ofada Rice & Ayamase Stew', file: 'nigerian-ofada-rice.jpg', pageUrl: 'https://tkpe6wrwxmgsladx.public.blob.vercel-storage.com/recipes/nigerian-ofada-rice.jpg', artist: 'Nigerian Cuisine Collection', license: 'Culinary Feature' },
      rec_okra_soup: { name: 'Fresh Seafood Okra Soup (Ila Alasepo)', file: '01KN22BD7BQF71KR6AG5VZK63Y.png', pageUrl: 'https://oceanova.ng/', artist: 'Oceanova Nigerian Seafood', license: 'Culinary Feature' },
      rec_ogbono_soup: { name: 'Traditional Ogbono Soup', file: 'ogbono_soup_w_goat.png', pageUrl: 'https://emiroo.com/', artist: 'Emiroo African Kitchen', license: 'Culinary Feature' },
      rec_banga_soup: { name: 'Delta Banga Soup', file: 'hf_20260510_205936_f138f8dc.png', pageUrl: 'https://www.nkosiagro.com/', artist: 'Nkosi Agro & Foods', license: 'Culinary Feature' },
      rec_afang_soup: { name: 'Calabar Afang Soup', file: 'afang_soup.jpg', pageUrl: 'https://www.snapcalorie.com/', artist: 'SnapCalorie Culinary Collection', license: 'Culinary Feature' },
      rec_edikang_ikong: { name: 'Efik Edikang Ikong Soup', file: 'edikaikong_soup.jpg', pageUrl: 'https://www.snapcalorie.com/', artist: 'SnapCalorie Culinary Collection', license: 'Culinary Feature' },
      rec_amala_abula: { name: 'Amala with Ewedu & Gbegiri', file: 'Q22m0gE6QKJ5xHlStbHje.jpg', pageUrl: 'https://chowdeck.com/', artist: 'Chowdeck Culinary Menu', license: 'Culinary Feature' },
      rec_beef_suya: { name: 'Authentic Nigerian Beef Suya', file: 'suya-BH_cXW5_.jpg', pageUrl: 'https://daintyfoods.me/', artist: 'Dainty Foods', license: 'Culinary Feature' },
      rec_puff_puff: { name: 'Golden Nigerian Puff Puff', file: 'bofrot.png', pageUrl: 'https://emiroo.com/', artist: 'Emiroo African Kitchen', license: 'Culinary Feature' },
      rec_meat_pie: { name: 'Traditional Nigerian Meat Pie', file: 'nigerian_meat_pie.jpg', pageUrl: 'https://www.snapcalorie.com/', artist: 'SnapCalorie Culinary Collection', license: 'Culinary Feature' },
      rec_nigerian_fried_rice: { name: 'Nigerian Party Fried Rice', file: 'Fried_rice_and_chicken_garnished_with_sweet_corn,_carrot_and_green_peas.jpg', pageUrl: 'https://commons.wikimedia.org/wiki/File:Fried_rice_and_chicken_garnished_with_sweet_corn,_carrot_and_green_peas.jpg', artist: 'Joyeche', license: 'CC BY-SA 4.0' },
      rec_ogi_pap: { name: 'Fermented Ogi / Pap with Milk & Sugar', file: 'nigerian_pap.jpg', pageUrl: 'https://www.snapcalorie.com/', artist: 'SnapCalorie Culinary Collection', license: 'Culinary Feature' },
      rec_intl_pancakes: { name: 'Fluffy Golden Pancakes with Honey & Fruit', file: 'Fruit_Pancakes_(45112010972).jpg', pageUrl: 'https://commons.wikimedia.org/wiki/File:Fruit_Pancakes_(45112010972).jpg', artist: 'Theo Crazzolara', license: 'CC BY 2.0' }
    },
    ingredients: {
      rice: { name: 'Rice', file: 'rice.jpg', pageUrl: 'https://commons.wikimedia.org/wiki/File:Rice_Grains.jpg', artist: 'Ashok Menon', license: 'CC BY 2.0' },
      beans: { name: 'Beans (Black-eyed peas)', file: 'BlackEyedPeas.JPG', pageUrl: 'https://commons.wikimedia.org/wiki/File:BlackEyedPeas.JPG', artist: 'Toby Hudson', license: 'CC BY-SA 3.0' },
      yam: { name: 'Yam Tuber', file: 'Yam_tuber.jpg', pageUrl: 'https://commons.wikimedia.org/wiki/File:Yam_tuber.jpg', artist: 'Kambai Akau', license: 'CC BY-SA 4.0' },
      tomatoes: { name: 'Tomatoes', file: 'Tomatoes_plain_and_sliced.jpg', pageUrl: 'https://commons.wikimedia.org/wiki/File:Tomatoes_plain_and_sliced.jpg', artist: 'FoeNyx', license: 'CC BY-SA 3.0' },
      tatashe: { name: 'Tatashe (Red Bell Pepper)', file: 'Red_bell_pepper.jpg', pageUrl: 'https://commons.wikimedia.org/wiki/File:Red_bell_pepper.jpg', artist: 'AntanO', license: 'CC BY-SA 4.0' },
      'bell-pepper': { name: 'Bell Peppers', file: 'Red_bell_pepper.jpg', pageUrl: 'https://commons.wikimedia.org/wiki/File:Red_bell_pepper.jpg', artist: 'AntanO', license: 'CC BY-SA 4.0' },
      'green-peppers': { name: 'Green Bell Pepper', file: 'Green-Bell-Pepper.jpg', pageUrl: 'https://commons.wikimedia.org/wiki/File:Green-Bell-Pepper.jpg', artist: 'Evan-Amos', license: 'Public domain' },
      'scotch-bonnet': { name: 'Scotch Bonnet (Rodo)', file: 'Scotch_bonnet_chili_pepper.jpg', pageUrl: 'https://commons.wikimedia.org/wiki/File:Scotch_bonnet_chili_pepper.jpg', artist: 'Temaciejewski', license: 'CC BY-SA 4.0' },
      onions: { name: 'Red Onions', file: 'Red_Onion_on_White.JPG', pageUrl: 'https://commons.wikimedia.org/wiki/File:Red_Onion_on_White.JPG', artist: 'Colin', license: 'CC BY-SA 3.0' },
      'palm-oil': { name: 'Red Palm Oil', file: 'Red_Palm_oil_at_Bakin_Dogo_market_Kaduna_01.jpg', pageUrl: 'https://commons.wikimedia.org/wiki/File:Red_Palm_oil_at_Bakin_Dogo_market_Kaduna_01.jpg', artist: 'Weyham', license: 'CC BY-SA 4.0' },
      egusi: { name: 'Egusi Seeds', file: 'Egusi_seeds.jpg', pageUrl: 'https://commons.wikimedia.org/wiki/File:Egusi_seeds.jpg', artist: 'Judethedeus', license: 'CC0' },
      crayfish: { name: 'Dried Crayfish', file: 'Dried_crayfish_on_a_tray.jpg', pageUrl: 'https://commons.wikimedia.org/wiki/File:Dried_crayfish_on_a_tray.jpg', artist: 'BishopNana', license: 'CC BY 4.0' },
      stockfish: { name: 'Stockfish', file: 'Stockfish_LC0149.jpg', pageUrl: 'https://commons.wikimedia.org/wiki/File:Stockfish_LC0149.jpg', artist: 'Jörg Hempel', license: 'CC BY-SA 2.0 de' },
      'smoked-fish': { name: 'Smoked Catfish', file: 'Smoked_Catfish_Badagry_Market.jpg', pageUrl: 'https://commons.wikimedia.org/wiki/File:Smoked_Catfish_Badagry_Market.jpg', artist: 'Amboluwaseun', license: 'CC BY-SA 4.0' },
      'vegetable-oil': { name: 'Vegetable Cooking Oil', file: 'Corn_oil_(mais).jpg', pageUrl: 'https://commons.wikimedia.org/wiki/File:Corn_oil_(mais).jpg', artist: 'Basilicofresco', license: 'CC BY-SA 3.0' },
      ugwu: { name: 'Ugwu (Fluted Pumpkin Leaves)', file: 'Ugwu_leaf.jpg', pageUrl: 'https://commons.wikimedia.org/wiki/File:Ugwu_leaf.jpg', artist: 'ToluT15', license: 'CC0' },
      garlic: { name: 'Garlic', file: 'Garlic_Cloves.jpg', pageUrl: 'https://commons.wikimedia.org/wiki/File:Garlic_Cloves.jpg', artist: 'Home Cooking Secrets', license: 'CC BY-SA 3.0' },
      plantain: { name: 'Plantains', file: 'Plantains.jpg', pageUrl: 'https://commons.wikimedia.org/wiki/File:Plantains.jpg', artist: 'Wikimedia contributor', license: 'CC BY-SA' },
      ginger: { name: 'Ginger Root', file: 'Ginger_root.jpg', pageUrl: 'https://commons.wikimedia.org/wiki/File:Ginger_root.jpg', artist: 'Wikimedia contributor', license: 'CC BY-SA' },
      eggs: { name: 'Eggs', file: 'Eggs.jpg', pageUrl: 'https://commons.wikimedia.org/wiki/File:Eggs.jpg', artist: 'Wikimedia contributor', license: 'CC BY-SA' },
      potatoes: { name: 'Potatoes', file: 'Potatoes.jpg', pageUrl: 'https://commons.wikimedia.org/wiki/File:Potatoes.jpg', artist: 'Wikimedia contributor', license: 'CC BY-SA' },
      okra: { name: 'Fresh Okra', file: 'Okra.jpg', pageUrl: 'https://commons.wikimedia.org/wiki/File:Okra.jpg', artist: 'Wikimedia contributor', license: 'CC BY-SA' },
      butter: { name: 'Butter', file: 'Butter.jpg', pageUrl: 'https://commons.wikimedia.org/wiki/File:Butter.jpg', artist: 'Wikimedia contributor', license: 'CC BY-SA' },
      honey: { name: 'Pure Honey', file: 'Runny_hunny.jpg', pageUrl: 'https://commons.wikimedia.org/wiki/File:Runny_hunny.jpg', artist: 'Wikimedia contributor', license: 'CC BY-SA' }
    }
  };

  // recipeId -> local file in assets/images/recipes/ (locally downloaded verified photographs)
  const RECIPE_IMAGE_FILES = {
    rec_jollof_party: 'rec_jollof_party.jpg',
    rec_egusi_soup: 'rec_egusi_soup.jpg',
    rec_pounded_yam: 'rec_pounded_yam.jpg',
    rec_efo_riro: 'rec_efo_riro.jpg',
    rec_akara_crispy: 'rec_akara_crispy.jpg',
    rec_moi_moi: 'rec_moi_moi.jpg',
    rec_yam_porridge: 'rec_yam_porridge.jpg',
    rec_ewa_aganyin: 'rec_ewa_aganyin.jpg',
    rec_ofada_ayamase: 'rec_ofada_ayamase.jpg',
    rec_okra_soup: 'rec_okra_soup.jpg',
    rec_ogbono_soup: 'rec_ogbono_soup.jpg',
    rec_banga_soup: 'rec_banga_soup.jpg',
    rec_afang_soup: 'rec_afang_soup.jpg',
    rec_edikang_ikong: 'rec_edikang_ikong.jpg',
    rec_amala_abula: 'rec_amala_abula.jpg',
    rec_beef_suya: 'rec_beef_suya.jpg',
    rec_puff_puff: 'rec_puff_puff.jpg',
    rec_meat_pie: 'rec_meat_pie.jpg',
    rec_nigerian_fried_rice: 'rec_nigerian_fried_rice.jpg',
    rec_ogi_pap: 'rec_ogi_pap.jpg',
    rec_intl_pancakes: 'rec_intl_pancakes.jpg'
  };

  // Names a recipe photograph may be matched by when a recipe has no id-based
  // association (custom recipes / planner free-text meals). Exact normalised
  // name match only (see resolveRecipeImageId) — no fuzzy guessing.
  const RECIPE_IMAGE_ALIASES = {
    rec_jollof_party: ['jollof rice', 'party jollof rice', 'jollof'],
    rec_egusi_soup: ['egusi soup', 'egusi'],
    rec_pounded_yam: ['pounded yam', 'iyan'],
    rec_efo_riro: ['efo riro'],
    rec_akara_crispy: ['akara', 'bean cakes'],
    rec_moi_moi: ['moi moi', 'moin moin'],
    rec_yam_porridge: ['yam porridge', 'asaro'],
    rec_ewa_aganyin: ['ewa aganyin', 'ewa agoyin'],
    rec_ofada_ayamase: ['ofada rice', 'ofada rice and ayamase', 'ayamase'],
    rec_okra_soup: ['okra soup', 'okro soup'],
    rec_ogbono_soup: ['ogbono soup', 'draw soup'],
    rec_banga_soup: ['banga soup', 'palm nut soup'],
    rec_afang_soup: ['afang soup'],
    rec_edikang_ikong: ['edikang ikong', 'edikang ikong soup'],
    rec_amala_abula: ['amala', 'abula', 'amala and ewedu', 'amala and gbegiri'],
    rec_beef_suya: ['suya', 'beef suya'],
    rec_puff_puff: ['puff puff'],
    rec_meat_pie: ['meat pie'],
    rec_nigerian_fried_rice: ['fried rice', 'nigerian fried rice'],
    rec_ogi_pap: ['ogi', 'pap', 'akamu'],
    rec_intl_pancakes: ['pancakes', 'pancake']
  };

  // Photographs previously seeded from remote stock URLs. They were not guaranteed to
  // depict the named dish, so saved copies of those URLs are ignored in favour of the
  // library photograph (user-typed image URLs are always respected).
  const LEGACY_SEED_IMAGE_PATTERN = /images\.unsplash\.com\/photo-(1662116765994|1544025162|1528207776546)/;

  // Ingredient catalogue: id, display label, the names it is recognised by, the
  // photograph file (null = no photograph yet) and an accurate emoji used only on the
  // fallback tile. Matching is whole-word / whole-phrase (see resolveIngredientId).
  const INGREDIENT_CATALOG = [
    { id: 'rice', label: 'Rice', file: 'rice.jpg', emoji: '', aliases: ['rice', 'long grain rice', 'parboiled rice', 'ofada rice', 'basmati rice'] },
    { id: 'tomatoes', label: 'Tomatoes', file: null, emoji: '🍅', aliases: ['tomato', 'plum tomato', 'fresh tomato'] },
    { id: 'tomato-paste', label: 'Tomato paste', file: null, emoji: '', aliases: ['tomato paste', 'tomato puree'] },
    { id: 'onions', label: 'Onions', file: null, emoji: '🧅', aliases: ['onion', 'red onion', 'white onion'] },
    { id: 'scotch-bonnet', label: 'Scotch bonnet', file: null, emoji: '🌶️', aliases: ['scotch bonnet', 'rodo', 'atarodo', 'habanero'] },
    { id: 'bell-pepper', label: 'Bell peppers', file: null, emoji: '🫑', aliases: ['bell pepper', 'tatashe', 'capsicum'] },
    { id: 'pepper', label: 'Pepper', file: null, emoji: '🌶️', aliases: ['pepper', 'chili', 'chilli', 'fresh pepper', 'pepper mix'] },
    { id: 'palm-oil', label: 'Palm oil', file: null, emoji: '', aliases: ['palm oil', 'red oil'] },
    { id: 'vegetable-oil', label: 'Vegetable oil', file: null, emoji: '', aliases: ['vegetable oil', 'cooking oil', 'groundnut oil', 'oil'] },
    { id: 'egusi', label: 'Egusi', file: 'egusi.jpg', emoji: '', aliases: ['egusi', 'melon seed', 'ground melon seed'] },
    { id: 'beans', label: 'Beans', file: null, emoji: '', aliases: ['bean', 'brown bean', 'black eyed bean', 'honey bean', 'ewa oloyin', 'peeled bean'] },
    { id: 'yam', label: 'Yam', file: null, emoji: '', aliases: ['yam', 'white yam', 'puna yam', 'yam tuber'] },
    { id: 'plantain', label: 'Plantain', file: null, emoji: '', aliases: ['plantain', 'dodo'] },
    { id: 'crayfish', label: 'Crayfish', file: null, emoji: '', aliases: ['crayfish', 'ground crayfish'] },
    { id: 'smoked-fish', label: 'Smoked fish', file: null, emoji: '', aliases: ['smoked fish', 'dry fish', 'dried fish', 'catfish', 'smoked catfish', 'dry catfish'] },
    { id: 'stockfish', label: 'Stockfish', file: null, emoji: '', aliases: ['stockfish', 'stock fish', 'panla', 'okporoko'] },
    { id: 'ugwu', label: 'Ugwu leaves', file: null, emoji: '', aliases: ['ugwu', 'pumpkin leaf', 'pumpkin leaves', 'fluted pumpkin'] },
    { id: 'spinach', label: 'Spinach', file: null, emoji: '', aliases: ['spinach', 'efo', 'efo tete', 'shoko', 'tete'] },
    { id: 'bitterleaf', label: 'Bitterleaf', file: null, emoji: '', aliases: ['bitterleaf', 'bitter leaf', 'onugbu'] },
    { id: 'waterleaf', label: 'Waterleaf', file: null, emoji: '', aliases: ['waterleaf', 'water leaf'] },
    { id: 'okra', label: 'Okra', file: null, emoji: '', aliases: ['okra', 'okro'] },
    { id: 'ogbono', label: 'Ogbono', file: null, emoji: '', aliases: ['ogbono', 'african mango seed', 'ground ogbono'] },
    { id: 'locust-beans', label: 'Locust beans (Iru)', file: null, emoji: '', aliases: ['locust bean', 'iru', 'ogiri'] },
    { id: 'garlic', label: 'Garlic', file: null, emoji: '🧄', aliases: ['garlic'] },
    { id: 'ginger', label: 'Ginger', file: null, emoji: '', aliases: ['ginger'] },
    { id: 'beef', label: 'Beef & assorted meat', file: null, emoji: '🥩', aliases: ['beef', 'meat', 'assorted meat', 'shaki', 'ponmo', 'kpomo', 'cow tail', 'cow leg', 'minced beef', 'mince beef', 'goat meat', 'goat'] },
    { id: 'chicken', label: 'Chicken', file: null, emoji: '🍗', aliases: ['chicken', 'turkey'] },
    { id: 'eggs', label: 'Eggs', file: null, emoji: '🥚', aliases: ['egg', 'hard boiled egg'] },
    { id: 'flour', label: 'Flour', file: null, emoji: '', aliases: ['flour', 'all purpose flour', 'plain flour', 'wheat flour'] },
    { id: 'sugar', label: 'Sugar', file: null, emoji: '', aliases: ['sugar', 'granulated sugar'] },
    { id: 'milk', label: 'Milk', file: null, emoji: '🥛', aliases: ['milk', 'evaporated milk'] },
    { id: 'butter', label: 'Butter', file: null, emoji: '🧈', aliases: ['butter', 'margarine'] },
    { id: 'honey', label: 'Honey', file: null, emoji: '🍯', aliases: ['honey'] },
    { id: 'seasoning-cubes', label: 'Seasoning cubes', file: null, emoji: '', aliases: ['seasoning cube', 'stock cube', 'bouillon cube', 'maggi', 'knorr'] },
    { id: 'salt', label: 'Salt', file: null, emoji: '🧂', aliases: ['salt'] },
    { id: 'spices', label: 'Curry, thyme & bay leaves', file: null, emoji: '', aliases: ['curry powder', 'curry', 'thyme', 'dried thyme', 'bay leaf', 'bay leaves'] },
    { id: 'yam-flour', label: 'Yam flour (Elubo)', file: 'yam-flour.jpg', emoji: '', aliases: ['yam flour', 'elubo', 'amala flour'] },
    { id: 'ewedu', label: 'Ewedu leaves', file: null, emoji: '', aliases: ['ewedu', 'jute leaf', 'jute leaves'] },
    { id: 'ogi', label: 'Ogi (corn paste)', file: null, emoji: '', aliases: ['ogi', 'corn paste', 'akamu', 'pap'] },
    { id: 'prawns', label: 'Prawns', file: null, emoji: '🦐', aliases: ['prawn', 'shrimp'] },
    { id: 'liver', label: 'Liver', file: null, emoji: '', aliases: ['liver', 'cow liver'] },
    { id: 'potatoes', label: 'Potatoes', file: null, emoji: '🥔', aliases: ['potato', 'irish potato'] },
    { id: 'carrots', label: 'Carrots', file: null, emoji: '🥕', aliases: ['carrot'] },
    { id: 'mixed-vegetables', label: 'Mixed vegetables', file: null, emoji: '', aliases: ['mixed vegetable', 'green bean', 'green pea', 'sweetcorn'] },
    { id: 'cabbage', label: 'Cabbage', file: null, emoji: '🥬', aliases: ['cabbage'] },
    { id: 'palm-fruit', label: 'Palm fruit', file: 'palm-fruit.jpg', emoji: '', aliases: ['palm fruit', 'palm nut'] },
    { id: 'suya-spice', label: 'Yaji (suya spice)', file: null, emoji: '', aliases: ['yaji', 'suya spice'] },
    { id: 'broth', label: 'Stock / broth', file: null, emoji: '', aliases: ['stock', 'broth', 'bone broth', 'fish stock', 'chicken stock', 'beef stock'] },
    { id: 'fresh-fish', label: 'Fresh fish', file: null, emoji: '', aliases: ['fresh fish', 'fresh catfish', 'croaker', 'fish', 'tilapia'] },
    { id: 'garri', label: 'Garri', file: null, emoji: '', aliases: ['garri', 'gari', 'cassava flour'] },
    { id: 'afang', label: 'Afang (Okazi) leaves', file: null, emoji: '', aliases: ['afang', 'okazi'] },
    { id: 'fruit', label: 'Fresh fruit', file: null, emoji: '🍓', aliases: ['fruit', 'fresh fruit', 'sliced fruit'] }
  ];

  function normalizeKey(str) {
    return (str || '')
      .toString()
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\(.*?\)/g, ' ')
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function singularToken(t) {
    if (t.length > 3 && t.endsWith('ies')) return t.slice(0, -3) + 'y';
    if (t.length > 3 && /(oes|ches|shes|xes)$/.test(t)) return t.slice(0, -2);
    if (t.length > 3 && t.endsWith('s') && !t.endsWith('ss') && !t.endsWith('us')) return t.slice(0, -1);
    return t;
  }

  function tokenizeName(str) {
    const key = normalizeKey(str);
    return key ? key.split(' ').map(singularToken) : [];
  }

  // Pre-tokenised alias index (built once)
  const INGREDIENT_ALIAS_INDEX = [];
  INGREDIENT_CATALOG.forEach(entry => {
    entry.aliases.forEach(alias => {
      const tokens = tokenizeName(alias);
      if (tokens.length) INGREDIENT_ALIAS_INDEX.push({ id: entry.id, tokens });
    });
  });
  const INGREDIENT_BY_ID = {};
  INGREDIENT_CATALOG.forEach(entry => { INGREDIENT_BY_ID[entry.id] = entry; });

  // Words that mean the text is a prepared dish, not a shoppable ingredient photo.
  const NON_INGREDIENT_WORDS = ['stew', 'soup', 'sauce'];

  // Maps free text ("2 cups Red onions (sliced)") to a catalogue id, or null.
  // Whole-token phrase matching; the longest phrase wins, ties go to the head noun
  // (the last matching phrase in the text).
  function resolveIngredientId(name) {
    let key = normalizeKey(name);
    if (!key) return null;
    const forIdx = key.indexOf(' for ');
    if (forIdx > 0) key = key.slice(0, forIdx);
    const tokens = key.split(' ').map(singularToken);
    if (tokens.some(t => NON_INGREDIENT_WORDS.includes(t))) return null;

    let best = null;
    INGREDIENT_ALIAS_INDEX.forEach(entry => {
      const n = entry.tokens.length;
      for (let i = 0; i + n <= tokens.length; i++) {
        let ok = true;
        for (let j = 0; j < n; j++) {
          if (tokens[i + j] !== entry.tokens[j]) { ok = false; break; }
        }
        if (ok && (!best || n > best.len || (n === best.len && i > best.pos))) {
          best = { id: entry.id, len: n, pos: i };
        }
      }
    });
    return best ? best.id : null;
  }

  // Normalised-name -> recipe image id, built lazily from aliases + starter names.
  let RECIPE_ALIAS_LOOKUP = null;
  function buildRecipeAliasLookup() {
    RECIPE_ALIAS_LOOKUP = {};
    Object.keys(RECIPE_IMAGE_ALIASES).forEach(id => {
      RECIPE_IMAGE_ALIASES[id].forEach(alias => { RECIPE_ALIAS_LOOKUP[normalizeKey(alias)] = id; });
    });
    STARTER_RECIPES.forEach(r => { RECIPE_ALIAS_LOOKUP[normalizeKey(r.name)] = r.id; });
  }

  // Exact (normalised) dish-name match -> library recipe id, else null.
  function resolveRecipeImageId(name) {
    if (!RECIPE_ALIAS_LOOKUP) buildRecipeAliasLookup();
    const id = RECIPE_ALIAS_LOOKUP[normalizeKey(name)];
    return id && (RECIPE_IMAGE_URLS[id] || RECIPE_IMAGE_FILES[id]) ? id : null;
  }

  // After a rename: keep the current photo only if the new name still names that dish.
  function nameStillMatchesImage(name, imageId) {
    const hay = ' ' + normalizeKey(name) + ' ';
    return (RECIPE_IMAGE_ALIASES[imageId] || []).some(a => hay.includes(' ' + normalizeKey(a) + ' '));
  }

  // Picks the image association for a recipe being saved (add or rename).
  function pickRecipeImageId(name, previousImageId) {
    if (previousImageId && (RECIPE_IMAGE_URLS[previousImageId] || RECIPE_IMAGE_FILES[previousImageId]) && nameStillMatchesImage(name, previousImageId)) {
      return previousImageId;
    }
    return resolveRecipeImageId(name);
  }

  function getRecipeImageId(recipe) {
    if (!recipe) return null;
    if (Object.prototype.hasOwnProperty.call(recipe, 'imageId') && recipe.imageId) {
      if (RECIPE_IMAGE_URLS[recipe.imageId] || RECIPE_IMAGE_FILES[recipe.imageId]) {
        return recipe.imageId;
      }
    }
    if (recipe.id && (RECIPE_IMAGE_URLS[recipe.id] || RECIPE_IMAGE_FILES[recipe.id])) {
      return recipe.id;
    }
    return resolveRecipeImageId(recipe.name);
  }

  // -> { src, verifiedUrl, local, lib, custom, fallback, imageId }
  // Strict priority:
  // 1. A valid custom image URL supplied by the user.
  // 2. An existing local image file from RECIPE_IMAGE_FILES (assets/images/recipes/).
  // 3. A verified external URL from RECIPE_IMAGE_URLS.
  // 4. The existing labelled bespoke fallback card.
  function getRecipeImage(recipe) {
    const isStarter = recipe && recipe.id && STARTER_RECIPES.some(sr => sr.id === recipe.id);
    const url = safeString(recipe && recipe.imageUrl);
    // Starter recipes rely on curated local assets; custom recipes preserve user-entered custom URLs
    const custom = url && !LEGACY_SEED_IMAGE_PATTERN.test(url) && (!isStarter || !RECIPE_IMAGE_FILES[recipe.id]) ? url : '';
    const imageId = getRecipeImageId(recipe);
    const local = imageId && RECIPE_IMAGE_FILES[imageId] ? IMAGE_PATHS.recipes + RECIPE_IMAGE_FILES[imageId] : '';
    const verifiedUrl = imageId && RECIPE_IMAGE_URLS[imageId] ? RECIPE_IMAGE_URLS[imageId] : '';
    const fallback = generateBespokeMealCard(recipe);

    const src = custom || local || verifiedUrl || fallback;
    return {
      src,
      custom,
      verifiedUrl,
      local,
      lib: local || verifiedUrl,
      fallback,
      imageId: imageId || null
    };
  }

  function ingredientTileSvg(name) {
    const label = (name || 'Ingredient').toString().slice(0, 24);
    const initial = Array.from(label.trim())[0] || '•';
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">` +
      `<rect width="200" height="200" fill="#181316"/>` +
      `<rect x="6" y="6" width="188" height="188" rx="16" fill="none" stroke="#dfb547" stroke-opacity="0.35" stroke-width="1.5"/>` +
      `<circle cx="100" cy="88" r="42" fill="rgba(223, 181, 71, 0.08)"/>` +
      `<text x="100" y="103" font-family="'DM Sans', Georgia, serif" font-size="44" font-weight="700" fill="#dfb547" text-anchor="middle">${esc(initial.toUpperCase())}</text>` +
      `<text x="100" y="162" font-family="'DM Sans', Arial, sans-serif" font-size="13" font-weight="600" fill="#f5e4ab" text-anchor="middle" letter-spacing="0.4">${esc(label)}</text></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  // -> { src, verifiedUrl, local, lib, id, tile }
  function getIngredientImage(item) {
    const id = item && item.ingredientId !== undefined ? item.ingredientId : resolveIngredientId(item && item.name);
    const entry = id ? INGREDIENT_BY_ID[id] : null;
    const tile = ingredientTileSvg(entry ? entry.label : (item && item.name));
    const verifiedUrl = id && INGREDIENT_IMAGE_URLS[id] ? INGREDIENT_IMAGE_URLS[id] : '';
    const local = entry && entry.file ? IMAGE_PATHS.ingredients + entry.file : '';

    const src = verifiedUrl || local || tile;
    return {
      src,
      verifiedUrl,
      local,
      lib: local || verifiedUrl,
      id: id || null,
      tile
    };
  }

  function recipeImgHtml(recipe, opts = {}) {
    const info = getRecipeImage(recipe);
    const name = (recipe && recipe.name) || 'Meal';
    return `<img class="food-img${opts.cls ? ' ' + opts.cls : ''}" src="${escapeHtml(info.src)}" alt="${escapeHtml(name)}"` +
      `${opts.eager ? '' : ' loading="lazy"'} decoding="async" data-kind="recipe"` +
      ` data-verified="${escapeHtml(info.verifiedUrl || '')}" data-local="${escapeHtml(info.local || '')}" data-lib="${escapeHtml(info.lib || '')}"` +
      ` data-name="${escapeHtml(name)}" data-cat="${escapeHtml((recipe && recipe.category) || '')}"` +
      ` data-origin="${escapeHtml((recipe && recipe.origin) || 'nigerian')}" data-region="${escapeHtml((recipe && recipe.region) || '')}"` +
      ` onerror="App.handleFoodImageError(this)">`;
  }

  function ingredientImgHtml(item, opts = {}) {
    const info = getIngredientImage(item);
    const name = (item && item.name) || 'Ingredient';
    return `<img class="food-img${opts.cls ? ' ' + opts.cls : ''}" src="${escapeHtml(info.src)}" alt="${escapeHtml(name)}"` +
      ` loading="lazy" decoding="async" data-kind="ingredient"` +
      ` data-verified="${escapeHtml(info.verifiedUrl || '')}" data-local="${escapeHtml(info.local || '')}" data-lib="${escapeHtml(info.lib || '')}"` +
      ` data-tile="${escapeHtml(info.tile)}" onerror="App.handleFoodImageError(this)">`;
  }

  // Failure chain: (1) try alternative source (verified URL <-> local file),
  // (2) labelled bespoke card/tile for THIS exact item. Never another food's photograph.
  function handleFoodImageError(img) {
    if (!img || !img.dataset) return;
    const stage = parseInt(img.dataset.stage || '0', 10);
    if (stage >= 3) return;
    img.dataset.stage = String(stage + 1);

    const local = img.dataset.local || '';
    const verified = img.dataset.verified || '';
    const current = img.getAttribute('src') || '';

    // Stage 1: Try alternate source if not already attempted
    if (stage === 0) {
      if (verified && current !== verified && current === local) {
        img.src = verified;
        return;
      }
      if (local && current !== local && current === verified) {
        img.src = local;
        return;
      }
    }

    // Stage 2: Fall back to labelled bespoke SVG for this exact item
    if (img.dataset.kind === 'ingredient') {
      img.src = img.dataset.tile || ingredientTileSvg(img.alt);
    } else {
      img.src = generateBespokeMealCard({
        name: img.dataset.name || img.alt,
        category: img.dataset.cat || 'meal',
        origin: img.dataset.origin || 'nigerian',
        region: img.dataset.region || ''
      });
    }
  }

  // Backwards-compatible entry point for any inline handlers
  function handleImageError(imgEl) { handleFoodImageError(imgEl); }

  // Give older saved data (recipes/inventory/shopping) their image associations.
  // Never touches names, quantities, user-typed image URLs or any other user data.
  function migrateImageAssociations() {
    let recipesChanged = false;
    const starterIds = new Set(STARTER_RECIPES.map(sr => sr.id));
    state.recipes.forEach(r => {
      if (!r) return;
      if (starterIds.has(r.id)) {
        if (r.imageId !== r.id) {
          r.imageId = r.id;
          recipesChanged = true;
        }
        if (r.imageUrl) {
          r.imageUrl = '';
          recipesChanged = true;
        }
      } else {
        if (!Object.prototype.hasOwnProperty.call(r, 'imageId')) {
          r.imageId = (RECIPE_IMAGE_URLS[r.id] || RECIPE_IMAGE_FILES[r.id]) ? r.id : resolveRecipeImageId(r.name);
          recipesChanged = true;
        }
        if (r.imageUrl && LEGACY_SEED_IMAGE_PATTERN.test(r.imageUrl)) {
          r.imageUrl = '';
          recipesChanged = true;
        }
      }
    });
    if (recipesChanged) saveRecipes();

    let invChanged = false;
    state.inventory.forEach(i => {
      if (i && i.ingredientId === undefined) { i.ingredientId = resolveIngredientId(i.name); invChanged = true; }
    });
    if (invChanged) saveInventory();

    let shopChanged = false;
    state.shopping.forEach(s => {
      if (s && s.ingredientId === undefined) { s.ingredientId = resolveIngredientId(s.name); shopChanged = true; }
    });
    if (shopChanged) saveShopping();
  }

  // ----------------------------------------------------------------------------
  // 4. STARTER RECIPES COLLECTION (Curated with Authentic Photography & Verified Mapping)
  // ----------------------------------------------------------------------------
  const STARTER_RECIPES = [
    {
      id: 'rec_jollof_party',
      name: 'Smoky Party Jollof Rice',
      category: 'lunch',
      origin: 'nigerian',
      region: 'Pan-Nigerian Celebration',
      prepTime: 25,
      cookTime: 45,
      servings: 6,
      imageUrl: '',
      ingredients: [
        '3 cups Long grain parboiled rice',
        '6 Plum tomatoes',
        '4 Red bell peppers (Tatashe)',
        '3 Scotch bonnet peppers (Rodo)',
        '2 Large red onions',
        '3 tbsp Tomato paste',
        '3 cups Rich chicken or beef stock',
        '1 tbsp Curry powder',
        '1 tbsp Dried thyme',
        '3 Dried bay leaves',
        '2 tbsp Butter',
        '1 cup Vegetable oil',
        '1 tsp Salt'
      ],
      instructions: `1. Blend the fresh tomatoes, tatashe, scotch bonnet peppers, and 1 onion until smooth. Pour into a pot and boil down until the moisture evaporates completely.\n2. In a deep heavy pot, heat vegetable oil and melt the butter. Add finely sliced onions and fry until translucent.\n3. Add tomato paste and fry on medium-low heat for 6-8 minutes, stirring continuously so it does not burn.\n4. Pour in the reduced pepper blend, curry powder, thyme, bay leaves, seasoning cubes, and salt. Fry until oil separates to the top.\n5. Pour in the rich stock, bring to a rapid boil, then taste and adjust seasoning.\n6. Add thoroughly washed parboiled rice. The liquid level should just cover the rice.\n7. Cover tightly with foil paper to trap steam, then place the pot lid over it. Cook on very low heat for 35 minutes.\n8. Once the rice is tender, increase the heat slightly for 3-5 minutes to impart that authentic, aromatic party smoke aroma. Fluff with a fork and serve with fried plantains (Dodo).`
    },
    {
      id: 'rec_egusi_soup',
      name: 'Authentic Egusi Soup with Bitterleaf & Assorted Meat',
      category: 'dinner',
      origin: 'nigerian',
      region: 'Yoruba / Igbo / Edo Heritage',
      prepTime: 20,
      cookTime: 40,
      servings: 5,
      imageUrl: '', // Uses exact neutral bespoke art to ensure it never shows an inaccurate generic dish
      ingredients: [
        '2 cups Ground melon seeds (Egusi)',
        '1 cup Red palm oil',
        '500g Assorted meat (beef, shaki, cow leg)',
        '1 Large stockfish head (Panla/Okporoko)',
        '1 Medium smoked catfish',
        '3 tbsp Ground crayfish',
        '1 cup Washed bitterleaf or Ugwu leaves',
        '3 Scotch bonnet peppers',
        '1 Large onion',
        '2 Seasoning cubes',
        '1 tsp Salt'
      ],
      instructions: `1. Season the assorted meat and stockfish with onions, seasoning cubes, and salt. Boil until tender, reserving the rich broth.\n2. In a bowl, mix ground egusi seeds with a small amount of warm water and diced onions to form a thick paste.\n3. Heat palm oil in a pot until warm. Scoop the egusi paste into balls and fry gently on medium heat until curdled and fragrant (about 8 minutes).\n4. Pour in the meat stock gradually, stirring gently so the egusi remains in delicious lump clusters.\n5. Add the cooked assorted meats, deboned smoked catfish, ground crayfish, blended scotch bonnets, and seasonings. Cover and simmer for 15 minutes.\n6. Stir in the washed bitterleaf (or fresh sliced ugwu). Simmer on low heat for 5 minutes.\n7. Serve hot alongside steaming Pounded Yam or Eba.`
    },
    {
      id: 'rec_pounded_yam',
      name: 'Silky Pounded Yam (Iyan)',
      category: 'dinner',
      origin: 'nigerian',
      region: 'Yoruba / Igbo Traditional Swallow',
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      imageUrl: '',
      ingredients: [
        '1 Large tuber of White yam (Puna yam)',
        'Water for boiling'
      ],
      instructions: `1. Peel the white yam tuber and cut into uniform slices or chunks.\n2. Rinse the yam thoroughly in cold water to remove excess starch.\n3. Place the yam chunks in a deep pot, cover with clean water, and boil on medium-high heat for 25-30 minutes until a fork easily pierces through the center.\n4. Transfer hot yam chunks in batches into a clean traditional mortar or food processor fitted with a dough blade.\n5. Pound or pulse vigorously while warm until lump-free, stretchy, and silky smooth.\n6. Form into rounded mounds, wrap in warm cling film or banana leaves, and serve hot with Egusi, Efo Riro, or Banga soup.`
    },
    {
      id: 'rec_efo_riro',
      name: 'Efo Riro (Yoruba Rich Vegetable Soup)',
      category: 'lunch',
      origin: 'nigerian',
      region: 'Yoruba Heritage',
      prepTime: 20,
      cookTime: 30,
      servings: 5,
      imageUrl: '',
      ingredients: [
        '2 Bunches fresh Spinach or Shoko / Tete leaves',
        '1 cup Red palm oil',
        '400g Cooked assorted meat & soft Ponmo',
        '1 Dry smoked fish',
        '3 tbsp Fermented locust beans (Iru)',
        '4 Red bell peppers (Tatashe)',
        '3 Scotch bonnet peppers (Rodo)',
        '2 Medium onions',
        '3 tbsp Ground crayfish',
        '2 Seasoning cubes',
        '1 tsp Salt'
      ],
      instructions: `1. Blanch the vegetable greens in boiling water for 1 minute, drain immediately, and squeeze out excess moisture thoroughly.\n2. Coarsely blend the bell peppers, scotch bonnets, and onions. Boil down until the moisture evaporates.\n3. Heat red palm oil in a pot; add sliced onions and rinsed locust beans (iru) to release their rich aroma.\n4. Pour in the boiled pepper puree and fry for 10-12 minutes until the oil surfaces.\n5. Add the cooked meats, diced ponmo, flaked smoked fish, ground crayfish, and seasoning cubes. Simmer for 8 minutes so the flavors marry.\n6. Fold in the squeezed spinach leaves. Stir well and cook uncovered on low heat for 3-4 minutes to keep the vegetables crisp and vibrant.\n7. Serve with Amala, Pounded Yam, or White Rice.`
    },
    {
      id: 'rec_akara_crispy',
      name: 'Golden Crispy Akara (Bean Cakes)',
      category: 'breakfast',
      origin: 'nigerian',
      region: 'Pan-Nigerian Morning Favorite',
      prepTime: 20,
      cookTime: 15,
      servings: 4,
      imageUrl: '',
      ingredients: [
        '2 cups Peeled brown or black-eyed beans',
        '2 Scotch bonnet peppers (Rodo)',
        '1 Small red onion',
        '1 Red bell pepper',
        '1 tsp Salt',
        '3 cups Vegetable oil for deep frying'
      ],
      instructions: `1. Soak peeled beans in warm water for 15 minutes.\n2. Blend the beans with peppers and onions using very minimal water until a smooth, thick paste forms.\n3. Pour the batter into a bowl and whip vigorously with a wooden spoon or hand mixer for 8-10 minutes. Incorporating air is the secret to fluffy Akara!\n4. Stir in salt just before frying (adding salt too early flattens the air bubbles).\n5. Heat vegetable oil in a deep frying pan over medium-high heat.\n6. Scoop tablespoons of batter and drop gently into the hot oil. Fry until puffed and golden brown on all sides (about 4 minutes).\n7. Remove with a slotted spoon and drain on paper towels. Serve hot with warm Pap (Ogi), custard, or fresh bread.`
    },
    {
      id: 'rec_moi_moi',
      name: 'Steamed Moi Moi (Savory Bean Pudding)',
      category: 'breakfast',
      origin: 'nigerian',
      region: 'Pan-Nigerian Delicacy',
      prepTime: 30,
      cookTime: 45,
      servings: 6,
      imageUrl: '',
      ingredients: [
        '2 cups Peeled brown beans',
        '3 Red bell peppers (Tatashe)',
        '2 Scotch bonnet peppers',
        '2 Onions',
        '1/2 cup Vegetable oil or melted butter',
        '1 cup Warm bone broth or fish stock',
        '3 Hard-boiled eggs (sliced)',
        '1 cup Flaked smoked fish',
        '2 tbsp Ground crayfish',
        '2 Seasoning cubes',
        '1 tsp Salt'
      ],
      instructions: `1. Blend peeled beans, bell peppers, scotch bonnets, onions, and crayfish with warm stock until silky smooth.\n2. Pour batter into a large bowl. Whisk in vegetable oil, crushed seasoning cubes, and salt for 5 minutes until aerated.\n3. Fold in flaked smoked fish.\n4. Scoop batter into leaf wraps (ewe eran), ramekins, or foil pouches. Drop a slice of boiled egg on top of each.\n5. Line a wide pot with foil and add 1 inch of water. Arrange the pouches inside, cover tightly to trap steam, and cook on medium heat for 45 minutes.\n6. Allow to rest for 5 minutes before unwrapping. Enjoy warm alone or with Jollof Rice or Ogi.`
    },
    {
      id: 'rec_yam_porridge',
      name: 'Yam Porridge (Asaro Elepo Rebe)',
      category: 'lunch',
      origin: 'nigerian',
      region: 'Yoruba / Pan-Nigerian',
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      imageUrl: '',
      ingredients: [
        '1 Medium tuber White yam (cut into bite-sized cubes)',
        '1/2 cup Red palm oil',
        '1 cup Blended tomatoes, tatashe, and rodo puree',
        '1 Large onion (chopped)',
        '3 tbsp Ground crayfish',
        '1 cup Flaked smoked fish',
        '1 cup Sliced fresh spinach or ugwu leaves',
        '2 Seasoning cubes',
        '1 tsp Salt'
      ],
      instructions: `1. Peel and cut yam into bite-sized cubes; rinse clean.\n2. Place yam in a pot, add water just halfway up the yam, and bring to a boil with chopped onions, seasoning cubes, and salt for 15 minutes.\n3. Pour in palm oil, blended pepper puree, ground crayfish, and flaked smoked fish.\n4. Reduce heat to medium and cook for another 10 minutes until yam is very soft.\n5. Using a wooden spoon or potato masher, crush about half of the yam cubes to create a rich, creamy sauce while keeping the remaining cubes whole.\n6. Stir in sliced green vegetables and simmer for 2 minutes before turning off the heat.`
    },
    {
      id: 'rec_ewa_aganyin',
      name: 'Ewa Aganyin with Spicy Aganyin Sauce',
      category: 'breakfast',
      origin: 'nigerian',
      region: 'Lagos & Yoruba Heritage',
      prepTime: 20,
      cookTime: 55,
      servings: 4,
      imageUrl: '',
      ingredients: [
        '2 cups Brown honey beans (Ewa Oloyin)',
        '1 cup Red palm oil',
        '3 Large red onions (thinly sliced)',
        '1 cup Dried chili and bell peppers (soaked and coarsely pulsed)',
        '2 tbsp Ground crayfish',
        '1 tsp Salt',
        '1 Seasoning cube'
      ],
      instructions: `1. Pick and wash the honey beans. Boil in plenty of water until exceptionally soft and tender (about 45 minutes).\n2. Add salt, then mash the beans thoroughly with a wooden ladle into a smooth, comforting paste.\n3. For the Aganyin sauce: heat red palm oil on medium-low heat until darkened slightly. Add plenty of thinly sliced onions and fry slowly until caramelized and dark brown.\n4. Add coarsely pulsed dried peppers, ground crayfish, and seasoning cube. Fry on low heat for 20 minutes until the sauce is deep mahogany and aromatic.\n5. Spoon warm mashed beans onto a plate, top generously with the spicy aganyin sauce, and pair with fried ripe plantains (Dodo).`
    },
    {
      id: 'rec_ofada_ayamase',
      name: 'Ofada Rice with Spicy Ayamase (Designer Stew)',
      category: 'lunch',
      origin: 'nigerian',
      region: 'Yoruba / Ogun State',
      prepTime: 25,
      cookTime: 45,
      servings: 5,
      imageUrl: '',
      ingredients: [
        '3 cups Local Ofada rice (picked and washed)',
        '1 cup Red palm oil (bleached carefully)',
        '6 Green bell peppers',
        '4 Green scotch bonnets',
        '3 tbsp Locust beans (Iru)',
        '400g Bite-sized cooked assorted meats (shaki, ponmo, beef)',
        '4 Hard-boiled eggs',
        '3 tbsp Ground crayfish',
        '2 Onions',
        '1 tsp Salt'
      ],
      instructions: `1. Pick stones from Ofada rice, wash thoroughly, and boil with water and salt until tender; drain.\n2. Coarsely blend green bell peppers, green scotch bonnets, and onions. Boil down until the water evaporates.\n3. Bleach palm oil in a tightly covered pot on low heat for 12 minutes until translucent (allow to cool slightly before opening to prevent smoke).\n4. Add sliced onions and rinsed locust beans (iru) to the oil and fry until fragrant.\n5. Add the green pepper paste and fry until oil floats to the top.\n6. Stir in assorted meat bites, crayfish, and whole boiled eggs. Simmer for 10 minutes.\n7. Serve over steaming Ofada rice wrapped in banana leaves.`
    },
    {
      id: 'rec_okra_soup',
      name: 'Seafood Okra Soup (Ila Alasepo)',
      category: 'dinner',
      origin: 'nigerian',
      region: 'Pan-Nigerian Coastline',
      prepTime: 15,
      cookTime: 20,
      servings: 4,
      imageUrl: '',
      ingredients: [
        '30 Fresh Okra fingers (half finely chopped, half grated)',
        '250g Fresh jumbo prawns / shrimp',
        '2 Fresh croaker fish steaks or dry catfish',
        '1/3 cup Red palm oil',
        '2 tbsp Locust beans (Iru)',
        '3 tbsp Ground crayfish',
        '2 Scotch bonnet peppers (finely chopped)',
        '1 cup Chopped fresh spinach leaves',
        '2 Seasoning cubes',
        '1 tsp Salt'
      ],
      instructions: `1. In a pot, bring 2 cups of water with seasoned fish and prawns to a gentle simmer for 5 minutes; gently remove the seafood and reserve the stock.\n2. To the bubbling broth, add palm oil, locust beans, chopped scotch bonnets, and ground crayfish.\n3. Add chopped and grated okra. Whisk vigorously with a fork or cooking broom to bring out the viscosity.\n4. Cook on high heat for 3-4 minutes to keep the okra bright green and crisp.\n5. Return cooked fish and prawns to the soup, fold in fresh spinach leaves, and turn off heat immediately.\n6. Serve with warm Semovita, Eba, or Pounded Yam.`
    },
    {
      id: 'rec_ogbono_soup',
      name: 'Traditional Ogbono Soup (Draw Soup)',
      category: 'dinner',
      origin: 'nigerian',
      region: 'Igbo / Pan-Nigerian',
      prepTime: 15,
      cookTime: 25,
      servings: 5,
      imageUrl: '',
      ingredients: [
        '1 cup Ground Ogbono seeds (African mango seeds)',
        '1/2 cup Red palm oil',
        '500g Assorted meats and Stockfish',
        '1 Smoked catfish',
        '3 tbsp Ground crayfish',
        '2 Scotch bonnet peppers (blended)',
        '1 cup Chopped Ugwu leaves or Bitterleaf',
        '2 Seasoning cubes',
        '1 tsp Salt'
      ],
      instructions: `1. Boil assorted meats and stockfish until tender, reserving 3 cups of flavorful stock.\n2. Dissolve finely ground ogbono in warm palm oil in a bowl until smooth and free of lumps.\n3. Pour meat stock into a pot on medium heat. Pour in dissolved ogbono mixture, stirring constantly in one direction.\n4. Watch as the soup begins to thicken and develop its signature stretch. Simmer on low heat for 12 minutes.\n5. Add cooked meats, deboned smoked catfish, crayfish, blended peppers, and seasoning cubes. Simmer for 8 minutes.\n6. Stir in chopped ugwu or bitterleaf, cook for 2 minutes, and serve hot with Eba or Fufu.`
    },
    {
      id: 'rec_banga_soup',
      name: 'Delta Banga Soup (Oghwo Amiedi)',
      category: 'lunch',
      origin: 'nigerian',
      region: 'Niger Delta (Urhobo & Itsekiri)',
      prepTime: 20,
      cookTime: 35,
      servings: 4,
      imageUrl: '',
      ingredients: [
        '4 cups Fresh palm fruit concentrate (Banga extract)',
        '500g Assorted meat & fresh catfish',
        '1 tbsp Banga spice mix (Rohojie & Obenetietien)',
        '1 Oburunbebe stick',
        '2 tbsp Dried Beletete leaves',
        '3 tbsp Ground crayfish',
        '2 Scotch bonnet peppers',
        '1 tsp Salt'
      ],
      instructions: `1. In a traditional clay pot or heavy saucepan, pour palm fruit concentrate with 1 cup of water and bring to a gentle boil.\n2. Add oburunbebe stick, banga spice blend, blended scotch bonnets, and ground crayfish.\n3. Add precooked meats and fresh catfish. Cook on medium heat for 20 minutes until the soup thickens and palm oil pools on top.\n4. Crush dried beletete leaves between your palms into the pot and stir gently.\n5. Simmer on low heat for 5 minutes. Serve hot with yellow cassava Starch (Usi) or Pounded Yam.`
    },
    {
      id: 'rec_afang_soup',
      name: 'Calabar Afang Soup',
      category: 'dinner',
      origin: 'nigerian',
      region: 'Efik / Ibibio (Cross River)',
      prepTime: 25,
      cookTime: 30,
      servings: 5,
      imageUrl: '',
      ingredients: [
        '2 cups Ground Afang (Okazi) leaves',
        '4 cups Fresh Waterleaf (shredded)',
        '1 cup Red palm oil',
        '500g Beef, Kpomo, and Snails',
        '1 Big Stockfish head',
        '4 tbsp Ground crayfish',
        '3 Scotch bonnet peppers',
        '2 Seasoning cubes',
        '1 tsp Salt'
      ],
      instructions: `1. Boil beef, kpomo, snails, and stockfish with seasoning cubes until very tender with little concentrated broth remaining.\n2. Add ground crayfish, blended scotch bonnets, and palm oil to the pot; simmer for 5 minutes.\n3. Add shredded waterleaf. Cook for 3 minutes (waterleaf releases moisture).\n4. Add finely pounded afang leaves and stir thoroughly to combine.\n5. Simmer on low heat for 4 minutes until the leaves soften. Serve with Semo, Garri, or Pounded Yam.`
    },
    {
      id: 'rec_edikang_ikong',
      name: 'Authentic Edikang Ikong Soup',
      category: 'dinner',
      origin: 'nigerian',
      region: 'Efik / Ibibio Cuisine',
      prepTime: 25,
      cookTime: 30,
      servings: 5,
      imageUrl: '',
      ingredients: [
        '4 cups Ugwu leaves (fluted pumpkin, shredded)',
        '2 cups Waterleaf (shredded)',
        '1 cup Red palm oil',
        '600g Beef, Cow tail, and fresh Periwinkles',
        '1 Dry smoked fish',
        '4 tbsp Ground crayfish',
        '3 Yellow scotch bonnet peppers',
        '2 Seasoning cubes',
        '1 tsp Salt'
      ],
      instructions: `1. Cook meats and periwinkles with seasoning cubes and minimal water until tender.\n2. Add flaked dry fish, blended yellow scotch bonnets, ground crayfish, and plenty of red palm oil. Simmer for 6 minutes.\n3. Add waterleaf and stir; allow to cook for 2 minutes.\n4. Stir in shredded ugwu leaves. Turn heat to low and simmer for 3 minutes without covering the pot.\n5. Serve with your favorite swallow.`
    },
    {
      id: 'rec_amala_abula',
      name: 'Amala with Ewedu & Gbegiri (Abula)',
      category: 'lunch',
      origin: 'nigerian',
      region: 'Yoruba (Oyo & Ibadan Heritage)',
      prepTime: 20,
      cookTime: 35,
      servings: 4,
      imageUrl: '',
      ingredients: [
        '2 cups Yam flour (Elubo)',
        '2 Bunches fresh Ewedu leaves',
        '1 cup Peeled brown beans for Gbegiri',
        '1/3 cup Palm oil',
        '1 tsp Potash (Kaun) or baking soda for Ewedu',
        '3 tbsp Ground crayfish',
        '1 cup Fried pepper stew (Obe ata)',
        'Cooked assorted meat (Towel, Roundabout)'
      ],
      instructions: `1. For Gbegiri: Boil peeled beans until very soft, blend smoothly, and cook with palm oil, crayfish, and seasonings until velvety.\n2. For Ewedu: Pick ewedu leaves, boil with a tiny pinch of kaun, whisk with an ijabe (broom) or blender, and season with crayfish and salt.\n3. For Amala: Bring water to a rapid boil. Lower heat, sprinkle yam flour steadily while turning continuously with an omorogun (turning stick) until lump-free and elastic. Add a splash of water, cover to steam for 5 minutes, and knead again.\n4. Plate smooth dark amala, pour gbegiri and ewedu side by side, top with hot pepper stew and assorted meat.`
    },
    {
      id: 'rec_beef_suya',
      name: 'Authentic Nigerian Beef Suya',
      category: 'snack',
      origin: 'nigerian',
      region: 'Northern Nigerian Heritage',
      prepTime: 25,
      cookTime: 18,
      servings: 4,
      imageUrl: '',
      ingredients: [
        '500g Beef flank or sirloin (thinly sliced across grain)',
        '1/2 cup Yaji spice blend (roasted peanut powder, ginger, garlic, chili, cloves)',
        '3 tbsp Vegetable oil',
        '1 Medium red onion (sliced into rings)',
        '2 Fresh tomatoes (sliced)',
        '1 cup Sliced cabbage',
        '1 tsp Salt'
      ],
      instructions: `1. Thread thinly sliced beef ribbons onto wooden skewers (pre-soaked in water for 30 minutes).\n2. Brush skewers generously with vegetable oil.\n3. Coat each skewer thoroughly in Yaji spice powder, pressing the seasonings firmly into the meat.\n4. Marinate for at least 30 minutes (or refrigerate overnight).\n5. Grill on charcoal embers or bake in the oven at 200°C (400°F) for 15-18 minutes, turning once and basting with oil and extra Yaji.\n6. Serve piping hot on brown paper with sliced red onions, tomatoes, and cabbage.`
    },
    {
      id: 'rec_puff_puff',
      name: 'Fluffy Golden Puff Puff',
      category: 'snack',
      origin: 'nigerian',
      region: 'Pan-Nigerian Street Delicacy',
      prepTime: 50,
      cookTime: 15,
      servings: 6,
      imageUrl: '',
      ingredients: [
        '3 cups All-purpose flour',
        '1/2 cup Granulated sugar',
        '2 tsp Active dry yeast',
        '1/2 tsp Ground nutmeg',
        '1 1/2 cups Warm water',
        '1/2 tsp Salt',
        '4 cups Vegetable oil for deep frying'
      ],
      instructions: `1. In a bowl, dissolve active yeast and 1 tbsp sugar in warm water; let sit for 5 minutes until foamy.\n2. In a larger bowl, mix flour, remaining sugar, nutmeg, and salt.\n3. Pour in yeast liquid and mix with your hands or a spoon into a smooth, stretchy, thick batter.\n4. Cover tightly with cling wrap and a warm towel; proof in a warm place for 45 minutes until doubled in volume.\n5. Heat vegetable oil on medium heat in a deep pot.\n6. Grab handfuls of batter and squeeze through your thumb and forefinger to drop round spheres into the hot oil.\n7. Fry until evenly golden brown on all sides, turning occasionally. Drain on paper towels and enjoy warm!`
    },
    {
      id: 'rec_meat_pie',
      name: 'Nigerian Meat Pie (Flaky Crust & Savory Filling)',
      category: 'snack',
      origin: 'nigerian',
      region: 'Pan-Nigerian Bakery Favorite',
      prepTime: 35,
      cookTime: 35,
      servings: 6,
      imageUrl: '',
      ingredients: [
        '3 cups All-purpose flour',
        '200g Cold unsalted butter (cubed)',
        '1 tsp Baking powder',
        '1/2 cup Ice cold water',
        '300g Minced beef',
        '1 Medium Irish potato (diced small)',
        '1 Medium carrot (diced small)',
        '1 Small onion',
        '1 tbsp Thyme & Curry powder',
        '1 Egg for egg wash',
        '1 tsp Salt'
      ],
      instructions: `1. Filling: Brown minced beef and onions in a pot. Add diced potatoes, carrots, thyme, curry, stock, and salt. Simmer until tender. Thicken with 1 tbsp flour slurry; cool completely.\n2. Pastry: Rub cold cubed butter into flour, baking powder, and salt with fingertips until crumbly. Gradually add cold water to bring dough together. Chill for 20 minutes.\n3. Roll dough on a floured surface, cut circles using a cutter. Place a generous spoonful of filling in the center.\n4. Fold into half-moons, crimp edges with a fork, brush top with beaten egg, and pierce steam vents.\n5. Bake at 180°C (350°F) for 30-35 minutes until golden and flaky.`
    },
    {
      id: 'rec_nigerian_fried_rice',
      name: 'Nigerian Fried Rice with Liver & Veggies',
      category: 'lunch',
      origin: 'nigerian',
      region: 'Pan-Nigerian Celebration Classic',
      prepTime: 25,
      cookTime: 30,
      servings: 5,
      imageUrl: '',
      ingredients: [
        '3 cups Parboiled long grain rice',
        '3 cups Rich chicken/turkey stock',
        '1 tbsp Curry powder',
        '1 tbsp Dried thyme',
        '1 cup Cooked diced cow liver or beef',
        '1 1/2 cups Mixed vegetables (carrots, peas, sweetcorn, green beans)',
        '1 Large onion (finely chopped)',
        '4 tbsp Vegetable oil',
        '1 tsp Salt'
      ],
      instructions: `1. Wash rice thoroughly. Parboil in seasoned chicken stock spiced with curry powder, thyme, and salt until cooked al dente (grains firm and separate).\n2. Heat vegetable oil in a large wok or skillet. Saute finely chopped onions, then add diced liver and mixed vegetables. Stir-fry for 3 minutes to keep vegetables crunchy.\n3. Add the yellow seasoned rice in batches, stir-frying on high heat to blend flavors and toast grains.\n4. Serve hot with fried plantains (Dodo) and roasted peppered chicken.`
    },
    {
      id: 'rec_ogi_pap',
      name: 'Traditional Ogi (Akamu / Pap) with Milk & Sugar',
      category: 'breakfast',
      origin: 'nigerian',
      region: 'Pan-Nigerian Morning Comfort',
      prepTime: 5,
      cookTime: 5,
      servings: 2,
      imageUrl: '',
      ingredients: [
        '3 tbsp Fermented corn paste (Yellow or white Ogi)',
        '2 cups Freshly boiling water',
        '1/2 cup Evaporated milk',
        '2 tbsp Sugar or honey'
      ],
      instructions: `1. In a clean deep bowl, mix the cold ogi paste with 2 tablespoons of cold water until smooth and lump-free.\n2. Pour freshly boiling water continuously from a slight height into the center of the bowl while stirring steadily in one direction.\n3. The mixture will rapidly turn translucent and thicken into a soothing porridge.\n4. Swirl in creamy evaporated milk and sugar or honey. Pair with hot Akara or Moi Moi.`
    },
    {
      id: 'rec_intl_pancakes',
      name: 'Fluffy Golden Pancakes with Honey & Fruit',
      category: 'breakfast',
      origin: 'international',
      region: 'Continental Morning Classic',
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      imageUrl: '',
      ingredients: [
        '2 cups All-purpose flour',
        '2 tbsp Granulated sugar',
        '2 tsp Baking powder',
        '1 1/2 cups Milk',
        '1 Large egg',
        '3 tbsp Melted butter',
        '1 tsp Vanilla extract',
        'Fresh sliced fruit & Honey for serving'
      ],
      instructions: `1. In a bowl, whisk flour, sugar, baking powder, and a pinch of salt.\n2. In another bowl, whisk milk, egg, melted butter, and vanilla.\n3. Combine wet and dry ingredients just until blended (do not overmix; small lumps are fine).\n4. Heat a lightly buttered nonstick pan over medium heat. Pour 1/4 cup batter for each pancake.\n5. Cook until bubbles form on the surface, flip, and cook until golden.\n6. Stack high, top with fruit slices, and drizzle with sweet honey or syrup.`
    }
  ];

  // Starter Kitchen Inventory
  const STARTER_INVENTORY = [
    { id: 'inv_1', name: 'Long grain parboiled rice', quantity: 5, unit: 'kg', expiryDate: getFutureDate(180), threshold: 2 },
    { id: 'inv_2', name: 'Red palm oil', quantity: 2, unit: 'liters', expiryDate: getFutureDate(90), threshold: 1 },
    { id: 'inv_3', name: 'Ground melon seeds (Egusi)', quantity: 3, unit: 'cups', expiryDate: getFutureDate(45), threshold: 2 },
    { id: 'inv_4', name: 'Brown beans', quantity: 4, unit: 'cups', expiryDate: getFutureDate(60), threshold: 2 },
    { id: 'inv_5', name: 'White yam tuber', quantity: 2, unit: 'tubers', expiryDate: getFutureDate(21), threshold: 1 },
    { id: 'inv_6', name: 'Red onions', quantity: 6, unit: 'pieces', expiryDate: getFutureDate(14), threshold: 3 },
    { id: 'inv_7', name: 'Scotch bonnet peppers (Rodo)', quantity: 12, unit: 'pieces', expiryDate: getFutureDate(5), threshold: 4 },
    { id: 'inv_8', name: 'Red bell peppers (Tatashe)', quantity: 4, unit: 'pieces', expiryDate: getFutureDate(4), threshold: 2 },
    { id: 'inv_9', name: 'Seasoning cubes', quantity: 25, unit: 'pieces', expiryDate: getFutureDate(120), threshold: 5 },
    { id: 'inv_10', name: 'Ground crayfish', quantity: 1, unit: 'cups', expiryDate: getFutureDate(60), threshold: 1 },
    { id: 'inv_11', name: 'Smoked catfish', quantity: 2, unit: 'pieces', expiryDate: getFutureDate(2), threshold: 1 },
    { id: 'inv_12', name: 'Vegetable oil', quantity: 1.5, unit: 'liters', expiryDate: getFutureDate(90), threshold: 1 }
  ];

  // Starter Planner
  const STARTER_PLANNER = {
    'monday_breakfast': { recipeId: 'rec_akara_crispy', customName: '' },
    'monday_lunch': { recipeId: 'rec_jollof_party', customName: '' },
    'monday_dinner': { recipeId: 'rec_yam_porridge', customName: '' },
    'monday_snack': { recipeId: 'rec_puff_puff', customName: '' },
    'tuesday_breakfast': { recipeId: 'rec_ogi_pap', customName: '' },
    'tuesday_lunch': { recipeId: 'rec_ofada_ayamase', customName: '' },
    'tuesday_dinner': { recipeId: 'rec_egusi_soup', customName: '' },
    'wednesday_breakfast': { recipeId: 'rec_ewa_aganyin', customName: '' },
    'wednesday_lunch': { recipeId: 'rec_nigerian_fried_rice', customName: '' },
    'wednesday_dinner': { recipeId: 'rec_okra_soup', customName: '' },
    'thursday_dinner': { recipeId: 'rec_efo_riro', customName: '' },
    'friday_dinner': { recipeId: 'rec_beef_suya', customName: '' },
    'saturday_lunch': { recipeId: 'rec_amala_abula', customName: '' },
    'sunday_lunch': { recipeId: 'rec_jollof_party', customName: '' }
  };

  // Starter Shopping
  const STARTER_SHOPPING = [
    { id: 'shop_1', name: 'Fresh Ugwu leaves', quantity: 2, unit: 'bunch', purchased: false, fromRecipe: 'Egusi Soup' },
    { id: 'shop_2', name: 'Stockfish head', quantity: 1, unit: 'pieces', purchased: false, fromRecipe: 'Egusi Soup' },
    { id: 'shop_3', name: 'Plum tomatoes', quantity: 10, unit: 'pieces', purchased: true, fromRecipe: 'Smoky Jollof' }
  ];

  // ----------------------------------------------------------------------------
  // 5. APPLICATION STATE
  // ----------------------------------------------------------------------------
  const state = {
    recipes: [],
    inventory: [],
    planner: {},
    shopping: [],
    userName: '', // Never pre-filled: comes only from this browser's saved profile
    hasProfile: false,
    greetingPref: 'all',
    currentGreetingIndex: 0,
    currentView: 'dashboard',
    activeRecipeCategory: 'all',
    recipeSearchQuery: '',
    inventoryFilter: 'all',
    inventorySearchQuery: '',
    shoppingFilter: 'all',
    shoppingSearchQuery: '',
    plannerActiveDay: 'all',
    currentSpotlightRecipeId: null
  };

  // ----------------------------------------------------------------------------
  // 6. HELPER UTILITIES
  // ----------------------------------------------------------------------------
  function generateId(prefix = 'item') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  function getFutureDate(daysAhead) {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function daysUntil(dateStr) {
    if (!dateStr) return 999;
    const target = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  function safeString(str) {
    return (str || '').toString().trim();
  }

  function escapeHtml(str) {
    return (str || '')
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ----------------------------------------------------------------------------
  // 7. LOCAL STORAGE MANAGEMENT
  // ----------------------------------------------------------------------------
  function loadData() {
    try {
      const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);

      loadUserProfile();

      if (!isInit) {
        // Seed first time
        state.recipes = STARTER_RECIPES;
        state.inventory = STARTER_INVENTORY;
        state.planner = STARTER_PLANNER;
        state.shopping = STARTER_SHOPPING;

        saveRecipes();
        saveInventory();
        savePlanner();
        saveShopping();
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      } else {
        const savedRecipes = localStorage.getItem(STORAGE_KEYS.RECIPES);
        state.recipes = savedRecipes ? JSON.parse(savedRecipes) : STARTER_RECIPES;

        const savedInventory = localStorage.getItem(STORAGE_KEYS.INVENTORY);
        state.inventory = savedInventory ? JSON.parse(savedInventory) : [];

        const savedPlanner = localStorage.getItem(STORAGE_KEYS.PLANNER);
        state.planner = savedPlanner ? JSON.parse(savedPlanner) : {};

        const savedShopping = localStorage.getItem(STORAGE_KEYS.SHOPPING);
        state.shopping = savedShopping ? JSON.parse(savedShopping) : [];
      }
    } catch (e) {
      console.error('Error loading data from localStorage:', e);
      state.recipes = STARTER_RECIPES;
      state.inventory = STARTER_INVENTORY;
      state.planner = STARTER_PLANNER;
      state.shopping = STARTER_SHOPPING;
    }
    migrateImageAssociations();
  }

  function saveRecipes() {
    try {
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(state.recipes));
    } catch (e) {
      console.error('Error saving recipes:', e);
    }
  }

  function saveInventory() {
    try {
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(state.inventory));
    } catch (e) {
      console.error('Error saving inventory:', e);
    }
  }

  function savePlanner() {
    try {
      localStorage.setItem(STORAGE_KEYS.PLANNER, JSON.stringify(state.planner));
    } catch (e) {
      console.error('Error saving planner:', e);
    }
  }

  function saveShopping() {
    try {
      localStorage.setItem(STORAGE_KEYS.SHOPPING, JSON.stringify(state.shopping));
    } catch (e) {
      console.error('Error saving shopping list:', e);
    }
  }

  function saveUserProfile(name, greetingPref) {
    const cleanName = safeString(name).replace(/\s+/g, ' ').slice(0, 30);
    if (!cleanName) return false; // never invent a name

    const existing = readStoredProfile();
    const now = new Date().toISOString();
    const profile = {
      name: cleanName,
      greetingPref: greetingPref || 'all',
      createdAt: existing && existing.createdAt ? existing.createdAt : now,
      updatedAt: now
    };

    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Error saving profile:', e);
      showToast('Could not save your profile in this browser (storage unavailable).', 'error');
      return false;
    }

    state.userName = profile.name;
    state.greetingPref = profile.greetingPref;
    state.hasProfile = true;
    state.currentGreetingIndex = 0;
    updateUserInterfaceIdentity();
    renderDashboardGreeting();
    showToast(`Welcome, ${escapeHtml(state.userName)}! Your preferences have been saved on this device.`, 'success');
    return true;
  }

  // Reads and validates the profile stored by THIS browser. Returns null if none.
  function readStoredProfile() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.name === 'string' && parsed.name.trim()) return parsed;
    } catch (e) {
      console.error('Error reading profile:', e);
    }
    return null;
  }

  function loadUserProfile() {
    let profile = readStoredProfile();

    // One-time migration: an earlier version stored the name the visitor typed
    // under a different key in this same browser. Carry it over; never invent one.
    if (!profile) {
      try {
        const legacyName = safeString(localStorage.getItem(STORAGE_KEYS.LEGACY_USER_NAME));
        if (legacyName) {
          const now = new Date().toISOString();
          profile = {
            name: legacyName.slice(0, 30),
            greetingPref: localStorage.getItem(STORAGE_KEYS.LEGACY_GREETING_PREF) || 'all',
            createdAt: now,
            updatedAt: now
          };
          localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
        }
      } catch (e) {
        console.error('Error migrating legacy profile:', e);
      }
    }

    if (profile) {
      state.userName = profile.name;
      state.greetingPref = profile.greetingPref || 'all';
      state.hasProfile = true;
    } else {
      state.userName = '';
      state.greetingPref = 'all';
      state.hasProfile = false;
    }
  }

  // First-visit welcome screen: shown whenever this browser has no saved profile.
  function showWelcomeSetupIfNeeded() {
    if (state.hasProfile) return;
    const input = document.getElementById('welcomeNameInput');
    if (input) input.value = '';
    openModal('welcomeSetupModal');
    setTimeout(() => { if (input) input.focus(); }, 80);
  }

  function handleWelcomeSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('welcomeNameInput');
    const pref = document.getElementById('welcomeGreetingPref');
    const name = safeString(input ? input.value : '');
    if (!name) {
      setFieldError('errWelcomeName', 'Please tell us what to call you');
      if (input) input.focus();
      return;
    }
    setFieldError('errWelcomeName', '');
    if (saveUserProfile(name, pref ? pref.value : 'all')) {
      closeModal('welcomeSetupModal');
    }
  }

  // ----------------------------------------------------------------------------
  // 8. TOAST NOTIFICATIONS & MODALS
  // ----------------------------------------------------------------------------
  function showToast(message, type = 'success', duration = 3200) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '✔';
    if (type === 'error') icon = '✕';
    if (type === 'accent') icon = '🍲';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // Generic custom confirmation dialog
  function showConfirm(title, message, onConfirm, okButtonText = 'Delete', isDanger = true) {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmModalTitle');
    const msgEl = document.getElementById('confirmModalMessage');
    const okBtn = document.getElementById('confirmModalOkBtn');
    const cancelBtn = document.getElementById('confirmModalCancelBtn');
    const closeBtn = document.getElementById('confirmModalCloseBtn');

    titleEl.textContent = title;
    msgEl.textContent = message;
    okBtn.textContent = okButtonText;

    if (isDanger) {
      okBtn.className = 'btn btn-danger';
    } else {
      okBtn.className = 'btn btn-primary';
    }

    modal.classList.add('open');

    function cleanup() {
      modal.classList.remove('open');
      okBtn.removeEventListener('click', handleOk);
      cancelBtn.removeEventListener('click', handleCancel);
      closeBtn.removeEventListener('click', handleCancel);
    }

    function handleOk() {
      cleanup();
      if (typeof onConfirm === 'function') onConfirm();
    }

    function handleCancel() {
      cleanup();
    }

    okBtn.addEventListener('click', handleOk);
    cancelBtn.addEventListener('click', handleCancel);
    closeBtn.addEventListener('click', handleCancel);
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  }

  function openModal(modalIdOrEl) {
    const modal = typeof modalIdOrEl === 'string' ? document.getElementById(modalIdOrEl) : modalIdOrEl;
    if (modal) modal.classList.add('open');
  }

  // User Profile Modal
  function openProfileModal() {
    const nameInput = document.getElementById('userNameInput');
    const prefSelect = document.getElementById('userGreetingPref');
    if (nameInput) nameInput.value = state.userName || '';
    if (prefSelect) prefSelect.value = state.greetingPref || 'all';
    openModal('userProfileModal');
  }

  function handleProfileSubmit(e) {
    e.preventDefault();
    const nameInput = document.getElementById('userNameInput');
    const prefSelect = document.getElementById('userGreetingPref');
    const name = safeString(nameInput.value);
    const pref = prefSelect.value;

    if (!name) {
      document.getElementById('errUserName').textContent = 'Please enter your preferred name';
      return;
    }
    document.getElementById('errUserName').textContent = '';

    saveUserProfile(name, pref);
    closeModal('userProfileModal');
  }

  function updateUserInterfaceIdentity() {
    const initial = state.userName ? Array.from(state.userName)[0].toUpperCase() : '•';
    const displayName = state.userName || 'Your profile';
    
    // Topbar Profile Chip
    const topbarName = document.getElementById('topbarUserName');
    const topbarAvatar = document.getElementById('topbarAvatarLetter');
    if (topbarName) topbarName.textContent = displayName;
    if (topbarAvatar) topbarAvatar.textContent = initial;

    // Sidebar Profile Card
    const sidebarName = document.getElementById('sidebarProfileName');
    const sidebarAvatar = document.getElementById('sidebarAvatarLetter');
    if (sidebarName) sidebarName.textContent = displayName;
    if (sidebarAvatar) sidebarAvatar.textContent = initial;
  }

  // ----------------------------------------------------------------------------
  // 9. NIGERIAN GREETINGS ENGINE
  // Multi-lingual, culturally celebratory, time-aware, paired with user name
  // ----------------------------------------------------------------------------
  function getCurrentTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  function getEligibleGreetings() {
    const timeOfDay = getCurrentTimeOfDay();
    const pref = state.greetingPref || 'all';

    return NIGERIAN_GREETINGS.filter(g => {
      // Dialect filter
      if (pref !== 'all') {
        const langLower = g.lang.toLowerCase();
        if (!langLower.includes(pref)) return false;
      }
      // Time of day filter
      return g.timeOfDay === 'any' || g.timeOfDay === timeOfDay;
    });
  }

  function renderDashboardGreeting() {
    const greetingEl = document.getElementById('dashboardGreeting');
    const langTagEl = document.getElementById('greetingLangName');
    const subGreetingEl = document.getElementById('dashboardSubGreeting');
    if (!greetingEl) return;

    const list = getEligibleGreetings();
    const pool = list.length > 0 ? list : NIGERIAN_GREETINGS;
    const selected = pool[state.currentGreetingIndex % pool.length];

    const userName = state.userName ? escapeHtml(state.userName) : '';

    // Format personalised greeting using ONLY this browser's saved name, e.g.
    // "Good afternoon, Mey." / "Ẹ káàbọ̀, Mey!" / "How far, Mey? ..."
    // Until a profile exists the greeting is name-free (the welcome screen is shown).
    let greetingText = '';
    if (!userName) {
      greetingText = selected.text.replace(/[?!]$/, '') + '!';
    } else if (selected.text.includes('?')) {
      greetingText = `${selected.text.replace('?', '')}, ${userName}?`;
    } else if (selected.text.includes('!')) {
      greetingText = `${selected.text.replace('!', '')}, ${userName}!`;
    } else {
      greetingText = `${selected.text}, ${userName}${selected.punct || '!'}`;
    }

    greetingEl.innerHTML = greetingText;
    if (langTagEl) langTagEl.textContent = `${selected.lang} Heritage`;
    if (subGreetingEl && selected.subtitle) {
      subGreetingEl.textContent = selected.subtitle;
    }
  }

  function cycleGreeting() {
    state.currentGreetingIndex = (state.currentGreetingIndex + 1);
    renderDashboardGreeting();
    showToast('Switched to another Nigerian cultural greeting!', 'accent', 1800);
  }

  // ----------------------------------------------------------------------------
  // 10. NAVIGATION & VIEW SWITCHING
  // ----------------------------------------------------------------------------
  function navigate(viewName) {
    const validViews = ['dashboard', 'recipes', 'suggestions', 'planner', 'inventory', 'shopping'];
    if (!validViews.includes(viewName)) viewName = 'dashboard';

    state.currentView = viewName;

    // Toggle view sections
    document.querySelectorAll('.view-section').forEach(section => {
      section.classList.remove('active');
    });
    const targetSection = document.getElementById(`view-${viewName}`);
    if (targetSection) targetSection.classList.add('active');

    // Update sidebar nav items
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
      if (btn.dataset.view === viewName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update mobile bottom nav items
    document.querySelectorAll('.mobile-nav .mobile-nav-item').forEach(btn => {
      if (btn.dataset.view === viewName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Close mobile drawer if open
    const sidebar = document.getElementById('sidebar');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('open');
    document.body.style.overflow = '';

    // Update Topbar Title & Subtitle
    const viewTitle = document.getElementById('currentViewTitle');
    const viewSubtitle = document.getElementById('currentViewSubtitle');
    const globalAddBtn = document.getElementById('globalAddBtn');

    const viewDetails = {
      dashboard: {
        title: 'Dashboard',
        subtitle: 'Curated culinary planning and inventory overview',
        btnText: 'Add Recipe',
        action: () => openAddRecipeModal()
      },
      recipes: {
        title: 'Recipe Library',
        subtitle: 'Authentic Nigerian heritage dishes and culinary creations',
        btnText: 'Add Recipe',
        action: () => openAddRecipeModal()
      },
      suggestions: {
        title: 'What Should I Eat Today?',
        subtitle: 'Smart meal recommendations based on your kitchen inventory',
        btnText: 'Surprise Me!',
        action: () => generateRandomSuggestion()
      },
      planner: {
        title: 'Weekly Meal Planner',
        subtitle: 'Organize your breakfast, lunch, dinner and snacks across the week',
        btnText: 'Assign Meal',
        action: () => openAssignPlannerModal()
      },
      inventory: {
        title: 'Kitchen Inventory',
        subtitle: 'Track pantry ingredients, quantities and expiry alerts',
        btnText: 'Add Ingredient',
        action: () => openAddInventoryModal()
      },
      shopping: {
        title: 'Shopping List',
        subtitle: 'Ingredients to purchase for your planned culinary creations',
        btnText: 'Add Item',
        action: () => openAddShoppingModal()
      }
    };

    const details = viewDetails[viewName];
    if (viewTitle) viewTitle.textContent = details.title;
    if (viewSubtitle) viewSubtitle.textContent = details.subtitle;
    if (globalAddBtn) {
      globalAddBtn.querySelector('.btn-text').textContent = details.btnText;
      globalAddBtn.onclick = details.action;
    }

    refreshCurrentView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function refreshCurrentView() {
    updateBadgesAndCounters();
    switch (state.currentView) {
      case 'dashboard':
        renderDashboard();
        break;
      case 'recipes':
        renderRecipes();
        break;
      case 'suggestions':
        break;
      case 'planner':
        renderPlanner();
        break;
      case 'inventory':
        renderInventory();
        break;
      case 'shopping':
        renderShopping();
        break;
    }
  }

  function updateBadgesAndCounters() {
    const navRecipeCount = document.getElementById('nav-recipe-count');
    const navPlannerCount = document.getElementById('nav-planner-count');
    const navInvCount = document.getElementById('nav-inventory-count');
    const navShopCount = document.getElementById('nav-shopping-count');

    const totalRecipes = state.recipes.length;
    const plannedCount = Object.keys(state.planner).length;
    const invCount = state.inventory.length;
    const pendingShopCount = state.shopping.filter(i => !i.purchased).length;

    if (navRecipeCount) navRecipeCount.textContent = totalRecipes;
    if (navPlannerCount) navPlannerCount.textContent = plannedCount;
    if (navInvCount) navInvCount.textContent = invCount;
    if (navShopCount) navShopCount.textContent = pendingShopCount;

    const dashRecipes = document.getElementById('dashTotalRecipes');
    const dashPlanned = document.getElementById('dashPlannedMeals');
    const dashInv = document.getElementById('dashInventoryCount');
    const dashShop = document.getElementById('dashShoppingCount');

    if (dashRecipes) dashRecipes.textContent = totalRecipes;
    if (dashPlanned) dashPlanned.textContent = plannedCount;
    if (dashInv) dashInv.textContent = invCount;
    if (dashShop) dashShop.textContent = pendingShopCount;
  }

  // ----------------------------------------------------------------------------
  // 11. DASHBOARD MODULE
  // ----------------------------------------------------------------------------
  function renderDashboard() {
    // 1. Personalised Nigerian Greeting
    renderDashboardGreeting();
    updateUserInterfaceIdentity();

    // 2. Date in Topbar
    const topbarDateEl = document.getElementById('topbarDate');
    const now = new Date();
    const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    if (topbarDateEl) topbarDateEl.textContent = now.toLocaleDateString('en-GB', dateOptions);

    // 3. Alerts, Today's Meals, Spotlight, Week Glance
    renderDashboardAlerts();
    renderDashboardTodayMeals();
    renderDashboardSpotlight();
    renderDashboardWeekGlance();
  }

  function renderDashboardAlerts() {
    const container = document.getElementById('dashAlertsContainer');
    if (!container) return;
    container.innerHTML = '';

    const expiringOrExpired = [];
    const lowStock = [];

    state.inventory.forEach(item => {
      const days = daysUntil(item.expiryDate);
      if (days < 0) {
        expiringOrExpired.push({ item, status: 'expired', days });
      } else if (days <= 3) {
        expiringOrExpired.push({ item, status: 'soon', days });
      }

      const threshold = item.threshold || 2;
      if (item.quantity <= threshold && days >= 0) {
        lowStock.push(item);
      }
    });

    if (expiringOrExpired.length > 0) {
      const expiredCount = expiringOrExpired.filter(i => i.status === 'expired').length;
      const soonCount = expiringOrExpired.filter(i => i.status === 'soon').length;

      const banner = document.createElement('div');
      banner.className = 'alert-banner alert-banner-danger';
      
      let msg = '';
      if (expiredCount > 0 && soonCount > 0) {
        msg = `<strong>${expiredCount} expired</strong> and <strong>${soonCount} soon-to-expire</strong> ingredient(s) in your kitchen!`;
      } else if (expiredCount > 0) {
        msg = `<strong>${expiredCount} ingredient(s)</strong> have expired in your pantry!`;
      } else {
        msg = `<strong>${soonCount} ingredient(s)</strong> are approaching expiry within 3 days!`;
      }

      banner.innerHTML = `
        <div class="alert-banner-content">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;color:#be123c;">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <span>${msg}</span>
        </div>
        <button class="btn btn-outline btn-xs" onclick="App.navigate('inventory')">Check Pantry</button>
      `;
      container.appendChild(banner);
    }

    if (lowStock.length > 0) {
      const banner = document.createElement('div');
      banner.className = 'alert-banner';
      banner.innerHTML = `
        <div class="alert-banner-content">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;color:var(--gold-600);">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span><strong>${lowStock.length} ingredient(s)</strong> running low on stock.</span>
        </div>
        <button class="btn btn-outline btn-xs" onclick="App.navigate('inventory')">View Items</button>
      `;
      container.appendChild(banner);
    }
  }

  function getTodayDayName() {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  }

  function renderDashboardTodayMeals() {
    const container = document.getElementById('dashTodayMealsList');
    const label = document.getElementById('dashTodayLabel');
    if (!container) return;

    const today = getTodayDayName();
    if (label) {
      label.textContent = `Scheduled for today (${today.charAt(0).toUpperCase() + today.slice(1)})`;
    }

    container.innerHTML = '';

    MEAL_SLOTS.forEach(slot => {
      const key = `${today}_${slot}`;
      const planItem = state.planner[key];
      let mealTitle = 'No meal planned yet';
      let isEmpty = true;
      let recipeObj = null;

      if (planItem) {
        if (planItem.recipeId) {
          recipeObj = state.recipes.find(r => r.id === planItem.recipeId);
          if (recipeObj) {
            mealTitle = recipeObj.name;
            isEmpty = false;
          }
        }
        if (isEmpty && planItem.customName) {
          mealTitle = planItem.customName;
          isEmpty = false;
        }
      }

      const row = document.createElement('div');
      row.className = 'today-meal-slot';
      const thumbSource = recipeObj || (!isEmpty ? {
        name: mealTitle,
        category: slot,
        origin: 'nigerian',
        imageId: resolveRecipeImageId(mealTitle)
      } : null);
      row.innerHTML = `
        <div class="slot-left">
          ${thumbSource ? `<span class="today-thumb">${recipeImgHtml(thumbSource)}</span>` : ''}
          <div class="slot-text">
            <span class="slot-badge">${slot}</span>
            <span class="slot-name ${isEmpty ? 'empty' : ''}">${escapeHtml(mealTitle)}</span>
          </div>
        </div>
        <div class="slot-right">
          ${!isEmpty && recipeObj ? `
            <button class="btn btn-outline btn-xs" onclick="App.openRecipeDetailModal('${recipeObj.id}')">View Recipe</button>
          ` : `
            <button class="btn btn-primary btn-xs" onclick="App.openAssignPlannerModal('${today}', '${slot}')">+ Plan</button>
          `}
        </div>
      `;
      container.appendChild(row);
    });
  }

  function renderDashboardSpotlight() {
    const container = document.getElementById('dashSpotlightCard');
    if (!container) return;

    const nigerianRecipes = state.recipes.filter(r => r.origin === 'nigerian');
    if (nigerianRecipes.length === 0) {
      container.innerHTML = `<p style="padding:1.5rem;color:var(--charcoal-500);">No Nigerian recipes currently in library.</p>`;
      return;
    }

    let recipe;
    if (state.currentSpotlightRecipeId) {
      recipe = nigerianRecipes.find(r => r.id === state.currentSpotlightRecipeId);
    }
    if (!recipe) {
      const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
      recipe = nigerianRecipes[dayOfYear % nigerianRecipes.length];
      state.currentSpotlightRecipeId = recipe.id;
    }

    container.innerHTML = `
      <div class="spotlight-img-wrap" onclick="App.openRecipeDetailModal('${recipe.id}')" style="cursor:pointer;">
        ${recipeImgHtml(recipe, { eager: true })}
        <span class="spotlight-pill">🇳🇬 ${escapeHtml(recipe.region || 'Heritage')}</span>
      </div>
      <div class="spotlight-body">
        <h4 class="spotlight-title" onclick="App.openRecipeDetailModal('${recipe.id}')" style="cursor:pointer;">${escapeHtml(recipe.name)}</h4>
        <div class="spotlight-meta">
          <span>⏱️ ${recipe.prepTime + recipe.cookTime} mins total</span>
          <span>👥 ${recipe.servings} servings</span>
          <span style="text-transform:capitalize;">🍽️ ${recipe.category}</span>
        </div>
        <div class="spotlight-actions">
          <button class="btn btn-primary btn-sm" onclick="App.openRecipeDetailModal('${recipe.id}')">Cook This Dish</button>
          <button class="btn btn-gold btn-sm" onclick="App.openAssignPlannerModal(null, null, '${recipe.id}')">Add to Meal Plan</button>
        </div>
      </div>
    `;
  }

  function shuffleDashboardSpotlight() {
    const nigerianRecipes = state.recipes.filter(r => r.origin === 'nigerian');
    if (nigerianRecipes.length <= 1) return;
    let nextRecipe;
    do {
      const idx = Math.floor(Math.random() * nigerianRecipes.length);
      nextRecipe = nigerianRecipes[idx];
    } while (nextRecipe.id === state.currentSpotlightRecipeId);

    state.currentSpotlightRecipeId = nextRecipe.id;
    renderDashboardSpotlight();
    showToast('New authentic dish spotlighted!', 'accent', 2000);
  }

  function renderDashboardWeekGlance() {
    const container = document.getElementById('dashWeekGlance');
    if (!container) return;
    container.innerHTML = '';

    const today = getTodayDayName();

    DAYS_OF_WEEK.forEach(day => {
      let count = 0;
      MEAL_SLOTS.forEach(slot => {
        if (state.planner[`${day}_${slot}`]) count++;
      });

      const dayCard = document.createElement('div');
      dayCard.className = `glance-day ${day === today ? 'today' : ''}`;
      dayCard.onclick = () => {
        state.plannerActiveDay = day;
        navigate('planner');
      };

      dayCard.innerHTML = `
        <div class="glance-day-name">${day.substr(0, 3)}</div>
        <div class="glance-count">${count}</div>
        <div class="glance-count-label">meals</div>
      `;
      container.appendChild(dayCard);
    });
  }

  // ----------------------------------------------------------------------------
  // 12. RECIPES MODULE (Accurate Imagery & Elegant Cards)
  // ----------------------------------------------------------------------------
  function renderRecipes() {
    const grid = document.getElementById('recipesGrid');
    const emptyState = document.getElementById('recipesEmptyState');
    const totalHeader = document.getElementById('totalRecipeCountHeader');
    const displayedCountEl = document.getElementById('displayedRecipeCount');
    if (!grid) return;

    if (totalHeader) totalHeader.textContent = state.recipes.length;

    // Category Pills counts
    const counts = {
      all: state.recipes.length,
      breakfast: state.recipes.filter(r => r.category === 'breakfast').length,
      lunch: state.recipes.filter(r => r.category === 'lunch').length,
      dinner: state.recipes.filter(r => r.category === 'dinner').length,
      snack: state.recipes.filter(r => r.category === 'snack').length,
      nigerian: state.recipes.filter(r => r.origin === 'nigerian').length
    };

    for (const [key, val] of Object.entries(counts)) {
      const countSpan = document.getElementById(`count-${key}`);
      if (countSpan) countSpan.textContent = val;
    }

    // Filter recipes by category & search query
    let filtered = state.recipes.filter(recipe => {
      if (state.activeRecipeCategory === 'nigerian') {
        if (recipe.origin !== 'nigerian') return false;
      } else if (state.activeRecipeCategory !== 'all') {
        if (recipe.category !== state.activeRecipeCategory) return false;
      }

      if (state.recipeSearchQuery) {
        const query = state.recipeSearchQuery.toLowerCase();
        const matchesName = recipe.name.toLowerCase().includes(query);
        const matchesIngredient = recipe.ingredients.some(ing => ing.toLowerCase().includes(query));
        if (!matchesName && !matchesIngredient) return false;
      }

      return true;
    });

    if (displayedCountEl) displayedCountEl.textContent = filtered.length;

    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    grid.innerHTML = '';

    filtered.forEach(recipe => {
      const card = createRecipeCard(recipe);
      grid.appendChild(card);
    });
  }

  function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.dataset.id = recipe.id;

    const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
    const ingredientsSnippet = escapeHtml(recipe.ingredients.slice(0, 3).join(', ') + (recipe.ingredients.length > 3 ? ` +${recipe.ingredients.length - 3} more` : ''));
    const isNigerian = recipe.origin === 'nigerian';

    card.innerHTML = `
      <div class="recipe-card-img-wrap" onclick="App.openRecipeDetailModal('${recipe.id}')">
        ${recipeImgHtml(recipe)}
        <div class="recipe-top-tags">
          <span class="recipe-cuisine-tag ${isNigerian ? '' : 'tag-intl'}">${isNigerian ? '🇳🇬 ' + escapeHtml(recipe.region || 'Nigerian Heritage') : '🌍 International'}</span>
          <span class="recipe-category-tag">${escapeHtml(recipe.category)}</span>
        </div>
      </div>
      <div class="recipe-card-body">
        <h3 class="recipe-title" onclick="App.openRecipeDetailModal('${recipe.id}')">${escapeHtml(recipe.name)}</h3>
        <div class="recipe-meta-row">
          <span class="recipe-meta-item" title="Preparation & Cooking time">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${totalTime} mins
          </span>
          <span class="recipe-meta-item" title="Servings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            ${recipe.servings} servings
          </span>
        </div>
        <div class="recipe-ingredients-preview">
          <strong>Key Ingredients:</strong> ${ingredientsSnippet}
        </div>
        <div class="recipe-card-actions">
          <button class="btn btn-outline btn-xs" onclick="App.openRecipeDetailModal('${recipe.id}')">View Details</button>
          <div class="card-action-group">
            <button class="icon-btn" title="Add to Meal Planner" onclick="App.openAssignPlannerModal(null, null, '${recipe.id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
                <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
              </svg>
            </button>
            <button class="icon-btn" title="Edit Recipe" onclick="App.openEditRecipeModal('${recipe.id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="icon-btn icon-btn-danger" title="Delete Recipe" onclick="App.deleteRecipe('${recipe.id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    return card;
  }

  function openAddRecipeModal() {
    const form = document.getElementById('recipeForm');
    if (!form) return;
    form.reset();
    document.getElementById('recipeModalTitle').textContent = 'Add New Recipe';
    document.getElementById('recipeFormId').value = '';
    clearFormErrors('recipeForm');
    openModal('recipeFormModal');
  }

  function openEditRecipeModal(recipeId) {
    const recipe = state.recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    closeModal('recipeDetailModal');
    clearFormErrors('recipeForm');

    document.getElementById('recipeModalTitle').textContent = 'Edit Recipe';
    document.getElementById('recipeFormId').value = recipe.id;
    document.getElementById('recipeFormName').value = recipe.name;
    document.getElementById('recipeFormCategory').value = recipe.category;
    document.getElementById('recipeFormCuisine').value = recipe.origin;
    document.getElementById('recipeFormPrepTime').value = recipe.prepTime;
    document.getElementById('recipeFormCookTime').value = recipe.cookTime;
    document.getElementById('recipeFormServings').value = recipe.servings;
    document.getElementById('recipeFormIngredients').value = recipe.ingredients.join('\n');
    document.getElementById('recipeFormInstructions').value = recipe.instructions;
    document.getElementById('recipeFormImageUrl').value = recipe.imageUrl || '';

    openModal('recipeFormModal');
  }

  function handleRecipeFormSubmit(e) {
    e.preventDefault();
    clearFormErrors('recipeForm');

    const id = document.getElementById('recipeFormId').value;
    const name = safeString(document.getElementById('recipeFormName').value);
    const category = document.getElementById('recipeFormCategory').value;
    const origin = document.getElementById('recipeFormCuisine').value;
    const prepTime = parseInt(document.getElementById('recipeFormPrepTime').value, 10);
    const cookTime = parseInt(document.getElementById('recipeFormCookTime').value, 10);
    const servings = parseInt(document.getElementById('recipeFormServings').value, 10);
    const ingredientsRaw = document.getElementById('recipeFormIngredients').value;
    const instructions = safeString(document.getElementById('recipeFormInstructions').value);
    const imageUrl = safeString(document.getElementById('recipeFormImageUrl').value);

    let hasError = false;
    if (!name) {
      setFieldError('errRecipeName', 'Recipe name is required');
      hasError = true;
    }
    if (isNaN(prepTime) || prepTime < 1) {
      setFieldError('errRecipePrep', 'Enter valid prep time');
      hasError = true;
    }
    if (isNaN(cookTime) || cookTime < 0) {
      setFieldError('errRecipeCook', 'Enter valid cook time');
      hasError = true;
    }
    if (isNaN(servings) || servings < 1) {
      setFieldError('errRecipeServings', 'Enter at least 1 serving');
      hasError = true;
    }

    const ingredients = ingredientsRaw
      .split(/\r?\n|,/)
      .map(i => i.trim())
      .filter(i => i.length > 0);

    if (ingredients.length === 0) {
      setFieldError('errRecipeIngredients', 'Provide at least one ingredient');
      hasError = true;
    }
    if (!instructions) {
      setFieldError('errRecipeInstructions', 'Cooking instructions are required');
      hasError = true;
    }

    if (hasError) return;

    if (id) {
      const idx = state.recipes.findIndex(r => r.id === id);
      if (idx !== -1) {
        state.recipes[idx] = {
          ...state.recipes[idx],
          name,
          category,
          origin,
          prepTime,
          cookTime,
          servings,
          ingredients,
          instructions,
          imageUrl,
          // Keep the photo only while the name still describes that dish; otherwise re-resolve.
          imageId: pickRecipeImageId(name, state.recipes[idx].imageId)
        };
        saveRecipes();
        showToast(`"${name}" updated successfully!`, 'success');
      }
    } else {
      const newRecipe = {
        id: generateId('rec'),
        name,
        category,
        origin,
        region: origin === 'nigerian' ? 'Custom Nigerian' : 'International Alternative',
        prepTime,
        cookTime,
        servings,
        ingredients,
        instructions,
        imageUrl,
        imageId: resolveRecipeImageId(name),
        isCustom: true
      };
      state.recipes.unshift(newRecipe);
      saveRecipes();
      showToast(`"${name}" added to recipe library!`, 'success');
    }

    closeModal('recipeFormModal');
    refreshCurrentView();
  }

  function deleteRecipe(recipeId) {
    const recipe = state.recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    showConfirm(
      'Delete Recipe',
      `Are you sure you want to delete "${recipe.name}"? This action cannot be undone.`,
      () => {
        state.recipes = state.recipes.filter(r => r.id !== recipeId);
        saveRecipes();

        for (const [slotKey, planItem] of Object.entries(state.planner)) {
          if (planItem && planItem.recipeId === recipeId) {
            delete state.planner[slotKey];
          }
        }
        savePlanner();

        closeModal('recipeDetailModal');
        showToast(`"${recipe.name}" deleted.`, 'accent');
        refreshCurrentView();
      }
    );
  }

  function openRecipeDetailModal(recipeId) {
    const recipe = state.recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    document.getElementById('detailModalTitle').textContent = recipe.name;
    document.getElementById('detailModalCategoryBadge').textContent = recipe.category;
    document.getElementById('detailModalCuisineBadge').textContent = recipe.origin === 'nigerian' ? `🇳🇬 ${recipe.region || 'Nigerian Heritage'}` : '🌍 International';
    document.getElementById('detailModalPrep').textContent = `${recipe.prepTime} mins`;
    document.getElementById('detailModalCook').textContent = `${recipe.cookTime} mins`;
    document.getElementById('detailModalTotalTime').textContent = `${recipe.prepTime + recipe.cookTime} mins`;
    document.getElementById('detailModalServings').textContent = `${recipe.servings} people`;
    
    const imgWrap = document.getElementById('detailImageWrap');
    const imageInfo = getRecipeImage(recipe);
    const attr = imageInfo.imageId && IMAGE_ATTRIBUTIONS.recipes[imageInfo.imageId] ? IMAGE_ATTRIBUTIONS.recipes[imageInfo.imageId] : null;
    const creditHtml = attr ? `
      <div class="detail-photo-credit">
        <a href="${escapeHtml(attr.pageUrl)}" target="_blank" rel="noopener" class="photo-credit-link" title="View Wikimedia Commons file page">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:11px;height:11px;display:inline-block;vertical-align:middle;margin-right:3px;">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
          <span>Photo: ${escapeHtml(attr.artist)} &bull; ${escapeHtml(attr.license)} (Wikimedia Commons)</span>
        </a>
      </div>` : '';
    imgWrap.innerHTML = recipeImgHtml(recipe, { eager: true }) + creditHtml;

    const listEl = document.getElementById('detailIngredientsList');
    listEl.innerHTML = '';
    document.getElementById('detailIngredientsCount').textContent = `${recipe.ingredients.length} items`;

    recipe.ingredients.forEach(ing => {
      const inStock = checkIngredientInInventory(ing);
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${ing}</span>
        <span class="badge ${inStock ? 'badge-green' : 'badge-wine'}">
          ${inStock ? '✔ In Pantry' : '✕ Missing'}
        </span>
      `;
      listEl.appendChild(li);
    });

    const instructionsEl = document.getElementById('detailInstructionsText');
    instructionsEl.textContent = recipe.instructions;

    const planBtn = document.getElementById('detailPlanMealBtn');
    planBtn.onclick = () => {
      closeModal('recipeDetailModal');
      openAssignPlannerModal(null, null, recipe.id);
    };

    const addShopBtn = document.getElementById('detailAddShoppingBtn');
    addShopBtn.onclick = () => {
      addMissingIngredientsToShopping(recipe);
    };

    const editBtn = document.getElementById('detailEditBtn');
    editBtn.onclick = () => {
      openEditRecipeModal(recipe.id);
    };

    const delBtn = document.getElementById('detailDeleteBtn');
    delBtn.onclick = () => {
      deleteRecipe(recipe.id);
    };

    openModal('recipeDetailModal');
  }

  function checkIngredientInInventory(recipeIngredientStr) {
    if (!recipeIngredientStr) return false;
    const lower = recipeIngredientStr.toLowerCase();
    return state.inventory.some(inv => {
      const invLower = inv.name.toLowerCase();
      return lower.includes(invLower) || invLower.includes(lower);
    });
  }

  function addMissingIngredientsToShopping(recipe) {
    let addedCount = 0;
    recipe.ingredients.forEach(ing => {
      const inStock = checkIngredientInInventory(ing);
      if (!inStock) {
        const itemName = cleanIngredientName(ing);
        const exists = state.shopping.some(s => s.name.toLowerCase() === itemName.toLowerCase() && !s.purchased);
        if (!exists) {
          state.shopping.push({
            id: generateId('shop'),
            name: itemName,
            quantity: 1,
            unit: 'pieces',
            purchased: false,
            ingredientId: resolveIngredientId(itemName),
            fromRecipe: recipe.name
          });
          addedCount++;
        }
      }
    });

    if (addedCount > 0) {
      saveShopping();
      updateBadgesAndCounters();
      showToast(`Added ${addedCount} missing ingredient(s) to Shopping List!`, 'success');
    } else {
      showToast('You already have all ingredients in your kitchen inventory!', 'accent');
    }
  }

  function cleanIngredientName(str) {
    return str.replace(/^(\d+[\/\d\.]*\s*(cups?|tbsp|tsp|kg|g|liters?|ml|tubers?|bunche?s?|pieces?|can|tin|large|small|medium)?\s*)/i, '').trim();
  }

  // ----------------------------------------------------------------------------
  // 13. "WHAT SHOULD I EAT TODAY?" (SMART SUGGESTIONS & SMART INVENTORY MATCH)
  // ----------------------------------------------------------------------------
  function generateMealSuggestion() {
    const category = document.getElementById('sugCategorySelect').value;
    const maxTime = document.getElementById('sugTimeSelect').value;
    const cuisine = document.getElementById('sugCuisineSelect').value;
    const matchInventory = document.getElementById('sugInventoryMatchCheck').checked;

    let candidates = state.recipes.filter(r => {
      if (cuisine === 'nigerian' && r.origin !== 'nigerian') return false;
      if (category !== 'any' && r.category !== category) return false;
      if (maxTime !== 'any') {
        const total = (r.prepTime || 0) + (r.cookTime || 0);
        if (total > parseInt(maxTime, 10)) return false;
      }
      return true;
    });

    if (candidates.length === 0) {
      renderSuggestionResult(null, 'No meals matched all criteria. Try expanding your filters (e.g. Any Duration or Category).');
      return;
    }

    const scored = candidates.map(r => {
      let have = 0;
      r.ingredients.forEach(ing => {
        if (checkIngredientInInventory(ing)) have++;
      });
      const ratio = r.ingredients.length > 0 ? (have / r.ingredients.length) : 0;
      return { recipe: r, have, total: r.ingredients.length, ratio };
    });

    if (matchInventory) {
      scored.sort((a, b) => b.ratio - a.ratio);
    } else {
      scored.sort(() => 0.5 - Math.random());
    }

    const best = scored[0];
    renderSuggestionResult(best.recipe, null, best.have, best.total);
  }

  function generateRandomSuggestion() {
    document.getElementById('sugCategorySelect').value = 'any';
    document.getElementById('sugTimeSelect').value = 'any';
    document.getElementById('sugCuisineSelect').value = 'nigerian';
    document.getElementById('sugInventoryMatchCheck').checked = false;

    const nigerian = state.recipes.filter(r => r.origin === 'nigerian');
    const pool = nigerian.length > 0 ? nigerian : state.recipes;
    const randomPick = pool[Math.floor(Math.random() * pool.length)];

    let have = 0;
    randomPick.ingredients.forEach(ing => {
      if (checkIngredientInInventory(ing)) have++;
    });

    renderSuggestionResult(randomPick, null, have, randomPick.ingredients.length, true);
    showToast('🎲 Random Nigerian meal suggestion discovered!', 'accent');
  }

  function renderSuggestionResult(recipe, errorMessage, haveCount = 0, totalCount = 0, isSurprise = false) {
    const container = document.getElementById('suggestionResultWrapper');
    if (!container) return;

    if (!recipe) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔎</div>
          <h3>${errorMessage || 'No suggestion found'}</h3>
          <p>Try switching to "Any Meal Category" or "Any Duration" to see more dishes.</p>
        </div>
      `;
      return;
    }

    const totalTime = recipe.prepTime + recipe.cookTime;
    const matchPct = totalCount > 0 ? Math.round((haveCount / totalCount) * 100) : 0;

    container.innerHTML = `
      <div class="suggestion-result-card">
        <div class="suggestion-result-header">
          <span class="suggestion-lead">${isSurprise ? '🎲 Surprise Discovery' : '✨ Chef’s Recommendation'}</span>
          <span class="suggestion-score-badge">
            🥣 ${haveCount} of ${totalCount} ingredients in Kitchen (${matchPct}%)
          </span>
        </div>
        <div class="suggestion-result-body">
          <div class="sug-two-col">
            <div class="sug-image-box">
              ${recipeImgHtml(recipe, { eager: true })}
            </div>
            <div class="sug-info-col">
              <h3>${escapeHtml(recipe.name)}</h3>
              <div class="sug-stats-strip">
                <div class="sug-stat-item">
                  <strong>${recipe.prepTime} mins</strong>
                  <span>Prep Time</span>
                </div>
                <div class="sug-stat-item">
                  <strong>${recipe.cookTime} mins</strong>
                  <span>Cook Time</span>
                </div>
                <div class="sug-stat-item">
                  <strong>${totalTime} mins</strong>
                  <span>Total Time</span>
                </div>
                <div class="sug-stat-item">
                  <strong>${recipe.servings}</strong>
                  <span>Servings</span>
                </div>
              </div>
              <div class="sug-ingredients-panel">
                <h4>Ingredients (${recipe.ingredients.length})</h4>
                <div class="sug-ingredients-tags">
                  ${recipe.ingredients.map(ing => {
                    const inStock = checkIngredientInInventory(ing);
                    return `
                      <span class="sug-ing-tag ${inStock ? 'tag-in-stock' : 'tag-missing'}">
                        ${inStock ? '✔' : '✕'} ${ing}
                      </span>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
          </div>

          <div class="sug-instructions-panel">
            <h4>Cooking Instructions</h4>
            <p>${recipe.instructions}</p>
          </div>

          <div class="sug-action-bar">
            <button class="btn btn-primary" onclick="App.openAssignPlannerModal(null, null, '${recipe.id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
              </svg>
              Plan This Meal
            </button>
            <button class="btn btn-gold" onclick="App.addMissingIngredientsToShoppingById('${recipe.id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Add Missing to Shopping List
            </button>
            <button class="btn btn-outline" onclick="App.generateMealSuggestion()">
              Try Another Suggestion
            </button>
          </div>
        </div>
      </div>
    `;

    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function addMissingIngredientsToShoppingById(recipeId) {
    const recipe = state.recipes.find(r => r.id === recipeId);
    if (recipe) addMissingIngredientsToShopping(recipe);
  }

  // ----------------------------------------------------------------------------
  // 14. WEEKLY MEAL PLANNER MODULE
  // ----------------------------------------------------------------------------
  function renderPlanner() {
    const grid = document.getElementById('plannerGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const activeDay = state.plannerActiveDay;
    const daysToRender = activeDay === 'all' ? DAYS_OF_WEEK : [activeDay];

    daysToRender.forEach(day => {
      const dayCard = document.createElement('div');
      dayCard.className = `planner-day-card ${day === getTodayDayName() ? 'day-highlight' : ''}`;

      let dayMealCount = 0;
      MEAL_SLOTS.forEach(slot => {
        if (state.planner[`${day}_${slot}`]) dayMealCount++;
      });

      const dayTitle = day.charAt(0).toUpperCase() + day.slice(1);

      dayCard.innerHTML = `
        <div class="day-card-header">
          <div class="day-name-wrap">
            <h3>${dayTitle} ${day === getTodayDayName() ? '• Today' : ''}</h3>
            <span>${dayMealCount} of 4 meals scheduled</span>
          </div>
          <button class="btn btn-outline btn-xs" onclick="App.openAssignPlannerModal('${day}', null)">+ Add Meal</button>
        </div>
        <div class="day-slots-container" id="day-slots-${day}">
          <!-- Populated below -->
        </div>
      `;

      const slotsContainer = dayCard.querySelector(`#day-slots-${day}`);

      MEAL_SLOTS.forEach(slot => {
        const slotKey = `${day}_${slot}`;
        const planItem = state.planner[slotKey];
        const slotDiv = document.createElement('div');
        slotDiv.className = 'meal-slot-item';

        if (planItem) {
          let title = planItem.customName || 'Planned Meal';
          let recipe = null;
          if (planItem.recipeId) {
            recipe = state.recipes.find(r => r.id === planItem.recipeId);
            if (recipe) title = recipe.name;
          }

          const isNigerian = !recipe || recipe.origin !== 'international';
          const region = (recipe && recipe.region) ? recipe.region : (isNigerian ? 'Nigerian Heritage' : 'Continental');
          const totalTime = recipe ? ((recipe.prepTime || 0) + (recipe.cookTime || 0)) : 35;
          // Image follows the CURRENT recipe record (by id) so changing/editing the meal updates it;
          // free-text meals use an exact dish-name match, otherwise a labelled card for that exact name.
          const imageSource = recipe || {
            name: title,
            category: slot,
            origin: isNigerian ? 'nigerian' : 'international',
            region: region,
            imageId: resolveRecipeImageId(title)
          };

          slotDiv.innerHTML = `
            <div class="slot-item-header">
              <span class="slot-type-label">${slot}</span>
              <span class="badge ${isNigerian ? 'badge-wine' : 'badge-subtle'}" style="font-size:0.68rem;">
                ${isNigerian ? '🇳🇬 ' + escapeHtml(region) : '🌍 ' + escapeHtml(region)}
              </span>
            </div>
            <div class="slot-card-main">
              <div class="slot-thumb-wrap" ${recipe ? `onclick="App.openRecipeDetailModal('${recipe.id}')"` : ''} title="Click to view recipe details">
                ${recipeImgHtml(imageSource, { cls: 'slot-thumb-img' })}
              </div>
              <div class="slot-info-wrap">
                <h4 class="slot-recipe-title" ${recipe ? `onclick="App.openRecipeDetailModal('${recipe.id}')"` : ''} title="${escapeHtml(title)}">${escapeHtml(title)}</h4>
                <div class="slot-meta-strip">
                  <span class="slot-time-chip">⏱️ ${totalTime}m</span>
                  ${recipe && recipe.servings ? `<span class="slot-servings-chip">👥 ${recipe.servings}p</span>` : ''}
                </div>
              </div>
            </div>
            <div class="slot-card-footer">
              <div class="slot-actions-group">
                ${recipe ? `
                  <button class="btn btn-outline btn-xs" onclick="App.openRecipeDetailModal('${recipe.id}')" title="View recipe details">
                    View
                  </button>
                ` : ''}
                <button class="btn btn-ghost btn-xs" onclick="App.openAssignPlannerModal('${day}', '${slot}', '${planItem.recipeId || ''}')" title="Change meal">
                  Change
                </button>
                <button class="icon-btn icon-btn-danger" title="Remove from Plan" onclick="App.removePlannedMeal('${day}', '${slot}')" style="width:28px;height:28px;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          `;
        } else {
          slotDiv.innerHTML = `
            <div class="slot-item-header">
              <span class="slot-type-label">${slot}</span>
            </div>
            <button class="slot-empty-btn" onclick="App.openAssignPlannerModal('${day}', '${slot}')">
              <span class="slot-empty-icon">+</span>
              <span>Plan ${slot.charAt(0).toUpperCase() + slot.slice(1)}</span>
            </button>
          `;
        }

        slotsContainer.appendChild(slotDiv);
      });

      grid.appendChild(dayCard);
    });

    document.querySelectorAll('#plannerDayTabs .day-tab').forEach(tab => {
      if (tab.dataset.day === activeDay) tab.classList.add('active');
      else tab.classList.remove('active');
    });

    if (Object.keys(state.planner).length === 0) {
      const emptyNote = document.createElement('div');
      emptyNote.className = 'empty-state';
      emptyNote.style.gridColumn = '1 / -1';
      emptyNote.innerHTML = `
        <div class="empty-icon">📅</div>
        <h3>No meals scheduled yet for this week</h3>
        <p>Assign recipes from your collection or suggestions to build a tasty, organized culinary week.</p>
        <button class="btn btn-primary" onclick="App.openAssignPlannerModal('monday', 'lunch')">Plan Your First Meal</button>
      `;
      grid.appendChild(emptyNote);
    }
  }

  function openAssignPlannerModal(preselectedDay = null, preselectedSlot = null, preselectedRecipeId = null) {
    const daySelect = document.getElementById('planSelectDay');
    const slotSelect = document.getElementById('planSelectSlot');
    const recipeSelect = document.getElementById('planRecipeSelect');
    const customInput = document.getElementById('planCustomMealInput');

    if (preselectedDay && DAYS_OF_WEEK.includes(preselectedDay)) {
      daySelect.value = preselectedDay;
    }
    if (preselectedSlot && MEAL_SLOTS.includes(preselectedSlot)) {
      slotSelect.value = preselectedSlot;
    }
    customInput.value = '';

    recipeSelect.innerHTML = `<option value="">-- Choose From Saved Recipes --</option>`;
    
    const nigerianGroup = document.createElement('optgroup');
    nigerianGroup.label = '🇳🇬 Authentic Nigerian Dishes';
    const otherGroup = document.createElement('optgroup');
    otherGroup.label = '🌍 Other Recipes';

    state.recipes.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = `${r.name} (${r.category})`;
      if (r.origin === 'nigerian') nigerianGroup.appendChild(opt);
      else otherGroup.appendChild(opt);
    });

    recipeSelect.appendChild(nigerianGroup);
    recipeSelect.appendChild(otherGroup);

    if (preselectedRecipeId) {
      recipeSelect.value = preselectedRecipeId;
    } else {
      const key = `${daySelect.value}_${slotSelect.value}`;
      if (state.planner[key]) {
        if (state.planner[key].recipeId) recipeSelect.value = state.planner[key].recipeId;
        if (state.planner[key].customName) customInput.value = state.planner[key].customName;
      }
    }

    openModal('assignPlannerModal');
  }

  function handleAssignPlannerSubmit(e) {
    e.preventDefault();

    const day = document.getElementById('planSelectDay').value;
    const slot = document.getElementById('planSelectSlot').value;
    const recipeId = document.getElementById('planRecipeSelect').value;
    const customName = safeString(document.getElementById('planCustomMealInput').value);

    if (!recipeId && !customName) {
      showToast('Please select a saved recipe or enter a custom meal name.', 'error');
      return;
    }

    const key = `${day}_${slot}`;
    state.planner[key] = {
      recipeId: recipeId || null,
      customName: customName || ''
    };

    savePlanner();
    closeModal('assignPlannerModal');

    let displayName = customName;
    if (recipeId) {
      const r = state.recipes.find(x => x.id === recipeId);
      if (r) displayName = r.name;
    }

    showToast(`Assigned "${displayName}" to ${day.toUpperCase()} ${slot}!`, 'success');
    refreshCurrentView();
  }

  function removePlannedMeal(day, slot) {
    const key = `${day}_${slot}`;
    if (!state.planner[key]) return;

    showConfirm(
      'Remove Planned Meal',
      `Remove meal scheduled for ${day.toUpperCase()} ${slot}?`,
      () => {
        delete state.planner[key];
        savePlanner();
        showToast('Meal removed from plan.', 'accent');
        refreshCurrentView();
      }
    );
  }

  function clearEntirePlanner() {
    if (Object.keys(state.planner).length === 0) {
      showToast('Planner is already empty.', 'accent');
      return;
    }

    showConfirm(
      'Clear Entire Week',
      'Are you sure you want to clear all planned meals for the week? This will reset the entire calendar.',
      () => {
        state.planner = {};
        savePlanner();
        showToast('Weekly meal plan cleared.', 'accent');
        refreshCurrentView();
      }
    );
  }

  function exportPlanToShoppingList() {
    let totalAdded = 0;
    const plannedRecipeIds = new Set();

    for (const planItem of Object.values(state.planner)) {
      if (planItem && planItem.recipeId) {
        plannedRecipeIds.add(planItem.recipeId);
      }
    }

    if (plannedRecipeIds.size === 0) {
      showToast('No saved recipes in your meal plan to export ingredients from.', 'accent');
      return;
    }

    plannedRecipeIds.forEach(id => {
      const recipe = state.recipes.find(r => r.id === id);
      if (recipe) {
        recipe.ingredients.forEach(ing => {
          if (!checkIngredientInInventory(ing)) {
            const itemName = cleanIngredientName(ing);
            const exists = state.shopping.some(s => s.name.toLowerCase() === itemName.toLowerCase() && !s.purchased);
            if (!exists) {
              state.shopping.push({
                id: generateId('shop'),
                name: itemName,
                quantity: 1,
                unit: 'pieces',
                purchased: false,
                ingredientId: resolveIngredientId(itemName),
                fromRecipe: `Weekly Plan (${recipe.name})`
              });
              totalAdded++;
            }
          }
        });
      }
    });

    if (totalAdded > 0) {
      saveShopping();
      updateBadgesAndCounters();
      showToast(`Exported ${totalAdded} missing ingredient(s) into your Shopping List!`, 'success');
    } else {
      showToast('All ingredients for your weekly meals are already in your kitchen inventory!', 'success');
    }
  }

  // ----------------------------------------------------------------------------
  // 15. KITCHEN INVENTORY MODULE
  // ----------------------------------------------------------------------------
  function renderInventory() {
    const container = document.getElementById('inventoryContainer');
    const emptyState = document.getElementById('inventoryEmptyState');
    const totalCountHeader = document.getElementById('totalInventoryCountHeader');
    if (!container) return;

    if (totalCountHeader) totalCountHeader.textContent = state.inventory.length;

    const counts = {
      all: state.inventory.length,
      low: 0,
      expiring: 0,
      good: 0
    };

    state.inventory.forEach(item => {
      const days = daysUntil(item.expiryDate);
      const isLow = item.quantity <= (item.threshold || 2);
      if (isLow) counts.low++;
      if (days <= 3) counts.expiring++;
      if (!isLow && days > 3) counts.good++;
    });

    document.getElementById('inv-count-all').textContent = counts.all;
    document.getElementById('inv-count-low').textContent = counts.low;
    document.getElementById('inv-count-expiring').textContent = counts.expiring;
    document.getElementById('inv-count-good').textContent = counts.good;

    let filtered = state.inventory.filter(item => {
      const days = daysUntil(item.expiryDate);
      const isLow = item.quantity <= (item.threshold || 2);

      if (state.inventoryFilter === 'low' && !isLow) return false;
      if (state.inventoryFilter === 'expiring' && days > 3) return false;
      if (state.inventoryFilter === 'good' && (isLow || days <= 3)) return false;

      if (state.inventorySearchQuery) {
        const q = state.inventorySearchQuery.toLowerCase();
        if (!item.name.toLowerCase().includes(q)) return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    container.innerHTML = '';

    filtered.forEach(item => {
      const days = daysUntil(item.expiryDate);
      const isLow = item.quantity <= (item.threshold || 2);

      let statusClass = 'status-good';
      let statusBadge = '<span class="badge badge-green">In Stock</span>';

      if (days < 0) {
        statusClass = 'status-expired';
        statusBadge = '<span class="badge badge-danger">Expired</span>';
      } else if (days <= 3) {
        statusClass = 'status-expiring';
        statusBadge = `<span class="badge badge-gold">Expires in ${days} ${days === 1 ? 'day' : 'days'}</span>`;
      } else if (isLow) {
        statusClass = 'status-low';
        statusBadge = '<span class="badge badge-wine">Running Low</span>';
      }

      const card = document.createElement('div');
      card.className = `inv-card ${statusClass}`;
      card.innerHTML = `
        <div class="inv-card-head">
          <span class="ing-thumb">${ingredientImgHtml(item)}</span>
          <div class="inv-title-wrap">
            <h4 class="inv-name">${escapeHtml(item.name)}</h4>
            ${statusBadge}
          </div>
        </div>
        <div class="inv-card-details">
          <div class="inv-detail-row">
            <span>Quantity:</span>
            <strong>${item.quantity} ${item.unit}</strong>
          </div>
          <div class="inv-detail-row">
            <span>Expiry Date:</span>
            <strong style="${days <= 3 ? 'color:#be123c;' : ''}">${formatDate(item.expiryDate)}</strong>
          </div>
        </div>
        <div class="inv-card-actions">
          <button class="btn btn-outline btn-xs" title="Add directly to Shopping List" onclick="App.addInventoryItemToShopping('${item.id}')">
            + Shopping List
          </button>
          <div class="card-action-group">
            <button class="icon-btn" title="Edit Ingredient" onclick="App.openEditInventoryModal('${item.id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="icon-btn icon-btn-danger" title="Delete Ingredient" onclick="App.deleteInventoryItem('${item.id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  function openAddInventoryModal() {
    const form = document.getElementById('inventoryForm');
    if (!form) return;
    form.reset();
    document.getElementById('inventoryModalTitle').textContent = 'Add Kitchen Ingredient';
    document.getElementById('inventoryFormId').value = '';
    document.getElementById('invFormExpiry').value = getFutureDate(30);
    clearFormErrors('inventoryForm');
    openModal('inventoryFormModal');
  }

  function openEditInventoryModal(itemId) {
    const item = state.inventory.find(i => i.id === itemId);
    if (!item) return;

    clearFormErrors('inventoryForm');
    document.getElementById('inventoryModalTitle').textContent = 'Edit Kitchen Ingredient';
    document.getElementById('inventoryFormId').value = item.id;
    document.getElementById('invFormName').value = item.name;
    document.getElementById('invFormQuantity').value = item.quantity;
    document.getElementById('invFormUnit').value = item.unit;
    document.getElementById('invFormExpiry').value = item.expiryDate || '';
    document.getElementById('invFormThreshold').value = item.threshold || 2;

    openModal('inventoryFormModal');
  }

  function handleInventoryFormSubmit(e) {
    e.preventDefault();
    clearFormErrors('inventoryForm');

    const id = document.getElementById('inventoryFormId').value;
    const name = safeString(document.getElementById('invFormName').value);
    const quantity = parseFloat(document.getElementById('invFormQuantity').value);
    const unit = document.getElementById('invFormUnit').value;
    const expiryDate = document.getElementById('invFormExpiry').value;
    const threshold = parseFloat(document.getElementById('invFormThreshold').value) || 2;

    let hasError = false;
    if (!name) {
      setFieldError('errInvName', 'Ingredient name is required');
      hasError = true;
    }
    if (isNaN(quantity) || quantity <= 0) {
      setFieldError('errInvQuantity', 'Enter a valid quantity');
      hasError = true;
    }
    if (!expiryDate) {
      setFieldError('errInvExpiry', 'Expiry date is required');
      hasError = true;
    }

    if (hasError) return;

    if (id) {
      const idx = state.inventory.findIndex(i => i.id === id);
      if (idx !== -1) {
        state.inventory[idx] = {
          ...state.inventory[idx],
          name,
          quantity,
          unit,
          expiryDate,
          threshold,
          // Re-resolve from the (possibly renamed) name so the photo always matches the ingredient
          ingredientId: resolveIngredientId(name)
        };
        saveInventory();
        showToast(`Updated "${name}" in inventory!`, 'success');
      }
    } else {
      const newItem = {
        id: generateId('inv'),
        name,
        quantity,
        unit,
        expiryDate,
        threshold,
        ingredientId: resolveIngredientId(name)
      };
      state.inventory.unshift(newItem);
      saveInventory();
      showToast(`Added "${name}" to kitchen inventory!`, 'success');
    }

    closeModal('inventoryFormModal');
    refreshCurrentView();
  }

  function deleteInventoryItem(itemId) {
    const item = state.inventory.find(i => i.id === itemId);
    if (!item) return;

    showConfirm(
      'Delete Ingredient',
      `Are you sure you want to delete "${item.name}" from your kitchen inventory?`,
      () => {
        state.inventory = state.inventory.filter(i => i.id !== itemId);
        saveInventory();
        showToast(`"${item.name}" deleted from inventory.`, 'accent');
        refreshCurrentView();
      }
    );
  }

  function addInventoryItemToShopping(itemId) {
    const item = state.inventory.find(i => i.id === itemId);
    if (!item) return;

    state.shopping.push({
      id: generateId('shop'),
      name: item.name,
      quantity: 1,
      unit: item.unit,
      purchased: false,
      ingredientId: item.ingredientId !== undefined ? item.ingredientId : resolveIngredientId(item.name),
      fromRecipe: 'Replenishing Kitchen'
    });

    saveShopping();
    updateBadgesAndCounters();
    showToast(`Added "${item.name}" to shopping list!`, 'success');
  }

  // ----------------------------------------------------------------------------
  // 16. SHOPPING LIST MODULE
  // ----------------------------------------------------------------------------
  function renderShopping() {
    const container = document.getElementById('shoppingListContainer');
    const emptyState = document.getElementById('shoppingEmptyState');
    const totalHeader = document.getElementById('totalShoppingCountHeader');
    if (!container) return;

    if (totalHeader) totalHeader.textContent = state.shopping.length;

    const pending = state.shopping.filter(s => !s.purchased).length;
    const purchased = state.shopping.filter(s => s.purchased).length;

    document.getElementById('shop-count-all').textContent = state.shopping.length;
    document.getElementById('shop-count-pending').textContent = pending;
    document.getElementById('shop-count-purchased').textContent = purchased;

    let filtered = state.shopping.filter(item => {
      if (state.shoppingFilter === 'pending' && item.purchased) return false;
      if (state.shoppingFilter === 'purchased' && !item.purchased) return false;

      if (state.shoppingSearchQuery) {
        const q = state.shoppingSearchQuery.toLowerCase();
        if (!item.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    container.innerHTML = '';

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = `shopping-item-card ${item.purchased ? 'is-purchased' : ''}`;
      card.innerHTML = `
        <input type="checkbox" class="shopping-checkbox" aria-label="Mark ${escapeHtml(item.name)} as purchased" ${item.purchased ? 'checked' : ''} onchange="App.toggleShoppingPurchased('${item.id}', this.checked)">
        <span class="ing-thumb ing-thumb-sm">${ingredientImgHtml(item)}</span>
        <div class="shopping-name-wrap">
          <span class="shopping-item-name">${escapeHtml(item.name)}</span>
          ${item.fromRecipe ? `<span class="shopping-item-source">For: ${escapeHtml(item.fromRecipe)}</span>` : ''}
        </div>
        <div class="shopping-item-actions">
          <span class="shopping-qty-pill">${escapeHtml(item.quantity)} ${escapeHtml(item.unit)}</span>
          <button class="icon-btn" title="Edit item" aria-label="Edit ${escapeHtml(item.name)}" onclick="App.openEditShoppingModal('${item.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="icon-btn icon-btn-danger" title="Delete item" aria-label="Delete ${escapeHtml(item.name)}" onclick="App.deleteShoppingItem('${item.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      `;
      container.appendChild(card);
    });
  }

  function toggleShoppingPurchased(itemId, isChecked) {
    const item = state.shopping.find(s => s.id === itemId);
    if (!item) return;
    item.purchased = isChecked;
    saveShopping();
    renderShopping();
    updateBadgesAndCounters();
  }

  function openAddShoppingModal() {
    const form = document.getElementById('shoppingForm');
    if (!form) return;
    form.reset();
    document.getElementById('shoppingModalTitle').textContent = 'Add Shopping Item';
    document.getElementById('shoppingFormId').value = '';
    clearFormErrors('shoppingForm');
    openModal('shoppingFormModal');
  }

  function openEditShoppingModal(itemId) {
    const item = state.shopping.find(s => s.id === itemId);
    if (!item) return;

    clearFormErrors('shoppingForm');
    document.getElementById('shoppingModalTitle').textContent = 'Edit Shopping Item';
    document.getElementById('shoppingFormId').value = item.id;
    document.getElementById('shopFormName').value = item.name;
    document.getElementById('shopFormQuantity').value = item.quantity;
    document.getElementById('shopFormUnit').value = item.unit;

    openModal('shoppingFormModal');
  }

  function handleShoppingFormSubmit(e) {
    e.preventDefault();
    clearFormErrors('shoppingForm');

    const id = document.getElementById('shoppingFormId').value;
    const name = safeString(document.getElementById('shopFormName').value);
    const quantity = parseFloat(document.getElementById('shopFormQuantity').value);
    const unit = document.getElementById('shopFormUnit').value;

    let hasError = false;
    if (!name) {
      setFieldError('errShopName', 'Item name is required');
      hasError = true;
    }
    if (isNaN(quantity) || quantity <= 0) {
      setFieldError('errShopQuantity', 'Enter valid quantity');
      hasError = true;
    }

    if (hasError) return;

    if (id) {
      const idx = state.shopping.findIndex(s => s.id === id);
      if (idx !== -1) {
        state.shopping[idx] = {
          ...state.shopping[idx],
          name,
          quantity,
          unit,
          ingredientId: resolveIngredientId(name)
        };
        saveShopping();
        showToast(`Updated "${name}"!`, 'success');
      }
    } else {
      state.shopping.unshift({
        id: generateId('shop'),
        name,
        quantity,
        unit,
        purchased: false,
        ingredientId: resolveIngredientId(name),
        fromRecipe: 'Manual Entry'
      });
      saveShopping();
      showToast(`Added "${name}" to shopping list!`, 'success');
    }

    closeModal('shoppingFormModal');
    refreshCurrentView();
  }

  function deleteShoppingItem(itemId) {
    const item = state.shopping.find(s => s.id === itemId);
    if (!item) return;

    showConfirm(
      'Delete Shopping Item',
      `Delete "${item.name}" from your shopping list?`,
      () => {
        state.shopping = state.shopping.filter(s => s.id !== itemId);
        saveShopping();
        showToast(`"${item.name}" deleted.`, 'accent');
        refreshCurrentView();
      }
    );
  }

  function clearPurchasedShopping() {
    const purchased = state.shopping.filter(s => s.purchased);
    if (purchased.length === 0) {
      showToast('No purchased items to clear.', 'accent');
      return;
    }

    showConfirm(
      'Clear Purchased Items',
      `Remove ${purchased.length} purchased item(s) from your shopping list?`,
      () => {
        state.shopping = state.shopping.filter(s => !s.purchased);
        saveShopping();
        showToast('Cleared purchased items.', 'accent');
        refreshCurrentView();
      }
    );
  }

  function movePurchasedToInventory() {
    const purchased = state.shopping.filter(s => s.purchased);
    if (purchased.length === 0) {
      showToast('No items marked as purchased yet. Check items off as you buy them!', 'accent');
      return;
    }

    showConfirm(
      'Move Purchased to Kitchen',
      `Move ${purchased.length} purchased item(s) directly into your Kitchen Inventory? They will be given a default 30-day expiry date.`,
      () => {
        let movedCount = 0;
        purchased.forEach(shopItem => {
          const existing = state.inventory.find(i => i.name.toLowerCase() === shopItem.name.toLowerCase());
          if (existing) {
            existing.quantity = (parseFloat(existing.quantity) || 0) + parseFloat(shopItem.quantity);
          } else {
            state.inventory.unshift({
              id: generateId('inv'),
              name: shopItem.name,
              quantity: shopItem.quantity,
              unit: shopItem.unit,
              expiryDate: getFutureDate(30),
              threshold: 2,
              ingredientId: shopItem.ingredientId !== undefined ? shopItem.ingredientId : resolveIngredientId(shopItem.name)
            });
          }
          movedCount++;
        });

        state.shopping = state.shopping.filter(s => !s.purchased);

        saveInventory();
        saveShopping();
        showToast(`Successfully moved ${movedCount} item(s) to Kitchen Inventory!`, 'success');
        refreshCurrentView();
      },
      'Move Items',
      false
    );
  }

  // ----------------------------------------------------------------------------
  // 17. FORM VALIDATION HELPERS
  // ----------------------------------------------------------------------------
  function setFieldError(elementId, msg) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = msg;
  }

  function clearFormErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.querySelectorAll('.field-error').forEach(e => {
      e.textContent = '';
    });
  }

  // ----------------------------------------------------------------------------
  // 18. EVENT LISTENERS INITIALIZATION
  // ----------------------------------------------------------------------------
  function initEventListeners() {
    // 1. Sidebar Nav
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        navigate(btn.dataset.view);
      });
    });

    // 2. Mobile Nav
    document.querySelectorAll('.mobile-nav .mobile-nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        navigate(btn.dataset.view);
      });
    });

    // 3. Mobile Hamburger & Drawer Controls
    const mobileMenuBtn = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');

    function toggleSidebar(open) {
      if (!sidebar) return;
      const shouldOpen = open !== undefined ? open : !sidebar.classList.contains('open');
      if (shouldOpen) {
        sidebar.classList.add('open');
        if (sidebarBackdrop) sidebarBackdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
      } else {
        sidebar.classList.remove('open');
        if (sidebarBackdrop) sidebarBackdrop.classList.remove('open');
        document.body.style.overflow = '';
      }
    }

    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => toggleSidebar());
    }
    if (sidebarBackdrop) {
      sidebarBackdrop.addEventListener('click', () => toggleSidebar(false));
    }
    if (sidebarCloseBtn) {
      sidebarCloseBtn.addEventListener('click', () => toggleSidebar(false));
    }

    // Modal close triggers
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-backdrop');
        if (modal) modal.classList.remove('open');
      });
    });

    // Close on backdrop click (the first-visit welcome screen is intentionally not dismissable)
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (backdrop.dataset.locked === 'true') return;
        if (e.target === backdrop) {
          backdrop.classList.remove('open');
        }
      });
    });

    // ESC key closes modals (except the locked welcome screen)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.open').forEach(m => {
          if (m.dataset.locked !== 'true') m.classList.remove('open');
        });
      }
    });

    // First-visit Welcome Form
    const welcomeForm = document.getElementById('welcomeSetupForm');
    if (welcomeForm) welcomeForm.addEventListener('submit', handleWelcomeSubmit);

    // Profile Setup Form
    const profileForm = document.getElementById('userProfileForm');
    if (profileForm) profileForm.addEventListener('submit', handleProfileSubmit);

    // Cultural Greeting Cycle
    const cycleBtn = document.getElementById('cycleGreetingBtn');
    if (cycleBtn) cycleBtn.addEventListener('click', cycleGreeting);

    // Other Forms
    const recipeForm = document.getElementById('recipeForm');
    if (recipeForm) recipeForm.addEventListener('submit', handleRecipeFormSubmit);

    const inventoryForm = document.getElementById('inventoryForm');
    if (inventoryForm) inventoryForm.addEventListener('submit', handleInventoryFormSubmit);

    const shoppingForm = document.getElementById('shoppingForm');
    if (shoppingForm) shoppingForm.addEventListener('submit', handleShoppingFormSubmit);

    const assignPlannerForm = document.getElementById('assignPlannerForm');
    if (assignPlannerForm) assignPlannerForm.addEventListener('submit', handleAssignPlannerSubmit);

    // Dashboard spotlight shuffle
    const shuffleBtn = document.getElementById('refreshSpotlightBtn');
    if (shuffleBtn) shuffleBtn.addEventListener('click', shuffleDashboardSpotlight);

    // Recipe Search & Filters
    const recipeSearch = document.getElementById('recipeSearchInput');
    const clearRecipeSearch = document.getElementById('clearRecipeSearch');
    if (recipeSearch) {
      recipeSearch.addEventListener('input', (e) => {
        state.recipeSearchQuery = e.target.value.trim();
        if (clearRecipeSearch) clearRecipeSearch.style.display = state.recipeSearchQuery ? 'flex' : 'none';
        renderRecipes();
      });
    }
    if (clearRecipeSearch) {
      clearRecipeSearch.addEventListener('click', () => {
        recipeSearch.value = '';
        state.recipeSearchQuery = '';
        clearRecipeSearch.style.display = 'none';
        renderRecipes();
      });
    }

    document.querySelectorAll('#recipeCategoryFilters .filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#recipeCategoryFilters .filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.activeRecipeCategory = pill.dataset.category;
        renderRecipes();
      });
    });

    const openAddRecipeBtn = document.getElementById('openAddRecipeModalBtn');
    if (openAddRecipeBtn) openAddRecipeBtn.addEventListener('click', openAddRecipeModal);
    const emptyAddRecipeBtn = document.getElementById('emptyAddRecipeBtn');
    if (emptyAddRecipeBtn) emptyAddRecipeBtn.addEventListener('click', openAddRecipeModal);

    // Suggestions ("What Should I Eat Today?")
    const getSugBtn = document.getElementById('getSuggestionBtn');
    if (getSugBtn) getSugBtn.addEventListener('click', generateMealSuggestion);
    const surpriseBtn = document.getElementById('randomSurpriseBtn');
    if (surpriseBtn) surpriseBtn.addEventListener('click', generateRandomSuggestion);

    // Planner Days Tabs & Actions
    document.querySelectorAll('#plannerDayTabs .day-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        state.plannerActiveDay = tab.dataset.day;
        renderPlanner();
      });
    });

    const clearPlanBtn = document.getElementById('clearPlannerBtn');
    if (clearPlanBtn) clearPlanBtn.addEventListener('click', clearEntirePlanner);

    const exportPlanBtn = document.getElementById('addAllPlanToShoppingBtn');
    if (exportPlanBtn) exportPlanBtn.addEventListener('click', exportPlanToShoppingList);

    // Inventory Search & Filters
    const invSearch = document.getElementById('inventorySearchInput');
    const clearInvSearch = document.getElementById('clearInventorySearch');
    if (invSearch) {
      invSearch.addEventListener('input', (e) => {
        state.inventorySearchQuery = e.target.value.trim();
        if (clearInvSearch) clearInvSearch.style.display = state.inventorySearchQuery ? 'flex' : 'none';
        renderInventory();
      });
    }
    if (clearInvSearch) {
      clearInvSearch.addEventListener('click', () => {
        invSearch.value = '';
        state.inventorySearchQuery = '';
        clearInvSearch.style.display = 'none';
        renderInventory();
      });
    }

    document.querySelectorAll('#inventoryStatusFilters .filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#inventoryStatusFilters .filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.inventoryFilter = pill.dataset.status;
        renderInventory();
      });
    });

    const openAddInvBtn = document.getElementById('openAddInventoryModalBtn');
    if (openAddInvBtn) openAddInvBtn.addEventListener('click', openAddInventoryModal);
    const emptyAddInvBtn = document.getElementById('emptyAddInventoryBtn');
    if (emptyAddInvBtn) emptyAddInvBtn.addEventListener('click', openAddInventoryModal);

    // Shopping Search & Filters
    const shopSearch = document.getElementById('shoppingSearchInput');
    const clearShopSearch = document.getElementById('clearShoppingSearch');
    if (shopSearch) {
      shopSearch.addEventListener('input', (e) => {
        state.shoppingSearchQuery = e.target.value.trim();
        if (clearShopSearch) clearShopSearch.style.display = state.shoppingSearchQuery ? 'flex' : 'none';
        renderShopping();
      });
    }
    if (clearShopSearch) {
      clearShopSearch.addEventListener('click', () => {
        shopSearch.value = '';
        state.shoppingSearchQuery = '';
        clearShopSearch.style.display = 'none';
        renderShopping();
      });
    }

    document.querySelectorAll('#shoppingFilters .filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#shoppingFilters .filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.shoppingFilter = pill.dataset.filter;
        renderShopping();
      });
    });

    const openAddShopBtn = document.getElementById('openAddShoppingModalBtn');
    if (openAddShopBtn) openAddShopBtn.addEventListener('click', openAddShoppingModal);
    const emptyAddShopBtn = document.getElementById('emptyAddShoppingBtn');
    if (emptyAddShopBtn) emptyAddShopBtn.addEventListener('click', openAddShoppingModal);

    const transferBtn = document.getElementById('transferPurchasedBtn');
    if (transferBtn) transferBtn.addEventListener('click', movePurchasedToInventory);

    const clearPurchasedBtn = document.getElementById('clearPurchasedShoppingBtn');
    if (clearPurchasedBtn) clearPurchasedBtn.addEventListener('click', clearPurchasedShopping);

    // Credits Modal Filter
    const creditsSearchInput = document.getElementById('creditsFilterInput');
    if (creditsSearchInput) {
      creditsSearchInput.addEventListener('input', (e) => {
        filterImageCredits(e.target.value);
      });
    }
  }

  // ----------------------------------------------------------------------------
  // IMAGE CREDITS & ATTRIBUTION MODAL
  // ----------------------------------------------------------------------------
  let activeCreditsTab = 'recipes';
  let creditsFilterQuery = '';

  function openImageCreditsModal() {
    activeCreditsTab = 'recipes';
    creditsFilterQuery = '';
    const modal = document.getElementById('imageCreditsModal');
    if (!modal) return;
    const filterInput = document.getElementById('creditsFilterInput');
    if (filterInput) filterInput.value = '';
    updateCreditsTabUI();
    renderImageCreditsList();
    openModal(modal);
  }

  function switchCreditsTab(tab) {
    activeCreditsTab = tab;
    creditsFilterQuery = '';
    const filterInput = document.getElementById('creditsFilterInput');
    if (filterInput) filterInput.value = '';
    updateCreditsTabUI();
    renderImageCreditsList();
  }

  function updateCreditsTabUI() {
    document.querySelectorAll('#imageCreditsModal .credits-tab-btn').forEach(btn => {
      if (btn.dataset.creditsTab === activeCreditsTab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function filterImageCredits(query) {
    creditsFilterQuery = (query || '').toLowerCase().trim();
    renderImageCreditsList();
  }

  function renderImageCreditsList() {
    const container = document.getElementById('creditsListContainer');
    if (!container) return;
    container.innerHTML = '';

    const isRecipes = activeCreditsTab === 'recipes';
    const dict = isRecipes ? IMAGE_ATTRIBUTIONS.recipes : IMAGE_ATTRIBUTIONS.ingredients;
    const items = Object.entries(dict);

    const filtered = items.filter(([id, info]) => {
      if (!creditsFilterQuery) return true;
      const haystack = `${info.name} ${info.artist} ${info.license} ${id}`.toLowerCase();
      return haystack.includes(creditsFilterQuery);
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-credits-state" style="text-align:center;padding:2rem;color:var(--text-muted);">
          <p>No matching photographic sources found.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(([id, info]) => {
      const card = document.createElement('div');
      card.className = 'credit-item-card';

      const imgUrl = isRecipes
        ? ((RECIPE_IMAGE_FILES[id] ? IMAGE_PATHS.recipes + RECIPE_IMAGE_FILES[id] : '') || RECIPE_IMAGE_URLS[id])
        : (INGREDIENT_IMAGE_URLS[id] || '');

      card.innerHTML = `
        <div class="credit-thumb-wrap">
          <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(info.name)}" loading="lazy" decoding="async">
        </div>
        <div class="credit-info-wrap">
          <div class="credit-header-row">
            <h4 class="credit-item-title">${escapeHtml(info.name)}</h4>
            <span class="credit-license-badge">${escapeHtml(info.license)}</span>
          </div>
          <p class="credit-author-line">
            <span>Photographer / Contributor:</span> <strong>${escapeHtml(info.artist)}</strong>
          </p>
          <div class="credit-footer-row">
            <a href="${escapeHtml(info.pageUrl)}" target="_blank" rel="noopener" class="credit-source-link">
              <span>View file page on Wikimedia Commons</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;margin-left:4px;display:inline-block;vertical-align:middle;">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // ----------------------------------------------------------------------------
  // 19. INITIALIZATION BOOTSTRAP
  // ----------------------------------------------------------------------------
  function init() {
    // One delegated listener covers every food image (error events do not bubble, so capture)
    document.addEventListener('error', (e) => {
      const el = e.target;
      if (el && el.tagName === 'IMG' && el.classList.contains('food-img')) handleFoodImageError(el);
    }, true);

    loadData();
    initEventListeners();
    updateUserInterfaceIdentity();
    navigate('dashboard');
    showWelcomeSetupIfNeeded();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    navigate,
    openProfileModal,
    saveUserProfile,
    cycleGreeting,
    openAddRecipeModal,
    openEditRecipeModal,
    openRecipeDetailModal,
    deleteRecipe,
    generateMealSuggestion,
    generateRandomSuggestion,
    addMissingIngredientsToShoppingById,
    openAssignPlannerModal,
    removePlannedMeal,
    clearEntirePlanner,
    exportPlanToShoppingList,
    openAddInventoryModal,
    openEditInventoryModal,
    deleteInventoryItem,
    addInventoryItemToShopping,
    openAddShoppingModal,
    openEditShoppingModal,
    deleteShoppingItem,
    toggleShoppingPurchased,
    movePurchasedToInventory,
    clearPurchasedShopping,
    handleImageError,
    handleFoodImageError,
    resolveIngredientId,
    resolveRecipeImageId,
    getRecipeImage,
    getIngredientImage,
    generateBespokeMealCard,
    openImageCreditsModal,
    switchCreditsTab,
    filterImageCredits,
    RECIPE_IMAGE_URLS,
    INGREDIENT_IMAGE_URLS,
    IMAGE_ATTRIBUTIONS,
    toast: showToast,
    confirm: showConfirm
  };

})();

// Guarantee global availability for inline HTML onclick handlers and extensions
if (typeof window !== 'undefined') {
  window.App = App;
}

