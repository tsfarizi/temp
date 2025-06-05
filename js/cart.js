// PocketBase cart logic

window.addToCart = async function(productId) {
  const token = localStorage.getItem('pocketbase_token');
  const userId = localStorage.getItem('pocketbase_user_id');

  if (!token || !userId) {
    showInfoNotification("Please log in to add items to your cart.");
    if (typeof window.showLoginForm === 'function') {
         window.showLoginForm();
    }
    return;
  }

  try {
    const fetchUserResponse = await fetch(`${POCKETBASE_URL}/api/collections/users/records/${userId}?fields=cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!fetchUserResponse.ok) {
        console.error(`Error fetching user cart: ${fetchUserResponse.status} ${fetchUserResponse.statusText}`);
        showErrorNotification(`Error fetching your cart details. Status: ${fetchUserResponse.status}`);
        return;
    }

    const userData = await fetchUserResponse.json();
    let currentCartIds = userData.cart || [];

    if (currentCartIds.includes(productId)) {
        showInfoNotification("Product already in cart.");
        return;
    }

    currentCartIds.push(productId);

    const updateUserResponse = await fetch(`${POCKETBASE_URL}/api/collections/users/records/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ cart: currentCartIds })
    });

    if (!updateUserResponse.ok) {
      const errorData = await updateUserResponse.json();
      console.error(`Error updating user cart: ${updateUserResponse.status} ${updateUserResponse.statusText}`, errorData);
      showErrorNotification(`Error updating your cart. Status: ${updateUserResponse.status}`);
      return;
    }

    showSuccessNotification("Product added to cart!");

    if (typeof window.updateCartLink === 'function') {
      window.updateCartLink();
    }

  } catch (error) {
    console.error(`Error in addToCart for product ID "${productId}":`, error);
    showErrorNotification(`An unexpected error occurred while adding the product to your cart.`);
  }
};

