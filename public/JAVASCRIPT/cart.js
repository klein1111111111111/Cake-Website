const cartKey = 'cartItems';

function getCart() {
    return JSON.parse(localStorage.getItem(cartKey) || '[]');
}
function setCart(items) {
    localStorage.setItem(cartKey, JSON.stringify(items));
}
function removeCartItem(index) {
    let cart = getCart();
    cart.splice(index, 1);
    setCart(cart);
    renderCart();
}
function updateCartQty(index, qty) {
    let cart = getCart();
    cart[index].quantity = qty;
    setCart(cart);
    renderCart();
}

function renderCart() {
    const cart = getCart();
    const container = document.getElementById('cart-container');
    if (!cart.length) {
        container.innerHTML = "<div style='padding:2em;text-align:center;font-size:1.4rem;'>Your cart is empty.</div>";
        return;
    }

    container.innerHTML = cart.map((item, idx) => `
        <div class="cart-row">
            <div class="cart-image-container">
                <img src="${item.image}" alt="${item.name}" class="cart-product-img"/>
            </div>
            <div class="cart-details-block">
                <div class="cart-details-row">
                    <div class="cart-title">${item.tier ? item.tier.toUpperCase() : (item.category || '').toUpperCase()}</div>
                    <div>
                        <span class="cart-label">RETAIL PRICE</span>
                        <span class="cart-value">₱${Number(item.price).toLocaleString('en-PH', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div>
                        <span class="cart-label">TOTAL AMOUNT</span>
                        <span class="cart-value">₱${(Number(item.price) * Number(item.quantity)).toLocaleString('en-PH', {minimumFractionDigits: 2})}</span>
                    </div>
                </div>
                <div class="cart-details-row" style="margin-bottom:0;">
                    <div class="cart-qty-controls">
                        <button class="cart-qty-btn" data-idx="${idx}" data-action="dec">-</button>
                        <span class="cart-qty">${item.quantity}</span>
                        <button class="cart-qty-btn" data-idx="${idx}" data-action="inc">+</button>
                    </div>
                    <button class="checkout-btn" style="margin-left:38px;">CHECKOUT</button>
                    <button class="cart-delete" title="Remove from cart" data-idx="${idx}"><i class="fa fa-trash"></i></button>
                </div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.cart-qty-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(btn.getAttribute('data-idx'));
            const action = btn.getAttribute('data-action');
            let cart = getCart();
            let qty = Number(cart[idx].quantity);
            if (action === 'dec' && qty > 1) qty--;
            if (action === 'inc') qty++;
            updateCartQty(idx, qty);
        });
    });
    document.querySelectorAll('.cart-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(btn.getAttribute('data-idx'));
            removeCartItem(idx);
        });
    });
    document.querySelectorAll('.checkout-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            window.location.href = 'checkout.html';
        });
    });
}

document.addEventListener('DOMContentLoaded', renderCart);