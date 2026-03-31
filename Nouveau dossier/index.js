// -----------------------------
// 1) Game data used by the shop
// -----------------------------
const gameList = [
    {
        id: 1,
        title: "Cyberpunk 2077",
        price: 59.99,
        category: "RPG",
        // Image de ville futuriste nÃ©on
        image: "https://cdn1.epicgames.com/offer/77f2b98e2cef40c8a7437518bf420e47/EGS_Cyberpunk2077PhantomLiberty_CDPROJEKTRED_DLC_S1_2560x1440-c62f1eb1498aaea2fc109b7aa50279a3?resize=1&w=480&h=270&quality=medium",
        description: "Plongez dans l'avenir sombre de Night City en tant que mercenaire hors-la-loi Ã  la recherche d'un implant unique."
    },
    {
        id: 2,
        title: "Elden Ring",
        price: 49.99,
        category: "Action",
        // Image de chÃ¢teau/fantasy
        image: "https://external-game-cover-image-cf.store.on.epicgames.com/119133?resize=1&w=360&h=480&quality=medium",
        description: "Explorez l'Entre-terre, un vaste monde fantastique et devenez le prochain Seigneur d'Elden."
    },
    {
        id: 3,
        title: "Modern Warfare III",
        price: 69.99,
        category: "FPS",
        // Image de soldat/Ã©quipement tactique
        image: "https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/store/games/mw3/overview/Store_GamesPDP_Hero01.png?imwidth=1920",
        description: "Le combat contre la menace ultime continue dans cette expÃ©rience multijoueur lÃ©gendaire."
    },
    {
        id: 4,
        title: "The Witcher 3",
        price: 29.99,
        category: "RPG",
        // Image de forÃªt/aventure
        image: "https://cdn1.epicgames.com/offer/14ee004dadc142faaaece5a6270fb628/EGS_TheWitcher3WildHuntCompleteEdition_CDPROJEKTRED_S2_1200x1600-53a8fb2c0201cd8aea410f2a049aba3f?resize=1&w=360&h=480&quality=medium",
        description: "Incarnez Geralt de Riv et parcourez un monde dÃ©vastÃ© par la guerre Ã  la recherche de Ciri."
    },
    {
        id: 5,
        title: "FIFA 25",
        price: 79.99,
        category: "Sport",
        // Image de stade de foot
        image: "https://external-game-cover-image-cf.store.on.epicgames.com/314499?resize=1&w=360&h=480&quality=medium",
        description: "Vivez l'expÃ©rience de football la plus rÃ©aliste avec les plus grandes compÃ©titions mondiales."
    },
    {
        id: 6,
        title: "Starfield",
        price: 55.00,
        category: "RPG",
        // Image de l'espace/astronaute
        image: "https://external-game-cover-image-cf.store.on.epicgames.com/96437?resize=1&w=360&h=480&quality=medium",
        description: "Explorez les Ã©toiles et dÃ©couvrez le plus grand mystÃ¨re de l'humanitÃ© dans ce RPG spatial."
    }
];

// -----------------------------
// 2) App state (changes over time)
// -----------------------------
const appState = {
    selectedCategory: "All",
    searchText: "",
    cart: [],
};

// -----------------------------
// 3) DOM elements we use often
// -----------------------------
const homeSection = document.getElementById("homePage");
const cartSection = document.getElementById("cartPage");
const gameGrid = document.getElementById("gamesGrid");
const cartItemsContainer = document.getElementById("cartItems");
const categoryButtonsContainer = document.getElementById("categoryFilters");
const searchField = document.getElementById("searchInput");
const cartCountDesktop = document.getElementById("cartCount");
const cartCountMobile = document.getElementById("mobileCartCount");
const itemsCountText = document.getElementById("summaryItems");
const subtotalText = document.getElementById("summarySubtotal");
const totalText = document.getElementById("summaryTotal");
const checkoutButton = document.getElementById("checkoutBtn");
const toastBox = document.getElementById("toast");

let toastTimerId;

// Local storage key to keep cart data between page refreshes
const CART_KEY = "gamevault_cart_v1";

// Categories shown as filter buttons
const categoryList = ["All", "Action", "RPG", "FPS"];

// Format number as money, example: 12.5 -> $12.50
function toPriceText(numberValue) {
    return `$${numberValue.toFixed(2)}`;
}

// Show a short message in the top-right corner
function showMessage(text) {
    if (!toastBox) {
        return;
    }

    toastBox.textContent = text;
    toastBox.classList.remove("opacity-0", "translate-y-2");
    toastBox.classList.add("opacity-100", "translate-y-0");

    clearTimeout(toastTimerId);
    toastTimerId = setTimeout(() => {
        toastBox.classList.remove("opacity-100", "translate-y-0");
        toastBox.classList.add("opacity-0", "translate-y-2");
    }, 1500);
}

// Save current cart into localStorage
function saveCartToStorage() {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(appState.cart));
    } catch (error) {
        console.warn("Unable to save cart", error);
    }
}