window.getCartItemCount = async function() {
  const token = localStorage.getItem('pocketbase_token');
  const userId = localStorage.getItem('pocketbase_user_id');

  if (!token || !userId) {
    // console.log("User not logged in, cart count is 0."); // Less noisy
    return 0;
  }

  try {
    const response = await fetch(`${POCKETBASE_URL}/api/collections/users/records/${userId}?fields=cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        console.error(`Error fetching cart count: ${response.status} ${response.statusText}`);
        return 0;
    }
    const userData = await response.json();
    const currentCartIds = userData.cart || [];
    return currentCartIds.length;
  } catch (error) {
    console.error('Error in getCartItemCount:', error);
    return 0;
  }
};

window.removeFromCart = async function(productId) {
  const token = localStorage.getItem('pocketbase_token');
  const userId = localStorage.getItem('pocketbase_user_id');

  if (!token || !userId) {
    showInfoNotification("Please log in to modify your cart.");
    // Optionally call window.showLoginForm() if it exists and makes sense here
    return;
  }

  try {
    const fetchUserResponse = await fetch(`${POCKETBASE_URL}/api/collections/users/records/${userId}?fields=cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!fetchUserResponse.ok) {
        console.error(`Error fetching user cart for removal: ${fetchUserResponse.status} ${fetchUserResponse.statusText}`);
        showErrorNotification(`Error fetching your cart details. Status: ${fetchUserResponse.status}`);
        return;
    }

    const userData = await fetchUserResponse.json();
    let currentCartIds = userData.cart || [];

    const initialLength = currentCartIds.length;
    currentCartIds = currentCartIds.filter(id => id !== productId);

    if (currentCartIds.length === initialLength) {
        console.warn(`Product ID "${productId}" not found in user's cart for removal.`);
        // alert("Product not found in cart."); // Could be noisy if UI is already updated
        // Still proceed to update cart link and display, in case of desync.
    }

    const updateUserResponse = await fetch(`${POCKETBASE_URL}/api/collections/users/records/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ cart: currentCartIds })
    });

    if (!updateUserResponse.ok) {
      const errorData = await updateUserResponse.json();
      console.error(`Error updating user cart after removal: ${updateUserResponse.status} ${updateUserResponse.statusText}`, errorData);
      showErrorNotification(`Error updating your cart. Status: ${updateUserResponse.status}`);
      return;
    }

    if (currentCartIds.length < initialLength) {
        showSuccessNotification("Product removed from cart.");
    }

    if (typeof window.updateCartLink === 'function') {
      window.updateCartLink();
    }
    if (typeof window.displayCart === 'function') { // For cart-page.js to update its display
      window.displayCart();
    }

  } catch (error) {
    console.error(`Error in removeFromCart for product ID "${productId}":`, error);
    showErrorNotification(`An unexpected error occurred while removing the product from your cart.`);
  }
};

window.getCartContents = async function() {
  const token = localStorage.getItem('pocketbase_token');
  const userId = localStorage.getItem('pocketbase_user_id');

  if (!token || !userId) {
    showInfoNotification("Please log in to view your cart contents.");
    // Optionally call window.showLoginForm()
    return [];
  }

  try {
    const fetchUserResponse = await fetch(`${POCKETBASE_URL}/api/collections/users/records/${userId}?fields=cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!fetchUserResponse.ok) {
        console.error(`Error fetching user cart for contents: ${fetchUserResponse.status} ${fetchUserResponse.statusText}`);
        showErrorNotification(`Error fetching your cart details. Status: ${fetchUserResponse.status}`);
        return [];
    }

    const userData = await fetchUserResponse.json();
    const productIds = userData.cart || [];

    if (productIds.length === 0) {
      return [];
    }

    // Construct filter string: (id='id1' || id='id2' || ...)
    const filter = productIds.map(id => `id='${id}'`).join(' || ');

    const productsResponse = await fetch(`${POCKETBASE_URL}/api/collections/products/records?filter=(${filter})`, {
        headers: { 'Authorization': `Bearer ${token}` } // Assuming products might be protected or for consistency
    });

    if (!productsResponse.ok) {
        console.error(`Error fetching product details: ${productsResponse.status} ${productsResponse.statusText}`);
        showErrorNotification('Error fetching product details for your cart.');
        return [];
    }

    const productsData = await productsResponse.json();
    return productsData.items || [];

  } catch (error) {
    console.error('Error in getCartContents:', error);
    showErrorNotification('An unexpected error occurred while fetching cart contents.');
    return [];
  }
};

window.handlePayment = async function() {
  const token = localStorage.getItem('pocketbase_token');
  const userId = localStorage.getItem('pocketbase_user_id');

  if (!token || !userId) {
    showInfoNotification("Please log in to proceed with payment.");
    // Optionally call window.showLoginForm()
    return;
  }

  try {
    const updateUserResponse = await fetch(`${POCKETBASE_URL}/api/collections/users/records/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ cart: [] }) // Clear the cart
    });

    if (!updateUserResponse.ok) {
      const errorData = await updateUserResponse.json();
      console.error(`Error clearing user cart during payment: ${updateUserResponse.status} ${updateUserResponse.statusText}`, errorData);
      showErrorNotification(`Error clearing cart. Status: ${updateUserResponse.status}`);
      return;
    }

    showSuccessNotification("Cart cleared successfully. Proceeding to address details.");

    if (typeof window.updateCartLink === 'function') {
      window.updateCartLink();
    }
    if (typeof window.displayCart === 'function') { // For cart-page.js to update its display
      window.displayCart();
    }

  } catch (error) {
    console.error('Error in handlePayment:', error);
    showErrorNotification('An unexpected error occurred during the payment process.');
  }
};

// Note: senderAddress logic has been removed as it was tied to local storage.
// This will need to be re-evaluated if sender address needs to be stored in PocketBase or handled differently.
// cart-page.js will need significant rework to use getCartContents and display product details.
// The new window.displayCart() function will be crucial for cart-page.js to call after modifications.
// global-nav.js's updateCartLink will use the updated getCartItemCount.
