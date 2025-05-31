// --- Firebase Setup ---
const firebaseConfig = {
  apiKey: "AIzaSyBWSqKybfAXCBN7OnVZ1ZB8aSLq5EIHNz8",
  authDomain: "cake-shop-website-41ff4.firebaseapp.com",
  projectId: "cake-shop-website-41ff4",
  storageBucket: "cake-shop-website-41ff4.appspot.com", // FIXED: .appspot.com
  messagingSenderId: "585132960880",
  appId: "1:585132960880:web:16504b3e34704c3c77d8b5",
  measurementId: "G-ZLJBX6CGZG"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// --- Auth Check ---
document.getElementById('body-main').style.display = 'none';
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alert("You must be logged in to see your orders. Redirecting to home...");
    window.location.href = "home.html";
  } else {
    document.getElementById('body-main').style.display = '';
    loadOrders(user);
  }
});

// --- Load Orders for User ---
async function loadOrders(user) {
  const isAdmin = (user.email === "admin@gmail.com"); // Set your admin email here
  const ordersRef = db.collection("orders");
  let query;
  if (isAdmin) {
    query = ordersRef.orderBy("timestamp", "desc");
  } else {
    query = ordersRef.where("userId", "==", user.uid).orderBy("timestamp", "desc");
  }
  try {
    const snap = await query.get();
    if (snap.empty) {
      document.getElementById('orders-list').innerHTML = "<div class='empty-orders'>No orders found yet.</div>";
      return;
    }
    let html = '';
    snap.forEach(doc => {
      const order = doc.data();
      const date = order.timestamp?.toDate?.().toLocaleString() || '';
      html += `
        <div class="order-card" id="order-${doc.id}">
          <div class="order-header">
            <span class="order-id">Order ID: ${doc.id}</span>
            <span class="order-status">${order.status || 'pending'}</span>
          </div>
          <div class="order-date">${date}</div>
          <div class="order-payment">Payment Method: ${order.paymentMethod === "online" ? "Online/GCash" : "Cash-On-Delivery"}</div>
          <div class="order-total">Total: <b>₱${Number(order.total).toLocaleString("en-PH", {minimumFractionDigits:2})}</b></div>
          <div class="order-delivery">
            <b>Delivery:</b> ${order.deliveryInfo?.name || ''}, ${order.deliveryInfo?.phone || ''}, ${order.deliveryInfo?.address || ''}
          </div>
          <div class="order-items">
            <b>Items:</b>
            <ul>
              ${order.cart.map(item => `
                <li>
                  <img src="${item.image}" alt="${item.name}" class="order-item-img">
                  <span class="order-item-title">${item.tier ? item.tier.toUpperCase() : (item.category || '').toUpperCase()}</span> 
                  <span class="order-item-name">(${item.name})</span>
                  x${item.quantity} – ₱${Number(item.price).toLocaleString("en-PH", {minimumFractionDigits:2})}
                </li>
              `).join('')}
            </ul>
          </div>
          <button class="delivered-btn" data-id="${doc.id}"><i class="fa fa-check"></i> Cake Delivered</button>
        </div>
      `;
    });
    document.getElementById('orders-list').innerHTML = html;

    // Add event listeners for all delivered buttons
    document.querySelectorAll('.delivered-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        const id = this.getAttribute('data-id');
        if (confirm("Mark this order as delivered? This will remove it from the list.")) {
          try {
            await db.collection("orders").doc(id).delete();
            document.getElementById(`order-${id}`).remove();
            alert("Order marked as delivered and removed!");
          } catch (err) {
            alert("Failed to remove order: " + err.message);
          }
        }
      });
    });

  } catch (err) {
    document.getElementById('orders-list').innerHTML = `<div class="empty-orders">Error loading orders: ${err.message}</div>`;
  }
}