// Make sure quantity is always a number >= 1
function normalizeQuantity(value) {
    const quantity = Number.parseInt(value, 10);

    if (!Number.isFinite(quantity) || quantity < 1) {
        return 1;
    }

    return quantity;
}

// Load cart from localStorage when page starts
function loadCartFromStorage() {
    try {
        const rawCart = localStorage.getItem(CART_KEY);

        if (!rawCart) {
            return;
        }

        const parsedCart = JSON.parse(rawCart);

        if (!Array.isArray(parsedCart)) {
            return;
        }

        const cleanedCart = [];

        for (let i = 0; i < parsedCart.length; i += 1) {
            const storedItem = parsedCart[i];
            const gameId = Number(storedItem.id);

            let foundGame = null;
            for (let j = 0; j < gameList.length; j += 1) {
                if (gameList[j].id === gameId) {
                    foundGame = gameList[j];
                    break;
                }
            }

            if (!foundGame) {
                continue;
            }

            cleanedCart.push({
                id: foundGame.id,
                title: foundGame.title,
                category: foundGame.category,
                price: foundGame.price,
                rating: foundGame.rating,
                image: foundGame.image,
                quantity: normalizeQuantity(storedItem.quantity),
            });
        }

        appState.cart = cleanedCart;
        saveCartToStorage();
    } catch (error) {
        console.warn("Unable to load cart", error);
        appState.cart = [];
    }
}

// Return games that match selected category + search text
function getVisibleGames() {
    const visibleGames = [];
    const searchLower = appState.searchText.toLowerCase();

    for (let i = 0; i < gameList.length; i += 1) {
        const game = gameList[i];

        const categoryMatches =
            appState.selectedCategory === "All" ||
            game.category === appState.selectedCategory;
        const titleMatches = game.title.toLowerCase().includes(searchLower);

        if (categoryMatches && titleMatches) {
            visibleGames.push(game);
        }
    }

    return visibleGames;
}

// Draw category filter buttons and highlight active one
function renderCategoryButtons() {
    let html = "";

    for (let i = 0; i < categoryList.length; i += 1) {
        const category = categoryList[i];
        const isActive = category === appState.selectedCategory;

        const baseClasses =
            "rounded-lg border px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2";
        const activeClasses =
            "border-blue-500 bg-blue-500/20 text-blue-300 focus:ring-blue-500/40";
        const normalClasses =
            "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:text-white focus:ring-slate-500/40";

        html += `<button type="button" class="category-btn ${baseClasses} ${
            isActive ? activeClasses : normalClasses
        }" data-category="${category}">${category}</button>`;
    }

    categoryButtonsContainer.innerHTML = html;
}

// Draw game cards on the home page
function renderGameCards() {
    const visibleGames = getVisibleGames();

    if (visibleGames.length === 0) {
        gameGrid.innerHTML = `
			<div class="col-span-full rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-12 text-center">
				<p class="text-lg font-semibold text-slate-200">No games found</p>
				<p class="mt-1 text-sm text-slate-400">Try a different keyword or category.</p>
			</div>
		`;
        return;
    }

    let html = "";

    for (let i = 0; i < visibleGames.length; i += 1) {
        const game = visibleGames[i];

        html += `
			<article class="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/30 transition duration-300 hover:-translate-y-1 hover:border-blue-500/60 hover:shadow-blue-500/10">
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
						<span class="font-semibold text-slate-100">${toPriceText(game.price)}</span>
					</div>
					<button type="button" data-id="${game.id}" class="add-to-cart-btn w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50">
						Add to Cart
					</button>
				</div>
			</article>
		`;
    }

    gameGrid.innerHTML = html;
}

// Add one game to cart, or increase quantity if already present
function addGameToCart(gameId) {
    let existingCartItem = null;

    for (let i = 0; i < appState.cart.length; i += 1) {
        if (appState.cart[i].id === gameId) {
            existingCartItem = appState.cart[i];
            break;
        }
    }

    if (existingCartItem) {
        existingCartItem.quantity += 1;
        showMessage(
            `${existingCartItem.title} quantity updated (${existingCartItem.quantity})`,
        );
    } else {
        let selectedGame = null;

        for (let i = 0; i < gameList.length; i += 1) {
            if (gameList[i].id === gameId) {
                selectedGame = gameList[i];
                break;
            }
        }

        if (!selectedGame) {
            return;
        }

        appState.cart.push({
            id: selectedGame.id,
            title: selectedGame.title,
            category: selectedGame.category,
            price: selectedGame.price,
            rating: selectedGame.rating,
            image: selectedGame.image,
            quantity: 1,
        });

        showMessage(`${selectedGame.title} added to cart`);
    }

    renderCartItems();
    updateCartBadge();
    saveCartToStorage();
}

