// This function needs to be global to be called from cart.js
function updateCartLink() {
    // Ensure cart.js is loaded and getCartItemCount is available
    if (typeof getCartItemCount !== 'function') {
        console.error("getCartItemCount is not available. Ensure cart.js is loaded before global-nav.js.");
        return;
    }

    const itemCount = getCartItemCount();

    // Attempt to find an existing cart link/badge to update
    let cartLink = document.getElementById('cart-nav-link');
    let cartItemCountBadge = document.getElementById('cart-item-count-badge');

    // Find the navbar ul (assuming a common structure or ID)
    // Let's assume the <ul class="navbar-nav ms-auto"> is the target
    const navbarUl = document.querySelector('.navbar-nav.ms-auto');
    if (!navbarUl) {
        console.error("Navbar UL element not found.");
        return;
    }

    if (!cartLink) {
        // If the link doesn't exist, create it
        const cartListItem = document.createElement('li');
        cartListItem.classList.add('nav-item');

        cartLink = document.createElement('a');
        cartLink.classList.add('nav-link');
        cartLink.href = 'cart.html';
        cartLink.id = 'cart-nav-link'; // Assign an ID for future updates

        cartLink.textContent = 'Cart '; // Add a space for the badge

        cartItemCountBadge = document.createElement('span');
        cartItemCountBadge.classList.add('badge', 'bg-primary'); // Bootstrap badge classes
        cartItemCountBadge.id = 'cart-item-count-badge';

        cartLink.appendChild(cartItemCountBadge);
        cartListItem.appendChild(cartLink);

        // Insert before the 'Register' link, or as the last item if 'Register' isn't found
        const registerLinkItem = document.getElementById('register-link')?.closest('.nav-item');
        if (registerLinkItem) {
            navbarUl.insertBefore(cartListItem, registerLinkItem);
        } else {
            // Fallback: if 'Register' link is not present, try to insert before 'Login'
            const loginLinkItem = document.getElementById('login-link')?.closest('.nav-item');
            if (loginLinkItem) {
                navbarUl.insertBefore(cartListItem, loginLinkItem);
            } else {
                navbarUl.appendChild(cartListItem); // Fallback: append to end if neither are found
            }
        }
    }

    // Update badge text
    if (cartItemCountBadge) {
        cartItemCountBadge.textContent = itemCount;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initial update on page load
    // Ensure cart data is loaded before this first update.
    // cart.js calls loadCartFromLocalStorage() at its end.
    // So, by the time DOMContentLoaded fires for global-nav.js (if loaded after cart.js),
    // cart data should be ready.
    if (typeof loadCartFromLocalStorage === 'function' && typeof cart !== 'undefined' && typeof getCartItemCount === 'function') {
         // loadCartFromLocalStorage(); // Already called by cart.js itself
         updateCartLink();
    } else {
        // Fallback: if cart.js hasn't loaded its stuff yet, try a small delay.
        // This is a bit of a hack; script load order is key.
        // Also, check if getCartItemCount is defined before calling updateCartLink.
        console.warn("Cart data or getCartItemCount might not be ready yet for initial cart link update. Retrying shortly.");
        setTimeout(function() {
            if (typeof getCartItemCount === 'function') {
                updateCartLink();
            } else {
                console.error("getCartItemCount still not available after delay. Cart link may not be accurate.");
            }
        }, 100);
    }
});
