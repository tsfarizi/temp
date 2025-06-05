document.addEventListener('DOMContentLoaded', function() {
    // --- BEGIN AUTHENTICATION CHECK ---
    const userToken = localStorage.getItem('pocketbase_token');
    const mainContent = document.querySelector('main'); // Assuming your main content area is within a <main> tag

    if (!userToken) {
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="container mt-5">
                    <div class="alert alert-warning" role="alert">
                        You need to be logged in to view your cart. Please
                        <a href="#" id="login-from-cart" class="alert-link">login</a>.
                    </div>
                </div>
            `;
            const loginLink = document.getElementById('login-from-cart');
            if (loginLink) {
                loginLink.addEventListener('click', function(event) {
                    event.preventDefault();
                    if (typeof window.showLoginForm === 'function') {
                        window.showLoginForm();
                    } else {
                        console.error('showLoginForm function is not available.');
                        showErrorNotification('Login functionality is currently unavailable.');
                    }
                });
            }
        } else {
            console.error('Main content container not found for displaying login message.');
        }
        return; // Prevent further execution of cart display logic
    }
    // --- END AUTHENTICATION CHECK ---

    const cartItemsContainer = document.getElementById('cart-items-container');
    const orderSummaryContainer = document.getElementById('order-summary-container');
    const payButton = document.getElementById('pay-button');
    const senderAddressSection = document.getElementById('sender-address');

    window.displayCart = async function() {
        console.log('window.displayCart called');
        await displayCartItems();
        await displayOrderSummary();
    };

    async function displayCartItems() {
        if (!cartItemsContainer) {
            console.error('Cart items container not found');
            return;
        }
        cartItemsContainer.innerHTML = '<p>Loading cart...</p>';

        try {
            const items = await window.getCartContents();

            if (!items) {
                cartItemsContainer.innerHTML = '<p class="text-danger">Error loading cart contents. Please try again later.</p>';
                return;
            }

            if (items.length === 0) {
                cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
                return;
            }

            cartItemsContainer.innerHTML = '';
            const ul = document.createElement('ul');
            ul.classList.add('list-group');

            items.forEach(item => {
                const li = document.createElement('li');
                li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                li.innerHTML = `
                    <div class="d-flex align-items-center">
                        <img src="${item.image_url}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
                        <div>
                            <h6 class="my-0">${item.name}</h6>
                            <small class="text-muted">Price: Rp ${item.price.toLocaleString('id-ID')}</small>
                        </div>
                    </div>
                    <button class="btn btn-danger btn-sm remove-from-cart-btn" data-product-id="${item.id}">Remove</button>
                `;
                ul.appendChild(li);
            });
            cartItemsContainer.appendChild(ul);

        } catch (error) {
            console.error('Error in displayCartItems:', error);
            cartItemsContainer.innerHTML = '<p class="text-danger">Could not display cart items.</p>';
        }
    }

    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', async function(event) {
            if (event.target.classList.contains('remove-from-cart-btn')) {
                const productId = event.target.dataset.productId;
                if (typeof window.removeFromCart === 'function') {
                    await window.removeFromCart(productId);
                } else {
                    console.error('removeFromCart function is not defined.');
                    showErrorNotification('Error: Could not remove item. Functionality missing.');
                }
            }
        });
    }

    async function displayOrderSummary() {
        if (!orderSummaryContainer) {
            console.error('Order summary container not found');
            return;
        }
        orderSummaryContainer.innerHTML = '<p>Calculating summary...</p>';

        try {
            const items = await window.getCartContents();
            if (!items) {
                 orderSummaryContainer.innerHTML = '<p class="text-danger">Could not calculate order summary.</p>';
                return;
            }

            const subtotal = items.reduce((sum, item) => sum + item.price, 0);
            const shippingCost = items.length > 0 ? 10000 : 0;
            const totalAmount = subtotal + shippingCost;

            orderSummaryContainer.innerHTML = `
                <ul class="list-group mb-3">
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Subtotal</span>
                        <strong>Rp ${subtotal.toLocaleString('id-ID')}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Shipping</span>
                        <strong>Rp ${shippingCost.toLocaleString('id-ID')}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Total</span>
                        <strong>Rp ${totalAmount.toLocaleString('id-ID')}</strong>
                    </li>
                </ul>
            `;
        } catch (error) {
            console.error('Error in displayOrderSummary:', error);
            orderSummaryContainer.innerHTML = '<p class="text-danger">Could not display order summary.</p>';
        }
    }

    function showCartView() {
        if(cartItemsContainer) cartItemsContainer.style.display = 'block';
        if(orderSummaryContainer) orderSummaryContainer.style.display = 'block';
        if(payButton) payButton.style.display = 'block';
        if(senderAddressSection) senderAddressSection.innerHTML = ''; // Clear address form/message
        senderAddressSection.style.display = 'none'; // Hide the section meant for the form initially
    }

    function showAddressFormView(currentAddress) {
        if(cartItemsContainer) cartItemsContainer.style.display = 'none';
        if(orderSummaryContainer) orderSummaryContainer.style.display = 'none';
        if(payButton) payButton.style.display = 'none';

        if(senderAddressSection) {
            senderAddressSection.style.display = 'block'; // Show the section
            senderAddressSection.innerHTML = `
                <h4>Shipping Address</h4>
                <div class="mb-3">
                    <label for="user-address-input" class="form-label">Your Address:</label>
                    <textarea id="user-address-input" class="form-control" rows="3" placeholder="Enter your shipping address">${currentAddress}</textarea>
                </div>
                <button id="save-address-btn" class="btn btn-primary mt-2">Save Address & Complete Order</button>
                <button id="back-to-cart-view-from-address" class="btn btn-secondary mt-2">Back to Cart</button>
            `;

            document.getElementById('back-to-cart-view-from-address').addEventListener('click', showCartView);

            document.getElementById('save-address-btn').addEventListener('click', async function() {
                const newAddressValue = document.getElementById('user-address-input').value.trim();
                if (!newAddressValue) {
                    showErrorNotification("Address cannot be empty.");
                    return;
                }

                const userId = localStorage.getItem('pocketbase_user_id');
                const token = localStorage.getItem('pocketbase_token');
                if (!userId || !token) {
                    showErrorNotification('Authentication error. Please log in again.');
                    return;
                }

                try {
                    const response = await fetch(`${POCKETBASE_URL}/api/collections/users/records/${userId}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ address: newAddressValue })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to save address.');
                    }

                    showSuccessNotification("Order complete! Address saved.");

                    if (typeof window.handlePayment === 'function') {
                        await window.handlePayment(); // Clears cart in PB
                    } else {
                        console.error('handlePayment function not found on window object');
                        showErrorNotification('Critical error: Payment handling function missing.');
                    }

                    // UI update after successful order
                    if(senderAddressSection) {
                        senderAddressSection.innerHTML = `
                            <div class="alert alert-success" role="alert">
                                Order placed successfully! Your address has been saved.
                            </div>
                            <button id="view-cart-after-order" class="btn btn-info">View Cart</button>
                        `;
                        document.getElementById('view-cart-after-order')?.addEventListener('click', () => {
                            showCartView();
                            window.displayCart(); // Refresh to show empty cart
                        });
                    }
                    // cartItems and orderSummary will be hidden by showAddressFormView,
                    // and displayCart (called by handlePayment) will refresh them to empty state.
                    // No need to explicitly show them here again unless desired.

                } catch (error) {
                    console.error('Error saving address or completing order:', error);
                    showErrorNotification(`Error: ${error.message}`);
                }
            });
        }
    }


    if (payButton) {
        payButton.textContent = 'Proceed to Checkout';
        payButton.addEventListener('click', async function() {
            console.log('Proceed to Checkout clicked. Fetching user address...');
            const userId = localStorage.getItem('pocketbase_user_id');
            const token = localStorage.getItem('pocketbase_token');

            if (!userId || !token) {
                showInfoNotification('Please log in to proceed.');
                if (typeof window.showLoginForm === 'function') {
                    window.showLoginForm();
                }
                return;
            }

            try {
              const response = await fetch(`${POCKETBASE_URL}/api/collections/users/records/${userId}?fields=address`, {
                  headers: { 'Authorization': `Bearer ${token}` }
              });
              if (!response.ok) {
                  let errorDetails = response.statusText;
                  try { const pbError = await response.json(); errorDetails = pbError.message || JSON.stringify(pbError.data) || errorDetails; } catch (e) {}
                  throw new Error(`Failed to fetch address. Status: ${response.status}. Details: ${errorDetails}`);
              }
              const userData = await response.json();
              const currentAddress = userData.address || '';

              showAddressFormView(currentAddress);

            } catch (error) {
              console.error('Error fetching user address:', error);
              showErrorNotification(`Could not fetch user address: ${error.message}`);
            }
        });
    }

    // Initial setup
    showCartView(); // Initially hide address section, show cart view
    displayCartItems();
    displayOrderSummary();
});
