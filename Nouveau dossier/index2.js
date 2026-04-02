// ============================================
// SECTION 1: OUR GAME DATA
// ============================================
const games = [
    {id:1, title:"Cyberpunk 2077", price:59.99, category:"RPG", image:"https://cdn1.epicgames.com/offer/77f2b98e2cef40c8a7437518bf420e47/EGS_Cyberpunk2077PhantomLiberty_CDPROJEKTRED_DLC_S1_2560x1440-c62f1eb1498aaea2fc109b7aa50279a3?resize=1&w=480&h=270&quality=medium", description:"Plongez dans l'avenir sombre de Night City"},
    {id:2, title:"Elden Ring", price:49.99, category:"Action", image:"https://external-game-cover-image-cf.store.on.epicgames.com/119133?resize=1&w=360&h=480&quality=medium", description:"Explorez l'Entre-terre"},
    {id:3, title:"Modern Warfare III", price:69.99, category:"FPS", image:"https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/store/games/mw3/overview/Store_GamesPDP_Hero01.png?imwidth=1920", description:"Le combat contre la menace ultime"},
    {id:4, title:"The Witcher 3", price:29.99, category:"RPG", image:"https://cdn1.epicgames.com/offer/14ee004dadc142faaaece5a6270fb628/EGS_TheWitcher3WildHuntCompleteEdition_CDPROJEKTRED_S2_1200x1600-53a8fb2c0201cd8aea410f2a049aba3f?resize=1&w=360&h=480&quality=medium", description:"Incarnez Geralt de Riv"},
    {id:5, title:"FIFA 25", price:79.99, category:"Sport", image:"https://external-game-cover-image-cf.store.on.epicgames.com/314499?resize=1&w=360&h=480&quality=medium", description:"Vivez l'expérience de football"},
    {id:6, title:"Starfield", price:55.00, category:"RPG", image:"https://external-game-cover-image-cf.store.on.epicgames.com/96437?resize=1&w=360&h=480&quality=medium", description:"Explorez les étoiles"}
];

const CART_KEY = "Steam4games";
const categories = ["All", "Action", "RPG", "FPS"];

// ============================================
// SECTION 2: APP DATA THAT CHANGES
// ============================================
let selectedCategory = "All";
let searchText = "";
let cart = [];

// ============================================
// SECTION 3: GET HTML ELEMENTS
// ============================================
const homePage = document.getElementById("homePage");
const cartPage = document.getElementById("cartPage");
const gamesContainer = document.getElementById("gamesGrid");
const cartContainer = document.getElementById("cartItems");
const categoryContainer = document.getElementById("categoryFilters");
const searchInput = document.getElementById("searchInput");
const desktopCount = document.getElementById("cartCount");
const mobileCount = document.getElementById("mobileCartCount");
const itemsSpan = document.getElementById("summaryItems");
const subtotalSpan = document.getElementById("summarySubtotal");
const totalSpan = document.getElementById("summaryTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const toast = document.getElementById("toast");

let toastTimer;

// ============================================
// SECTION 4: HELPER FUNCTIONS
// ============================================

const formatMoney = price => `$${price.toFixed(2)}`;

const showMessage = text => {
    if(!toast) return;
    toast.textContent = text;
    toast.classList.remove("opacity-0", "translate-y-2");
    toast.classList.add("opacity-100", "translate-y-0");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("opacity-100", "translate-y-0");
        toast.classList.add("opacity-0", "translate-y-2");
    }, 1500);
};

const saveCart = () => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
    catch(e) { console.warn("Could not save cart", e); }
};

const fixQty = v => Math.max(1, parseInt(v,10) || 1);

const loadCart = () => {
    try {
        const saved = localStorage.getItem(CART_KEY);
        if(!saved) return;
        const parsed = JSON.parse(saved);
        if(!Array.isArray(parsed)) return;
        
        cart = parsed.filter(item => {
            const game = games.find(g => g.id === Number(item.id));
            return game && (item.quantity = fixQty(item.quantity));
        }).map(item => ({...games.find(g => g.id === item.id), quantity: item.quantity}));
        
        saveCart();
    } catch(e) { console.warn("Could not load cart", e); cart = []; }
};

// ============================================
// SECTION 5: FIND GAMES TO SHOW
// ============================================

const getVisibleGames = () => games.filter(game => 
    (selectedCategory === "All" || game.category === selectedCategory) &&
    game.title.toLowerCase().includes(searchText.toLowerCase())
);

// ============================================
// SECTION 6: DISPLAY FUNCTIONS
// ============================================

const showCategories = () => {
    categoryContainer.innerHTML = categories.map(cat => `
        <button type="button" class="category-btn rounded-lg border px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 ${cat === selectedCategory ? "border-blue-500 bg-blue-500/20 text-blue-300 focus:ring-blue-500/40" : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:text-white focus:ring-slate-500/40"}" data-category="${cat}">${cat}</button>
    `).join('');
};

