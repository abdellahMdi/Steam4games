
// -----------------------------
// 1) this section is for data of the app and keys that I will use
// -----------------------------
const gameList = [
    {
        id: 1,
        title: "Cyberpunk 2077",
        price: 59.99,
        category: "RPG",
        image: "https://cdn1.epicgames.com/offer/77f2b98e2cef40c8a7437518bf420e47/EGS_Cyberpunk2077PhantomLiberty_CDPROJEKTRED_DLC_S1_2560x1440-c62f1eb1498aaea2fc109b7aa50279a3?resize=1&w=480&h=270&quality=medium",
        description: "Plongez dans l'avenir sombre de Night City en tant que mercenaire hors-la-loi Ã  la recherche d'un implant unique."
    },
    {
        id: 2,
        title: "Elden Ring",
        price: 49.99,
        category: "Action",
        image: "https://external-game-cover-image-cf.store.on.epicgames.com/119133?resize=1&w=360&h=480&quality=medium",
        description: "Explorez l'Entre-terre, un vaste monde fantastique et devenez le prochain Seigneur d'Elden."
    },
    {
        id: 3,
        title: "Modern Warfare III",
        price: 69.99,
        category: "FPS",
        image: "https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/store/games/mw3/overview/Store_GamesPDP_Hero01.png?imwidth=1920",
        description: "Le combat contre la menace ultime continue dans cette expÃ©rience multijoueur lÃ©gendaire."
    },
    {
        id: 4,
        title: "The Witcher 3",
        price: 29.99,
        category: "RPG",
        image: "https://cdn1.epicgames.com/offer/14ee004dadc142faaaece5a6270fb628/EGS_TheWitcher3WildHuntCompleteEdition_CDPROJEKTRED_S2_1200x1600-53a8fb2c0201cd8aea410f2a049aba3f?resize=1&w=360&h=480&quality=medium",
        description: "Incarnez Geralt de Riv et parcourez un monde dÃ©vastÃ© par la guerre Ã  la recherche de Ciri."
    },
    {
        id: 5,
        title: "FIFA 25",
        price: 79.99,
        category: "Sport",
        image: "https://external-game-cover-image-cf.store.on.epicgames.com/314499?resize=1&w=360&h=480&quality=medium",
        description: "Vivez l'expÃ©rience de football la plus rÃ©aliste avec les plus grandes compÃ©titions mondiales."
    },
    {
        id: 6,
        title: "Starfield",
        price: 55.00,
        category: "RPG",
        image: "https://external-game-cover-image-cf.store.on.epicgames.com/96437?resize=1&w=360&h=480&quality=medium",
        description: "Explorez les Ã©toiles et dÃ©couvrez le plus grand mystÃ¨re de l'humanitÃ© dans ce RPG spatial."
    }
];

// Local storage key to keep cart data between page refreshes
const CART_KEY = "Steam4games";


// Categories that I'll use to filter Data
const categoryList = ["All", "Action", "RPG", "FPS"];
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



// Draw game cards on the home page
function renderGameCards() {
    // const visibleGames = getVisibleGames();
    const visibleGames = gameList ;

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

// render category btns 
function renderCategoryButtons() {
    let html = "";

    for (let i = 0; i < categoryList.length; i += 1) {
        const category = categoryList[i];
        const isActive = category === appState.selectedCategory;

        const baseClasses = "rounded-lg border px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2";
        const activeClasses ="border-blue-500 bg-blue-500/20 text-blue-300 focus:ring-blue-500/40";
        const normalClasses ="border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:text-white focus:ring-slate-500/40";

        html += `<button type="button" class="category-btn ${baseClasses} ${
            isActive ? activeClasses : normalClasses
        }" data-category="${category}">${category}</button>`;
    }

    categoryButtonsContainer.innerHTML = html;
}




