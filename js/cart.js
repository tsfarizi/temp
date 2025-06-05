// Initialize cart and senderAddress
let cart = [];
let senderAddress = {};

// Function to load cart data from local storage
function loadCartFromLocalStorage() {
  const storedCart = localStorage.getItem('cart');
  if (storedCart) {
    cart = JSON.parse(storedCart);
    console.log('Cart loaded from local storage:', cart);
  } else {
    console.log('No cart data found in local storage.');
  }

  const storedAddress = localStorage.getItem('senderAddress');
  senderAddress = storedAddress ? JSON.parse(storedAddress) : {}; // Initialize if null
  console.log('Sender address loaded from local storage:', senderAddress);
}

// Function to save cart data to local storage
function saveCartToLocalStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
  console.log('Cart saved to local storage:', cart);

  localStorage.setItem('senderAddress', JSON.stringify(senderAddress));
  console.log('Sender address saved to local storage:', senderAddress);
}

// Load cart data when the script runs
loadCartFromLocalStorage();

// Function to get product by ID (assuming products array is global from data.js)
function getProductById(productId) {
  // Assuming 'products' is a global array from data.js
  if (typeof products === 'undefined') {
    console.error('Error: products array is not available. Make sure data.js is loaded before cart.js.');
    return null;
  }
  return products.find(p => p.id === productId);
}

// Function to add a product to the cart
function addToCart(productId) {
  const product = getProductById(productId);
  if (product) {
    const existingProductIndex = cart.findIndex(item => item.id === productId);
    if (existingProductIndex > -1) {
      // For now, just log. Later we can increment quantity.
      console.log(`Product "${product.name}" is already in the cart.`);
      alert(`"${product.name}" is already in your cart.`);
    } else {
      cart.push({ ...product, quantity: 1 });
      saveCartToLocalStorage();
      console.log(`Product "${product.name}" added to cart.`);
      alert(`"${product.name}" has been added to your cart!`);
      if (typeof updateCartLink === 'function') {
        updateCartLink();
      }
    }
  } else {
    console.error(`Product with ID "${productId}" not found.`);
    alert(`Error: Product not found!`);
  }
}

// Function to remove a product from the cart
function removeFromCart(productId) {
  const productIndex = cart.findIndex(item => item.id === productId);
  if (productIndex > -1) {
    const productName = cart[productIndex].name;
    cart.splice(productIndex, 1);
    saveCartToLocalStorage();
    console.log(`Product "${productName}" removed from cart.`);
    // alert(`"${productName}" has been removed from your cart.`); // Optional: alert, or rely on UI update
    if (typeof updateCartLink === 'function') {
      updateCartLink();
    }
  } else {
    console.warn(`Product with ID "${productId}" not found in cart for removal.`);
  }
}

function handlePayment() {
  // Clear cart
  cart.length = 0; // Empties the array in place

  // Clear senderAddress by deleting its properties
  for (const key in senderAddress) {
    delete senderAddress[key];
  }
  // Alternative: Object.keys(senderAddress).forEach(key => delete senderAddress[key]);

  saveCartToLocalStorage(); // Save the cleared cart and address

  console.log('Payment successful. Cart and address cleared.');
  alert('Order successful! Your items will be shipped soon. (This is a temporary message)');
  if (typeof updateCartLink === 'function') {
    updateCartLink();
  }
}

// Function to get total quantity of items in cart
function getCartItemCount() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}
