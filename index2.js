// ============================================
//GAME LIST 
// ============================================
const gameList = [
    {id:1, title:"Cyberpunk 2077", price:59.99, category:"RPG", image:"https://cdn1.epicgames.com/offer/77f2b98e2cef40c8a7437518bf420e47/EGS_Cyberpunk2077PhantomLiberty_CDPROJEKTRED_DLC_S1_2560x1440-c62f1eb1498aaea2fc109b7aa50279a3?resize=1&w=480&h=270&quality=medium", description:"Plongez dans l'avenir sombre de Night City"},
    {id:2, title:"Elden Ring", price:49.99, category:"Action", image:"https://external-game-cover-image-cf.store.on.epicgames.com/119133?resize=1&w=360&h=480&quality=medium", description:"Explorez l'Entre-terre"},
    {id:3, title:"Modern Warfare III", price:69.99, category:"FPS", image:"https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/store/games/mw3/overview/Store_GamesPDP_Hero01.png?imwidth=1920", description:"Le combat contre la menace ultime"},
    {id:4, title:"The Witcher 3", price:29.99, category:"RPG", image:"https://cdn1.epicgames.com/offer/14ee004dadc142faaaece5a6270fb628/EGS_TheWitcher3WildHuntCompleteEdition_CDPROJEKTRED_S2_1200x1600-53a8fb2c0201cd8aea410f2a049aba3f?resize=1&w=360&h=480&quality=medium", description:"Incarnez Geralt de Riv"},
    {id:5, title:"FIFA 25", price:79.99, category:"Sport", image:"https://external-game-cover-image-cf.store.on.epicgames.com/314499?resize=1&w=360&h=480&quality=medium", description:"Vivez l'expérience de football"},
    {id:6, title:"Starfield", price:55.00, category:"RPG", image:"https://external-game-cover-image-cf.store.on.epicgames.com/96437?resize=1&w=360&h=480&quality=medium", description:"Explorez les étoiles"}
];

const STORAGE_KEY = "Steam4games";
const gameCategories = ["All", "Action", "RPG", "FPS"];

// ============================================
//INITIAL STATE FOR APP
// ============================================
let activeCategory = "All";
let searchValue = "";
let shoppingCart = []; 

// ============================================
// ============================================
const homeEl = document.getElementById("homePage");
const cartEl = document.getElementById("cartPage");

const grid = document.getElementById("gamesGrid");
const cartBox = document.getElementById("cartItems");

const categoryBox = document.getElementById("categoryFilters");
const searchBox = document.getElementById("searchInput");

const countDesktop = document.getElementById("cartCount");
const countMobile = document.getElementById("mobileCartCount");

const itemsCountEl = document.getElementById("summaryItems");
const subtotalEl = document.getElementById("summarySubtotal");
const totalEl = document.getElementById("summaryTotal");

const orderBtn = document.getElementById("checkoutBtn");
const toastBox = document.getElementById("toast");

let toastTimeoutRef; // used to clear old timeouts

// ============================================
//SMALL FCTS HELPERS
// ============================================

//money formatter
function formatPrice(val) {
    return "$" + val.toFixed(2);
}
function showToast(msg) {
    if (!toastBox) return;

    toastBox.textContent = msg;
    toastBox.classList.remove("opacity-0", "translate-y-2");
    toastBox.classList.add("opacity-100", "translate-y-0");

    clearTimeout(toastTimeoutRef);

    toastTimeoutRef = setTimeout(() => {
        toastBox.classList.remove("opacity-100", "translate-y-0");
        toastBox.classList.add("opacity-0", "translate-y-2");
    }, 1500);
}

// register in LoSt cart 
function persistCart() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(shoppingCart));
    } catch (err) {
        console.warn("Saving cart failed...", err);
    }
}

function normalizeQty(q) {
    let parsed = parseInt(q, 10);
    if (isNaN(parsed)) parsed = 1;
    return Math.max(1, parsed);
}

// load cart from storage
function restoreCart() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return;
        shoppingCart = parsed.map(item => {
            const found = gameList.find(g => g.id === Number(item.id));
            if (!found) return null;

            return {
                ...found,
                quantity: normalizeQty(item.quantity)
            };
        }).filter(Boolean);

        persistCart();
    } catch (err) {
        console.warn("Cart load failed", err);
        shoppingCart = [];
    }
}

// ============================================
//FILTER LOGIC
// ============================================

function getFilteredGames() {
    return gameList.filter(g => {
        const matchCategory = (activeCategory === "All" || g.category === activeCategory);
        const matchSearch = g.title.toLowerCase().includes(searchValue.toLowerCase());
        return matchCategory && matchSearch;
    });
}



