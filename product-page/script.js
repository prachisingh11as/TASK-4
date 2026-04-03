// Extended Product Data
const products = [
    { id: 1, name: "MacBook Pro", category: "electronics", price: 1299, rating: 4.8, image: "💻", inStock: true },
    { id: 2, name: "iPhone 15", category: "electronics", price: 999, rating: 4.9, image: "📱", inStock: true },
    { id: 3, name: "Sony Headphones", category: "electronics", price: 299, rating: 4.6, image: "🎧", inStock: true },
    { id: 4, name: "Premium T-Shirt", category: "clothing", price: 49, rating: 4.3, image: "👕", inStock: true },
    { id: 5, name: "Designer Jeans", category: "clothing", price: 89, rating: 4.4, image: "👖", inStock: false },
    { id: 6, name: "Winter Jacket", category: "clothing", price: 199, rating: 4.5, image: "🧥", inStock: true },
    { id: 7, name: "JavaScript: The Good Parts", category: "books", price: 35, rating: 4.7, image: "📚", inStock: true },
    { id: 8, name: "Clean Code", category: "books", price: 45, rating: 4.8, image: "📖", inStock: true },
    { id: 9, name: "Desk Lamp", category: "home", price: 59, rating: 4.2, image: "💡", inStock: true },
    { id: 10, name: "Coffee Maker", category: "home", price: 89, rating: 4.4, image: "☕", inStock: true },
    { id: 11, name: "Yoga Mat", category: "sports", price: 29, rating: 4.3, image: "🧘", inStock: true },
    { id: 12, name: "Dumbbell Set", category: "sports", price: 79, rating: 4.5, image: "🏋️", inStock: true },
];

// State
let filteredProducts = [...products];
let currentCategory = 'all';
let currentMaxPrice = 1000;
let currentMinRating = 0;
let currentSort = 'default';
let searchQuery = '';
let cart = JSON.parse(localStorage.getItem('productCart')) || [];
let isLoading = true;

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const resultsCount = document.getElementById('resultsCount');
const priceRange = document.getElementById('priceRange');
const priceValue = document.getElementById('priceValue');
const sortBy = document.getElementById('sortBy');
const searchInput = document.getElementById('searchInput');
const cartCount = document.getElementById('cartCount');
const cartSidebar = document.getElementById('cartSidebar');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const toast = document.getElementById('toast');
const themeToggle = document.getElementById('themeToggle');

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('productCart', JSON.stringify(cart));
}

// Simulate Loading
setTimeout(() => {
    isLoading = false;
    applyFilters();
    updateCart();
}, 500);

