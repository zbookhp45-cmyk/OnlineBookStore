
const books = [
    {
        id: 1,
        name: "Great Dreams",
        price: 85000,
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=700&q=85"
    },
    {
        id: 2,
        name: "A New Way",
        price: 95000,
        image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=85"
    },
    {
        id: 3,
        name: "The Power of Knowledge",
        price: 75000,
        image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=700&q=85"
    },
    {
        id: 4,
        name: "A Fresh Start",
        price: 90000,
        image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=700&q=85"
    }
];

let cart = [];

const getElement = id => document.getElementById(id);

const cartOpen = getElement("cartOpen");
const cartPanel = getElement("cartPanel");
const cartOverlay = getElement("cartOverlay");
const cartClose = getElement("cartClose");
const cartItems = getElement("cartItems");
const cartCount = getElement("cartCount");
const panelCount = getElement("panelCount");
const cartTotal = getElement("cartTotal");

const checkoutButton = getElement("checkoutButton");
const checkoutModal = getElement("checkoutModal");
const modalClose = getElement("modalClose");
const checkoutForm = getElement("checkoutForm");

const toast = getElement("toast");
const menuButton = getElement("menuButton");
const navbar = getElement("navbar");

let toastTimer;

function formatPrice(price) {
    return new Intl.NumberFormat("en-US").format(price) + " UZS";
}

function showToast(message) {
    if (!toast) return;

    toast.querySelector("span").textContent = message;
    toast.classList.add("active");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("active");
    }, 2500);
}

function addToCart(id) {
    const book = books.find(book => book.id === id);

    if (!book) return;

    const existingBook = cart.find(item => item.id === id);

    if (existingBook) {
        existingBook.quantity++;
    } else {
        cart.push({
            ...book,
            quantity: 1
        });
    }

    updateCart();
    showToast(`${book.name} added to cart!`);
}

function updateCart() {
    const totalItems = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const totalPrice = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    cartCount.textContent = totalItems;
    panelCount.textContent = `(${totalItems})`;
    cartTotal.textContent = formatPrice(totalPrice);

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fa-solid fa-bag-shopping"></i>
                <h3>Your cart is empty</h3>
                <p>Find something you would love to read.</p>
            </div>
        `;
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">

            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${formatPrice(item.price)}</p>

                <div class="quantity">
                    <button data-action="minus" data-id="${item.id}" aria-label="Decrease quantity">−</button>
                    <span>${item.quantity}</span>
                    <button data-action="plus" data-id="${item.id}" aria-label="Increase quantity">+</button>
                </div>

                <button class="remove-button" data-action="remove" data-id="${item.id}">
                    Remove
                </button>
            </div>
        </div>
    `).join("");
}

function changeQuantity(id, amount) {
    const item = cart.find(book => book.id === id);

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        cart = cart.filter(book => book.id !== id);
    }

    updateCart();
}

function removeBook(id) {
    cart = cart.filter(book => book.id !== id);
    updateCart();
    showToast("Book removed from cart.");
}

function openCart() {
    cartPanel.classList.add("active");
    cartOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeCart() {
    cartPanel.classList.remove("active");
    cartOverlay.classList.remove("active");
    document.body.style.overflow = "";
}

function openCheckout() {
    if (cart.length === 0) {
        showToast("Your cart is empty!");
        return;
    }

    checkoutModal.classList.add("active");
}

function closeCheckout() {
    checkoutModal.classList.remove("active");
}

document.querySelectorAll(".order-button").forEach(button => {
    button.addEventListener("click", () => {
        const id = Number(button.dataset.id);
        addToCart(id);
    });
});

cartOpen.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

cartItems.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    if (action === "plus") {
        changeQuantity(id, 1);
    }

    if (action === "minus") {
        changeQuantity(id, -1);
    }

    if (action === "remove") {
        removeBook(id);
    }
});

menuButton.addEventListener("click", () => {
    navbar.classList.toggle("active");

    const isOpen = navbar.classList.contains("active");

    menuButton.innerHTML = isOpen
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
});

document.querySelectorAll(".navbar a").forEach(link => {
    link.addEventListener("click", () => {
        navbar.classList.remove("active");
        menuButton.innerHTML = '<i class="fa-solid fa-bars"></i>';
    });
});

checkoutButton.addEventListener("click", openCheckout);
modalClose.addEventListener("click", closeCheckout);

checkoutModal.addEventListener("click", event => {
    if (event.target === checkoutModal) {
        closeCheckout();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeCheckout();
        closeCart();
    }
});

checkoutForm.addEventListener("submit", event => {
    event.preventDefault();

    if (cart.length === 0) {
        showToast("Your cart is empty!");
        return;
    }

    const name = getElement("customerName").value.trim();
    const phone = getElement("customerPhone").value.trim();

    if (!name || !phone) {
        showToast("Please fill in all fields.");
        return;
    }

    const orderTotal = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    alert(
        `Thank you, ${name}!\n\n` +
        `Your order total: ${formatPrice(orderTotal)}\n\n` +
        `Your order has been saved in this demo.`
    );

    cart = [];

    updateCart();
    checkoutForm.reset();
    closeCheckout();
    closeCart();

    showToast("Your order has been placed!");
});

const newsletterForm = getElement("newsletterForm");

newsletterForm.addEventListener("submit", event => {
    event.preventDefault();

    const email = newsletterForm.querySelector("input").value.trim();

    if (!email) return;

    alert("Thanks for joining us!");

    newsletterForm.reset();
});

updateCart();