function renderCategories() {
    categoryBox.innerHTML = gameCategories.map(cat => {
        const isActive = cat === activeCategory;
        return `
            <button class="category-btn ${isActive ? "active-cat" : ""}" data-category="${cat}">
                ${cat}
            </button>
        `;
    }).join("");
}

function renderGames() {
    const list = getFilteredGames();

    if (!list.length) {
        grid.innerHTML = `<p>No games found..</p>`;
        return;
    }

    grid.innerHTML = list.map(g => `
        <div class="game-card">
            <img src="${g.image}" alt="${g.title}" />
            <h3>${g.title}</h3>
            <p>${g.category}</p>
            <span>${g.price}</span> <!-- forgot formatting here earlier -->
            <button class="add-btn" data-id="${g.id}">Add</button>
        </div>
    `).join("");
}


function addItemToCart(id) {
    const existing = shoppingCart.find(x => x.id === id);

    if (existing) {
        existing.quantity += 1;
        showToast(existing.title + " qty: " + existing.quantity);
    } else {
        const game = gameList.find(g => g.id === id);
        if (!game) return;

        shoppingCart.push({
            ...game,
            quantity: 1
        });

        showToast(game.title + " added");
    }

    renderCart();
    updateCounters();
    persistCart();
}
function updateQty(id, delta) {
    const item = shoppingCart.find(i => i.id === id);
    if (!item) return;

    if (item.quantity === 1 && delta < 0) {
        showToast("Can't go below 1");
        return;
    }

    item.quantity += delta;

    renderCart();
    updateCounters();
    persistCart();
}

function deleteItem(id) {
    shoppingCart = shoppingCart.filter(i => i.id !== id);

    renderCart();
    updateCounters();
    persistCart();
}

function checkout() {
    if (!shoppingCart.length) {
        showToast("Cart already empty...");
        return;
    }

    // resetCart
    shoppingCart = [];

    renderCart();
    updateCounters();
    persistCart();

    showToast("Order done ✔");
}

// ============================================
// CART render
// ============================================

function updateCounters() {
    let total = 0;
    for (let i = 0; i < shoppingCart.length; i++) {
        total += shoppingCart[i].quantity;
    }

    countDesktop.textContent = total;
    countMobile.textContent = total;

    countDesktop.classList.toggle("hidden", total === 0);
    countMobile.classList.toggle("hidden", total === 0);
}

function renderCart() {
    if (!shoppingCart.length) {
        cartBox.innerHTML = "<p>Cart is empty</p>";
    } else {
        cartBox.innerHTML = shoppingCart.map(item => `
            <div>
                <strong>${item.title}</strong>
                <span>${item.quantity}</span>
                <button class="qty-btn" data-id="${item.id}" data-delta="-1">-</button>
                <button class="qty-btn" data-id="${item.id}" data-delta="1">+</button>
                <button class="remove-btn" data-id="${item.id}">x</button>
            </div>
        `).join("");
    }

    // total
    let totalItems = 0;
    let subtotal = 0;

    shoppingCart.forEach(i => {
        totalItems += i.quantity;
        subtotal += i.price * i.quantity;
    });

    itemsCountEl.textContent = totalItems;
    subtotalEl.textContent = formatPrice(subtotal);
    totalEl.textContent = formatPrice(subtotal);
}

// ============================================
// NAVIGATION
// ============================================

function switchPage(page) {
    const isHome = page === "home";

    homeEl.classList.toggle("hidden", !isHome);
    cartEl.classList.toggle("hidden", isHome);
}

//////////////////////////////////////nav
["logoBtn","homeNavBtn","continueShoppingBtn"].forEach(id => {
    document.getElementById(id)?.addEventListener("click", () => switchPage("home"));
});

["cartNavBtn","mobileCartBtn"].forEach(id => {
    document.getElementById(id)?.addEventListener("click", () => switchPage("cart"));
});

searchBox.addEventListener("input", e => {
    searchValue = e.target.value;
    renderGames();
});

categoryBox.addEventListener("click", e => {
    const btn = e.target.closest(".category-btn");
    if (!btn) return;

    activeCategory = btn.dataset.category;
    renderCategories();
    renderGames();
});

grid.addEventListener("click", e => {
    const btn = e.target.closest(".add-btn");
    if (btn) addItemToCart(Number(btn.dataset.id));
});

cartBox.addEventListener("click", e => {
    const q = e.target.closest(".qty-btn");
    if (q) {
        updateQty(Number(q.dataset.id), Number(q.dataset.delta));
        return;
    }

    const r = e.target.closest(".remove-btn");
    if (r) deleteItem(Number(r.dataset.id));
});

orderBtn?.addEventListener("click", checkout);

//////////////////////////////////////////////////////////////////////////
renderCategories();
renderGames();
restoreCart();
renderCart();
updateCounters();