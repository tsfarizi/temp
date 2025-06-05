// This function needs to be global to be called from cart.js
window.updateCartLink = async function() {
    // Check for user token
    const userToken = localStorage.getItem('pocketbase_token');

    let cartLink = document.getElementById('cart-nav-link');
    let cartListItem = cartLink?.closest('.nav-item'); // Get the parent li for removal

    if (!userToken) {
        // If token doesn't exist and link/badge exists, remove them
        if (cartListItem) {
            cartListItem.remove();
        }
        return; // Stop further execution
    }

    // Ensure cart.js is loaded and getCartItemCount is available
    if (typeof window.getCartItemCount !== 'function') {
        console.error("getCartItemCount is not available. Ensure cart.js is loaded before global-nav.js.");
        return;
    }

    const itemCount = await window.getCartItemCount();

    // Attempt to find an existing cart link/badge to update
    // let cartLink = document.getElementById('cart-nav-link'); // Already defined above
    let cartItemCountBadge = document.getElementById('cart-item-count-badge');

    // Find the navbar ul (assuming a common structure or ID)
    // Let's assume the <ul class="navbar-nav ms-auto"> is the target
    const navbarUl = document.querySelector('.navbar-nav.ms-auto');
    if (!navbarUl) {
        console.error("Navbar UL element not found.");
        return;
    }

    if (!cartLink) {
        // If the link doesn't exist, create it (this will only happen if userToken exists)
        cartListItem = document.createElement('li'); // cartListItem was defined above, re-assign here
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
    window.updateCartLink();
});
