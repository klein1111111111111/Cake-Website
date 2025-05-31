// --- FIREBASE AUTH CONNECTION: DO NOT CHANGE HTML/CSS/OTHER JS ---
// 1. Add your Firebase project config below
// 2. Place this file after your other scripts, e.g. just before </body> in your HTML
// 3. No HTML, CSS or other JS changes needed

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBWSqKybfAXCBN7OnVZ1ZB8aSLq5EIHNz8",
  authDomain: "cake-shop-website-41ff4.firebaseapp.com",
  projectId: "cake-shop-website-41ff4",
  storageBucket: "cake-shop-website-41ff4.firebasestorage.app",
  messagingSenderId: "585132960880",
  appId: "1:585132960880:web:16504b3e34704c3c77d8b5",
  measurementId: "G-ZLJBX6CGZG"
};

// --- INIT FIREBASE ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- LOGIN FORM ---
document.querySelector('.profile-login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = this.email.value;
  const password = this.password.value;
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      // Success: close menu, show message or redirect as needed
      if (typeof toggleProfileMenu === "function") toggleProfileMenu();
      alert('Login successful!');
    })
    .catch(error => {
      alert('Login failed: ' + error.message);
    });
});

// --- REGISTER FORM ---
document.querySelector('.register-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = this.querySelector('input[type="email"]').value;
  const password = this.querySelector('input[type="password"]').value;
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      if (typeof closeRegisterModal === "function") closeRegisterModal();
      alert('Registration successful! You can now log in.');
      if (typeof openLoginFromRegister === "function") openLoginFromRegister();
    })
    .catch(error => {
      alert('Registration failed: ' + error.message);
    });
});

// --- RESET PASSWORD FORM ---
document.querySelector('.reset-password-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = this.querySelector('input[type="email"]').value;
  sendPasswordResetEmail(auth, email)
    .then(() => {
      if (typeof closeResetPasswordMenu === "function") closeResetPasswordMenu();
      alert('Password reset email sent! Please check your inbox.');
    })
    .catch(error => {
      alert('Error sending reset email: ' + error.message);
    });
});

// --- Animate cakes in/out on scroll and when opening page, with extra flair. ---
function animateCakesOnScroll() {
    const cakes = document.querySelectorAll('.cake-img');
    cakes.forEach((img, i) => {
        const rect = img.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        if (rect.top < windowHeight * 0.85 && rect.bottom > windowHeight * 0.15) {
            if (!img.classList.contains('in-view')) {
                img.classList.add('in-view');
                img.classList.remove('out-view');
            }
        } else {
            if (!img.classList.contains('out-view')) {
                img.classList.remove('in-view');
                img.classList.add('out-view');
            }
        }
    });
}

// Initial entry animation after DOM loaded
window.addEventListener('DOMContentLoaded', () => {
    animateCakesOnScroll();
    window.addEventListener('scroll', animateCakesOnScroll);
});

// --- Search Bar ---
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('mySearchBar');
  const input = document.getElementById('searchInput');

  if (!form || !input) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent form submission
    const query = input.value.trim().toLowerCase();

    if (query === "home") {
      window.location.href = "index.html";
    } else if (query === "about us" || query === "about") {
      window.location.href = "about.html";
    } else if (query === "contact us" || query === "contact") {
      window.location.href = "contact_us.html";
    } else {
      alert("No page found for: " + query);
    }
  });
});

// --- Review Slider Logic ---
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.review-card');
    const dots = document.querySelectorAll('.slider-dot');
    let current = 0;

    function showReview(idx) {
        cards.forEach((c, i) => {
            c.classList.toggle('active', i === idx);
        });
        dots.forEach((d, i) => {
            d.classList.toggle('active', i === idx);
        });
        current = idx;
    }

    // Next and Prev
    document.getElementById('nextReview').onclick = function() {
        let next = (current + 1) % cards.length;
        showReview(next);
    };
    document.getElementById('prevReview').onclick = function() {
        let prev = (current - 1 + cards.length) % cards.length;
        showReview(prev);
    };

    // Dots
    dots.forEach((dot, idx) => {
        dot.onclick = function() { showReview(idx); }
    });

    // Touch events for mobile
    let startX = null;
    document.getElementById('reviewSlider').addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
    });
    document.getElementById('reviewSlider').addEventListener('touchend', function(e) {
        if (startX !== null) {
            let endX = e.changedTouches[0].clientX;
            if (endX < startX - 30) document.getElementById('nextReview').click();
            else if (endX > startX + 30) document.getElementById('prevReview').click();
            startX = null;
        }
    });
});















            