// Apply all filters
function applyFilters() {
    if(isLoading) return;
    
    let result = [...products];
    
    // Category filter
    if(currentCategory !== 'all') {
        result = result.filter(p => p.category === currentCategory);
    }
    
    // Price filter
    result = result.filter(p => p.price <= currentMaxPrice);
    
    // Rating filter
    result = result.filter(p => p.rating >= currentMinRating);
    
    // Search filter
    if(searchQuery) {
        result = result.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    
    // Sort
    if(currentSort === 'priceLow') {
        result.sort((a, b) => a.price - b.price);
    } else if(currentSort === 'priceHigh') {
        result.sort((a, b) => b.price - a.price);
    } else if(currentSort === 'rating') {
        result.sort((a, b) => b.rating - a.rating);
    } else if(currentSort === 'name') {
        result.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    filteredProducts = result;
    renderProducts();
    updateResultsCount();
}

// Render products with animation
function renderProducts() {
    if(isLoading) return;
    
    if(filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-box-open" style="font-size: 3rem; color: var(--gray);"></i>
                <p>No products found</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">${product.image}</div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-category">${product.category}</div>
                <div class="product-price">$${product.price}</div>
                <div class="product-rating">
                    <div class="stars">${getStarRating(product.rating)}</div>
                    <span>${product.rating}</span>
                </div>
                <button class="add-to-cart" onclick="addToCart(${product.id})" ${!product.inStock ? 'disabled' : ''}>
                    ${product.inStock ? '<i class="fas fa-cart-plus"></i> Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        </div>
    `).join('');
}

// Star rating generator
function getStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    for(let i = 0; i < fullStars; i++) stars += '★';
    if(hasHalfStar) stars += '½';
    for(let i = stars.length; i < 5; i++) stars += '☆';
    return stars;
}

// Update results count
function updateResultsCount() {
    resultsCount.textContent = `Showing ${filteredProducts.length} of ${products.length} products`;
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if(existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    updateCart();
    showToast(`${product.name} added to cart!`);
}

// Update cart UI
function updateCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartCount.textContent = totalItems;
    cartTotal.textContent = totalPrice.toFixed(2);
    
    if(cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item" style="display: flex; justify-content: space-between; margin-bottom: 1rem; padding: 0.5rem; border-bottom: 1px solid var(--gray);">
                <div>
                    <strong>${item.name}</strong>
                    <div>$${item.price} x ${item.quantity}</div>
                    <div style="font-size: 0.8rem; color: var(--primary);">Subtotal: $${(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <div>
                    <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})" style="background: var(--danger); color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">-</button>
                    <span style="margin: 0 8px;">${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})" style="background: var(--success); color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">+</button>
                </div>
            </div>
        `).join('');
    }
}

// Update quantity
function updateQuantity(productId, newQuantity) {
    if(newQuantity <= 0) {
        cart = cart.filter(item => item.id !== productId);
    } else {
        const item = cart.find(item => item.id === productId);
        if(item) item.quantity = newQuantity;
    }
    saveCart();
    updateCart();
    showToast('Cart updated');
}

// Checkout function
function checkout() {
    if(cart.length === 0) {
        showToast('Your cart is empty! Add some items first.', 'error');
        return;
    }
    
    // Create checkout modal
    const modal = document.createElement('div');
    modal.className = 'checkout-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        backdrop-filter: blur(5px);
        z-index: 2000;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.3s ease;
    `;
    
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = totalAmount * 0.1;
    const shipping = totalAmount > 500 ? 0 : 25;
    const grandTotal = totalAmount + tax + shipping;
    
    modal.innerHTML = `
        <div class="checkout-container" style="
            background: white;
            border-radius: 24px;
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            animation: slideUp 0.3s ease;
        ">
            <div style="padding: 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                <h2 style="color: #1e293b;"><i class="fas fa-shopping-cart"></i> Checkout</h2>
                <button class="close-checkout" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            
            <div style="padding: 1.5rem;">
                <h3 style="margin-bottom: 1rem;">Order Summary</h3>
                ${cart.map(item => `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; padding: 0.5rem 0; border-bottom: 1px solid #e2e8f0;">
                        <span>${item.name} x ${item.quantity}</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
                
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid #e2e8f0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>Subtotal:</span>
                        <span>$${totalAmount.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>Tax (10%):</span>
                        <span>$${tax.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>Shipping:</span>
                        <span>$${shipping.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 2px solid #e2e8f0; font-weight: bold; font-size: 1.2rem;">
                        <span>Total:</span>
                        <span style="color: #6366f1;">$${grandTotal.toFixed(2)}</span>
                    </div>
                </div>
                
                <h3 style="margin: 1.5rem 0 1rem;">Payment Details</h3>
                <form id="paymentForm">
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem;">Card Number</label>
                        <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" required style="width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px;">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem;">Expiry Date</label>
                            <input type="text" id="expiryDate" placeholder="MM/YY" required style="width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem;">CVV</label>
                            <input type="password" id="cvv" placeholder="123" required style="width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px;">
                        </div>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem;">Full Name</label>
                        <input type="text" id="cardName" placeholder="John Doe" required style="width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px;">
                    </div>
                    
                    <button type="submit" style="
                        width: 100%;
                        padding: 1rem;
                        background: linear-gradient(135deg, #6366f1, #4f46e5);
                        color: white;
                        border: none;
                        border-radius: 12px;
                        font-size: 1rem;
                        font-weight: 500;
                        cursor: pointer;
                        margin-top: 1rem;
                    ">
                        <i class="fas fa-lock"></i> Place Order
                    </button>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal
    modal.querySelector('.close-checkout').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if(e.target === modal) {
            modal.remove();
        }
    });
    
    // Handle payment submission
    document.getElementById('paymentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const cardNumber = document.getElementById('cardNumber').value;
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;
        const cardName = document.getElementById('cardName').value;
        
        // Basic validation
        if(!cardNumber || !expiryDate || !cvv || !cardName) {
            showToast('Please fill all payment details', 'error');
            return;
        }
        
        if(cardNumber.replace(/\s/g, '').length < 16) {
            showToast('Please enter a valid card number', 'error');
            return;
        }
        
        // Simulate payment processing
        const submitBtn = modal.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        setTimeout(() => {
            // Success!
            modal.remove();
            
            // Clear cart
            cart = [];
            saveCart();
            updateCart();
            
            // Show success message
            showOrderSuccess(grandTotal);
            
            // Close cart sidebar if open
            cartSidebar.classList.remove('open');
        }, 2000);
    });
}

// Show order success message
function showOrderSuccess(total) {
    const successModal = document.createElement('div');
    successModal.className = 'success-modal';
    successModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        backdrop-filter: blur(5px);
        z-index: 2001;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    successModal.innerHTML = `
        <div style="
            background: white;
            border-radius: 24px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            padding: 2rem;
            animation: scaleUp 0.3s ease;
        ">
            <div style="
                width: 80px;
                height: 80px;
                background: #10b981;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1rem;
            ">
                <i class="fas fa-check" style="font-size: 2.5rem; color: white;"></i>
            </div>
            <h2 style="color: #1e293b; margin-bottom: 0.5rem;">Order Successful!</h2>
            <p style="color: #64748b; margin-bottom: 1rem;">Thank you for your purchase</p>
            <div style="
                background: #f8fafc;
                padding: 1rem;
                border-radius: 12px;
                margin: 1rem 0;
            ">
                <p style="color: #1e293b;">Total Amount Paid</p>
                <p style="font-size: 1.5rem; font-weight: bold; color: #6366f1;">$${total.toFixed(2)}</p>
            </div>
            <p style="color: #64748b; font-size: 0.85rem; margin-bottom: 1.5rem;">
                A confirmation email has been sent to your email address.
            </p>
            <button onclick="this.closest('.success-modal').remove()" style="
                padding: 0.75rem 1.5rem;
                background: #6366f1;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
            ">
                Continue Shopping
            </button>
        </div>
    `;
    
    document.body.appendChild(successModal);
    
    successModal.addEventListener('click', (e) => {
        if(e.target === successModal) {
            successModal.remove();
        }
    });
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = toast.querySelector('i');
    
    toastMessage.textContent = message;
    
    if(type === 'error') {
        toast.style.background = '#ef4444';
        toastIcon.className = 'fas fa-exclamation-circle';
    } else {
        toast.style.background = '#10b981';
        toastIcon.className = 'fas fa-check-circle';
    }
    
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Event Listeners
priceRange.addEventListener('input', (e) => {
    currentMaxPrice = parseInt(e.target.value);
    priceValue.textContent = currentMaxPrice;
    applyFilters();
});

sortBy.addEventListener('change', (e) => {
    currentSort = e.target.value;
    applyFilters();
});

searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    applyFilters();
});

// Category filters
document.querySelectorAll('.filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.cat;
        applyFilters();
    });
});

// Rating filters
document.querySelectorAll('.rating-chip').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.rating-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMinRating = parseFloat(btn.dataset.rating);
        applyFilters();
    });
});

// Reset filters
document.getElementById('resetFilters').addEventListener('click', () => {
    currentCategory = 'all';
    currentMaxPrice = 1000;
    currentMinRating = 0;
    searchQuery = '';
    currentSort = 'default';
    
    priceRange.value = 1000;
    priceValue.textContent = '1000';
    searchInput.value = '';
    sortBy.value = 'default';
    
    document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
    document.querySelector('.filter-chip[data-cat="all"]').classList.add('active');
    
    document.querySelectorAll('.rating-chip').forEach(b => b.classList.remove('active'));
    document.querySelector('.rating-chip[data-rating="0"]').classList.add('active');
    
    applyFilters();
    showToast('All filters reset');
});

// Cart sidebar
document.getElementById('cartIcon').addEventListener('click', () => {
    cartSidebar.classList.add('open');
});

document.getElementById('closeCart').addEventListener('click', () => {
    cartSidebar.classList.remove('open');
});

// CHECKOUT BUTTON - THIS IS THE FIX!
document.querySelector('.checkout-btn').addEventListener('click', () => {
    checkout();
});

// Dark mode
if(themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        const icon = themeToggle.querySelector('i');
        if(document.body.classList.contains('dark')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            localStorage.setItem('darkMode', 'disabled');
        }
    });
    
    // Load dark mode preference
    if(localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark');
        themeToggle.querySelector('i').classList.remove('fa-moon');
        themeToggle.querySelector('i').classList.add('fa-sun');
    }
}

// Make functions global for onclick handlers
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.checkout = checkout;

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes scaleUp {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .checkout-btn {
        cursor: pointer !important;
    }
    
    .cart-item button:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(styleSheet);

// Initialize
applyFilters();