// --- Firebase Setup ---
const firebaseConfig = {
  apiKey: "AIzaSyBWSqKybfAXCBN7OnVZ1ZB8aSLq5EIHNz8",
  authDomain: "cake-shop-website-41ff4.firebaseapp.com",
  projectId: "cake-shop-website-41ff4",
  storageBucket: "cake-shop-website-41ff4.appspot.com",
  messagingSenderId: "585132960880",
  appId: "1:585132960880:web:16504b3e34704c3c77d8b5",
  measurementId: "G-ZLJBX6CGZG"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// --- Cart & Checkout Logic ---
const cartKey = 'cartItems';
const deliveryKey = 'deliveryInfo';
const paymentKey = 'paymentMethod';

// Check auth on page load
auth.onAuthStateChanged(function(user) {
    if (!user) {
        alert("You must be logged in to place an order. Redirecting to home...");
        window.location.href = "index.html";
    } else {
        document.getElementById('body-main').style.display = '';
    }
});

function getCart() {
    return JSON.parse(localStorage.getItem(cartKey) || "[]");
}

function getDeliveryInfo() {
    return JSON.parse(localStorage.getItem(deliveryKey)) || {
        name: "PRINCESS NICOLE N. DAVID",
        phone: "+63 0929-875-2456",
        address: "029 Zone 3, Magliman, Bacolor, Pampanga, Philippines"
    };
}

function setDeliveryInfo(info) {
    localStorage.setItem(deliveryKey, JSON.stringify(info));
}

function getPaymentMethod() {
    return localStorage.getItem(paymentKey) || "";
}

function setPaymentMethod(value) {
    localStorage.setItem(paymentKey, value);
}

function renderDeliveryInfo() {
    const div = document.getElementById('delivery-info');
    const info = getDeliveryInfo();
    div.innerHTML = `
        <div><b>${info.name}</b></div>
        <div>${info.phone}</div>
        <div>${info.address}</div>
    `;
}

function renderCheckoutCart() {
    const cart = getCart();
    const list = document.getElementById('checkout-cart-list');
    const totalDiv = document.getElementById('checkout-total');
    if (!cart.length) {
        list.innerHTML = "<div style='padding:2em;text-align:center;font-size:1.25rem;'>Your cart is empty.</div>";
        totalDiv.textContent = "₱0.00";
        return;
    }

    let total = 0;
    list.innerHTML = cart.map(item => {
        const amount = Number(item.price) * Number(item.quantity);
        total += amount;
        return `
            <div class="checkout-item">
                <img src="${item.image}" alt="${item.name}" class="checkout-item-img"/>
                <div class="checkout-item-details">
                    <div class="checkout-item-title">${item.tier ? item.tier.toUpperCase() : (item.category || '').toUpperCase()}</div>
                    <div class="checkout-item-variation">Variation: ${item.name || '-'}</div>
                    <div class="checkout-item-price">Price: ₱${Number(item.price).toLocaleString('en-PH', {minimumFractionDigits: 2})}</div>
                    <div class="checkout-item-price">Total Price: ₱${amount.toLocaleString('en-PH', {minimumFractionDigits: 2})}</div>
                </div>
                <div class="checkout-item-qty">x${item.quantity}</div>
            </div>
        `;
    }).join('');
    totalDiv.textContent = `₱${total.toLocaleString('en-PH', {minimumFractionDigits: 2})}`;
}

// Always show payment instruction for both payment methods
function setupPaymentOption() {
    const saved = getPaymentMethod();
    if (saved === "cod") document.getElementById("payment-cod").checked = true;
    if (saved === "online") document.getElementById("payment-online").checked = true;

    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', function() {
            setPaymentMethod(radio.value);
        });
    });
}

function setupEditDelivery() {
    const editBtn = document.getElementById("edit-delivery-btn");
    const modal = document.getElementById("edit-delivery-modal");
    const closeBtn = document.getElementById("close-modal-btn");
    const form = document.getElementById("delivery-form");

    editBtn.addEventListener("click", function(e){
        e.preventDefault();
        const curr = getDeliveryInfo();
        document.getElementById("delivery-name").value = curr.name;
        document.getElementById("delivery-phone").value = curr.phone;
        document.getElementById("delivery-address").value = curr.address;
        modal.style.display = "flex";
    });

    closeBtn.addEventListener("click", function(){
        modal.style.display = "none";
    });

    window.addEventListener('click', function(event){
        if (event.target === modal) modal.style.display = "none";
    });

    form.addEventListener("submit", function(e){
        e.preventDefault();
        const info = {
            name: document.getElementById("delivery-name").value.trim(),
            phone: document.getElementById("delivery-phone").value.trim(),
            address: document.getElementById("delivery-address").value.trim()
        };
        setDeliveryInfo(info);
        renderDeliveryInfo();
        modal.style.display = "none";
    });
}

// --- Place Order: Save to Firebase ---
async function saveOrderToFirebase(orderData) {
  try {
    // Don't place to Firestore if cart or delivery info is empty
    if (
      !orderData.cart ||
      !Array.isArray(orderData.cart) ||
      orderData.cart.length === 0 ||
      !orderData.deliveryInfo ||
      !orderData.deliveryInfo.name ||
      !orderData.deliveryInfo.phone ||
      !orderData.deliveryInfo.address ||
      !orderData.paymentMethod ||
      !orderData.total ||
      orderData.total <= 0
    ) {
      alert("Order not placed. Please complete all required information and make sure your cart is not empty.");
      return;
    }
    await db.collection("orders").add(orderData);
    alert("Order placed! If you chose Online Payment, please check your email for payment instructions from Confiserie.");
    // Clear cart and payment method
    localStorage.removeItem('cartItems');
    localStorage.removeItem('paymentMethod');
    window.location.reload();
  } catch (error) {
    alert("Error saving order: " + error.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
    renderCheckoutCart();
    renderDeliveryInfo();
    setupPaymentOption();
    setupEditDelivery();

    document.getElementById('place-order-btn').addEventListener('click', async () => {
        const payment = document.querySelector('input[name="payment"]:checked');
        if (!payment) {
            alert("Please select a payment method!");
            return;
        }
        if (!auth.currentUser) {
            alert("You must be logged in to place an order!");
            return;
        }
        const deliveryInfo = getDeliveryInfo();
        const cart = getCart();
        const paymentMethod = payment.value;
        const total = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
        const orderData = {
            deliveryInfo,
            cart,
            paymentMethod,
            total,
            status: paymentMethod === "online" ? "pending payment" : "pending",
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userId: auth.currentUser.uid,
            userEmail: auth.currentUser.email
        };
        await saveOrderToFirebase(orderData);
    });
});