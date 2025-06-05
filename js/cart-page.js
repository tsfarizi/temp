document.addEventListener('DOMContentLoaded', function() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const senderNameInput = document.getElementById('sender-name');
    const senderAddress1Input = document.getElementById('sender-address1');
    const senderAddress2Input = document.getElementById('sender-address2');
    const senderPhoneInput = document.getElementById('sender-phone');
    const orderSummaryContainer = document.getElementById('order-summary-container');
    const payButton = document.getElementById('pay-button');

    // Make sure cart and other functions from cart.js are loaded and available
    if (typeof loadCartFromLocalStorage !== 'function' || typeof cart === 'undefined' || typeof saveCartToLocalStorage !== 'function' || typeof senderAddress === 'undefined') {
        console.error('Cart functions, cart array, or senderAddress not available. Ensure cart.js is loaded correctly before cart-page.js.');
        if(cartItemsContainer) cartItemsContainer.innerHTML = '<p class="text-danger">Error loading cart functionality. Please try again later.</p>';
        // Also disable form fields and summary if critical parts are missing
        if(senderNameInput) senderNameInput.disabled = true;
        if(senderAddress1Input) senderAddress1Input.disabled = true;
        if(senderAddress2Input) senderAddress2Input.disabled = true;
        if(senderPhoneInput) senderPhoneInput.disabled = true;
        if(orderSummaryContainer) orderSummaryContainer.innerHTML = '<p class="text-danger">Error loading order summary.</p>';
        return;
    }

    // cart.js already calls loadCartFromLocalStorage at its end.

    function displayCartItems() {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = ''; // Clear previous items

        if (!cart || cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.classList.add('list-group');

        cart.forEach(item => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

            // Assuming item has id, name, price, quantity, image_url
            li.innerHTML = `
                <div class="d-flex align-items-center">
                    <img src="${item.image_url}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
                    <div>
                        <h6 class="my-0">${item.name}</h6>
                        <small class="text-muted">Price: Rp ${item.price.toLocaleString('id-ID')} x ${item.quantity}</small>
                    </div>
                </div>
                <button class="btn btn-danger btn-sm remove-from-cart-btn" data-product-id="${item.id}">Remove</button>
            `;
            ul.appendChild(li);
        });
        cartItemsContainer.appendChild(ul);
    }

    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', function(event) {
            if (event.target.classList.contains('remove-from-cart-btn')) {
                const productId = event.target.dataset.productId;
                if (typeof removeFromCart === 'function') {
                    removeFromCart(productId);
                    displayCartItems();
                    displayOrderSummary(); // Update summary after removal
                } else {
                    console.error('removeFromCart function is not defined. Make sure it is in cart.js and cart.js is loaded.');
                    alert('Error: Could not remove item. Functionality missing.');
                }
            }
        });
    }

    function displaySenderAddress() {
        // senderAddress is loaded by cart.js and should be available globally or via a getter.
        // Assuming senderAddress is global from cart.js
        if(senderNameInput) senderNameInput.value = senderAddress.name || '';
        if(senderAddress1Input) senderAddress1Input.value = senderAddress.address1 || '';
        if(senderAddress2Input) senderAddress2Input.value = senderAddress.address2 || '';
        if(senderPhoneInput) senderPhoneInput.value = senderAddress.phone || '';
    }

    if(senderNameInput) senderNameInput.addEventListener('input', (e) => { senderAddress.name = e.target.value; saveCartToLocalStorage(); });
    if(senderAddress1Input) senderAddress1Input.addEventListener('input', (e) => { senderAddress.address1 = e.target.value; saveCartToLocalStorage(); });
    if(senderAddress2Input) senderAddress2Input.addEventListener('input', (e) => { senderAddress.address2 = e.target.value; saveCartToLocalStorage(); });
    if(senderPhoneInput) senderPhoneInput.addEventListener('input', (e) => { senderAddress.phone = e.target.value; saveCartToLocalStorage(); });

    function displayOrderSummary() {
        if (!orderSummaryContainer || typeof cart === 'undefined') return;

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingCost = 10000; // Fixed shipping cost
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
    }

    // Initial display calls
    displayCartItems();
    displaySenderAddress();
    displayOrderSummary();

    if (payButton) {
        payButton.addEventListener('click', function() {
            // Preliminary check: ensure cart is not empty before proceeding
            if (!cart || cart.length === 0) {
                alert("Your cart is empty. Please add items before proceeding to payment.");
                return;
            }

            // Preliminary check: ensure address fields are somewhat filled
            if (!senderAddress || !senderAddress.name || !senderAddress.address1 || !senderAddress.phone) {
                alert("Please fill in all required sender address fields (Full Name, Address Line 1, Phone Number).");
                return;
            }

            if (typeof handlePayment === 'function') {
                handlePayment(); // This function will be in cart.js

                // Update display after payment
                displayCartItems();
                displaySenderAddress(); // This should now show empty fields
                displayOrderSummary();

                // Optional: Disable pay button after successful payment
                // payButton.disabled = true;
                // payButton.textContent = 'Order Placed!';
            } else {
                console.error('handlePayment function is not defined. Ensure cart.js is correctly loaded.');
                alert('Error processing payment. Function not found.');
            }
        });
    }
});