const showGames = () => {
    const visible = getVisibleGames();
    
    if(!visible.length) {
        gamesContainer.innerHTML = `<div class="col-span-full rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-12 text-center"><p class="text-lg font-semibold text-slate-200">No games found</p><p class="mt-1 text-sm text-slate-400">Try a different keyword or category.</p></div>`;
        return;
    }
    
    gamesContainer.innerHTML = visible.map(game => `
        <article class="group overflow-hidden border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/30 hover:border-blue-500/60 hover:shadow-blue-500/10">
            <div class="relative overflow-hidden">
                <img src="${game.image}" alt="${game.title}" class="h-44 w-full object-cover transition duration-500 group-hover:scale-105" />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/15 to-transparent"></div>
            </div>
            <div class="space-y-4 p-4">
                <div class="space-y-1">
                    <p class="text-xs uppercase tracking-[0.18em] text-blue-300">${game.category}</p>
                    <h3 class="line-clamp-1 text-lg font-bold text-white">${game.title}</h3>
                </div>
                <div class="flex items-center justify-between text-sm">
                    <span class="font-semibold text-slate-100">${game.price}</span>
                </div>
                <button type="button" data-id="${game.id}" class="add-to-cart-btn w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50">
                    Add to Cart
                </button>
            </div>
        </article>
    `).join('');
};

// ============================================
// SECTION 7: CART FUNCTIONS
// ============================================

const addToCart = id => {
    const existing = cart.find(item => item.id === id);
    
    if(existing) {
        existing.quantity++;
        showMessage(`${existing.title} quantity updated (${existing.quantity})`);
    } else {
        const game = games.find(g => g.id === id);
        if(!game) return;
        cart.push({...game, quantity: 1});
        showMessage(`${game.title} added to cart`);
    }
    
    showCart();
    updateBadges();
    saveCart();
};

const changeQty = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if(!item) return;
    if(delta < 0 && item.quantity === 1) {
        showMessage("Minimum quantity is 1");
        return;
    }
    item.quantity += delta;
    showCart();
    updateBadges();
    saveCart();
};

const removeItem = id => {
    cart = cart.filter(item => item.id !== id);
    showCart();
    updateBadges();
    saveCart();
};

const placeOrder = () => {
    if(!cart.length) {
        showMessage("Your cart is already empty");
        return;
    }
    cart = [];
    showCart();
    updateBadges();
    saveCart();
    showMessage("Order placed successfully");
};

const updateBadges = () => {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    const show = total > 0;
    
    desktopCount.textContent = total;
    mobileCount.textContent = total;
    desktopCount.classList.toggle("hidden", !show);
    mobileCount.classList.toggle("hidden", !show);
};

const showCart = () => {
    if(!cart.length) {
        cartContainer.innerHTML = `<div class="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-12 text-center"><p class="text-lg font-semibold text-slate-200">Your cart is empty</p><p class="mt-1 text-sm text-slate-400">Add games from the Home page to see them here.</p></div>`;
    } else {
        cartContainer.innerHTML = cart.map(item => `
            <div class="flex items-center gap-4 border-b border-slate-700 py-4">
                <img src="${item.image}" alt="${item.title}" class="h-16 w-16 rounded object-cover">
                <div class="flex-1">
                    <h3 class="font-semibold text-white">${item.title}</h3>
                    <p class="text-sm text-slate-400">${item.price} each</p>
                </div>
                <div class="flex items-center gap-2">
                    <button type="button" class="qty-btn rounded bg-slate-700 px-2 py-1 text-white hover:bg-slate-600" data-id="${item.id}" data-delta="-1">-</button>
                    <span class="w-8 text-center text-white">${item.quantity}</span>
                    <button type="button" class="qty-btn rounded bg-slate-700 px-2 py-1 text-white hover:bg-slate-600" data-id="${item.id}" data-delta="1">+</button>
                    <button type="button" class="remove-btn ml-2 rounded bg-red-600 px-2 py-1 text-white hover:bg-red-500" data-id="${item.id}">Remove</button>
                </div>
            </div>
        `).join('');
    }
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    itemsSpan.textContent = totalItems;
    subtotalSpan.textContent = formatMoney(subtotal);
    totalSpan.textContent = formatMoney(subtotal);
};

// ============================================
// SECTION 8: PAGE NAVIGATION
// ============================================

const showPage = page => {
    const isHome = page === "home";
    homePage.classList.toggle("hidden", !isHome);
    cartPage.classList.toggle("hidden", isHome);
};

// ============================================
// SECTION 9: SETUP EVENT LISTENERS
// ============================================

["logoBtn", "homeNavBtn", "continueShoppingBtn"].forEach(id => {
    document.getElementById(id)?.addEventListener("click", () => showPage("home"));
});

["cartNavBtn", "mobileCartBtn"].forEach(id => {
    document.getElementById(id)?.addEventListener("click", () => showPage("cart"));
});

searchInput.addEventListener("input", e => {
    searchText = e.target.value;
    showGames();
});

categoryContainer.addEventListener("click", e => {
    const btn = e.target.closest(".category-btn");
    if(!btn) return;
    selectedCategory = btn.dataset.category;
    showCategories();
    showGames();
});

gamesContainer.addEventListener("click", e => {
    const btn = e.target.closest(".add-to-cart-btn");
    if(btn) addToCart(Number(btn.dataset.id));
});

cartContainer.addEventListener("click", e => {
    const qtyBtn = e.target.closest(".qty-btn");
    if(qtyBtn) {
        changeQty(Number(qtyBtn.dataset.id), Number(qtyBtn.dataset.delta));
        return;
    }
    const removeBtn = e.target.closest(".remove-btn");
    if(removeBtn) removeItem(Number(removeBtn.dataset.id));
});

checkoutBtn?.addEventListener("click", placeOrder);

// ============================================
// SECTION 10: START THE APP
// ============================================

showCategories();
showGames();
loadCart();
showCart();
updateBadges();