// Change quantity for one cart item (+1 or -1)
function changeCartItemQuantity(gameId, changeValue) {
    let cartItem = null;

    for (let i = 0; i < appState.cart.length; i += 1) {
        if (appState.cart[i].id === gameId) {
            cartItem = appState.cart[i];
            break;
        }
    }

    if (!cartItem) {
        return;
    }

    if (changeValue < 0 && cartItem.quantity === 1) {
        showMessage("Minimum quantity is 1");
        return;
    }

    cartItem.quantity += changeValue;
    renderCartItems();
    updateCartBadge();
    saveCartToStorage();
}

// Remove one item from cart completely
function deleteCartItem(gameId) {
    const newCart = [];

    for (let i = 0; i < appState.cart.length; i += 1) {
        if (appState.cart[i].id !== gameId) {
            newCart.push(appState.cart[i]);
        }
    }

    appState.cart = newCart;
    renderCartItems();
    updateCartBadge();
    saveCartToStorage();
}

// Finish order: clear cart and show success message
function placeOrder() {
    if (appState.cart.length === 0) {
        showMessage("Your cart is already empty");
        return;
    }

    appState.cart = [];
    renderCartItems();
    updateCartBadge();
    saveCartToStorage();
    showMessage("Order placed successfully");
}

// Update little cart badge in desktop and mobile navbar
function updateCartBadge() {
    let totalCount = 0;

    for (let i = 0; i < appState.cart.length; i += 1) {
        totalCount += appState.cart[i].quantity;
    }

    const shouldShowBadge = totalCount > 0;

    cartCountDesktop.textContent = totalCount;
    cartCountMobile.textContent = totalCount;

    cartCountDesktop.classList.toggle("hidden", !shouldShowBadge);
    cartCountMobile.classList.toggle("hidden", !shouldShowBadge);
}

// Draw all cart rows + total values
function renderCartItems() {
    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = `
			<div class="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-12 text-center">
				<p class="text-lg font-semibold text-slate-200">Your cart is empty</p>
				<p class="mt-1 text-sm text-slate-400">Add games from the Home page to see them here.</p>
			</div>
		`;
    } else {
        let html = "";

        for (let i = 0; i < appState.cart.length; i += 1) {
            const item = appState.cart[i];

            html += `
			<article class="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/30 transition duration-300 hover:-translate-y-1 hover:border-blue-500/60 hover:shadow-blue-500/10">
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
						<span class="font-semibold text-slate-100">${toPriceText(game.price)}</span>
					</div>
					<button type="button" data-id="${game.id}" class="add-to-cart-btn w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50">
						Add to Cart
					</button>
				</div>
			</article>
		`;
        }

        cartItemsContainer.innerHTML = html;
    }

    let totalItems = 0;
    let subtotal = 0;

    for (let i = 0; i < appState.cart.length; i += 1) {
        totalItems += appState.cart[i].quantity;
        subtotal += appState.cart[i].price * appState.cart[i].quantity;
    }

    itemsCountText.textContent = totalItems;
    subtotalText.textContent = toPriceText(subtotal);
    totalText.textContent = toPriceText(subtotal);
}

// Show one page section and hide the other
function showPage(pageName) {
    const showHome = pageName === "home";
    homeSection.classList.toggle("hidden", !showHome);
    cartSection.classList.toggle("hidden", showHome);
}

// -----------------------------
// 4) Event listeners
// -----------------------------
document.getElementById("logoBtn").addEventListener("click", () => {
    showPage("home");
});

document.getElementById("homeNavBtn").addEventListener("click", () => {
    showPage("home");
});

document.getElementById("continueShoppingBtn").addEventListener("click", () => {
    showPage("home");
});

document.getElementById("cartNavBtn").addEventListener("click", () => {
    showPage("cart");
});

document.getElementById("mobileCartBtn").addEventListener("click", () => {
    showPage("cart");
});

searchField.addEventListener("input", (event) => {
    appState.searchText = event.target.value.trim();
    renderGameCards();
});

categoryButtonsContainer.addEventListener("click", (event) => {
    const clickedButton = event.target.closest(".category-btn");

    if (!clickedButton) {
        return;
    }

    appState.selectedCategory = clickedButton.dataset.category;
    renderCategoryButtons();
    renderGameCards();
});

gameGrid.addEventListener("click", (event) => {
    const addButton = event.target.closest(".add-to-cart-btn");

    if (!addButton) {
        return;
    }

    addGameToCart(Number(addButton.dataset.id));
});

cartItemsContainer.addEventListener("click", (event) => {
    const quantityButton = event.target.closest(".qty-btn");

    if (quantityButton) {
        changeCartItemQuantity(
            Number(quantityButton.dataset.qtyId),
            Number(quantityButton.dataset.delta),
        );
        return;
    }

    const removeButton = event.target.closest(".remove-btn");

    if (removeButton) {
        deleteCartItem(Number(removeButton.dataset.removeId));
    }
});

if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
        placeOrder();
    });
}

// -----------------------------
// 5) Start the app
// -----------------------------
renderCategoryButtons();
renderGameCards();
loadCartFromStorage();
renderCartItems();
updateCartBadge();
