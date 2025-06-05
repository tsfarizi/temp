// Initialize cart and senderAddress
const POCKETBASE_URL = 'http://127.0.0.1:8090';
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

// Function to add a product to the cart
async function addToCart(productId) {
  // Check if user is logged in
  const token = localStorage.getItem('pocketbase_token');
  if (!token) {
    alert("Please log in to add items to your cart.");
    if (typeof showLoginForm === 'function') { // showLoginForm is in auth.js
         showLoginForm();
    }
    return;
  }

  try {
    const response = await fetch(`${POCKETBASE_URL}/api/collections/products/records/${productId}`);
    if (!response.ok) {
      if (response.status === 404) {
        console.error(`Product with ID "${productId}" not found in PocketBase.`);
        alert(`Error: Product not found!`);
      } else {
        console.error(`Error fetching product ${productId} from PocketBase: ${response.status} ${response.statusText}`);
        alert(`Error fetching product details. Status: ${response.status}`);
      }
      return;
    }
    const productDataFromPocketBase = await response.json();

    const existingProductIndex = cart.findIndex(item => item.id === productDataFromPocketBase.id);
    if (existingProductIndex > -1) {
      cart[existingProductIndex].quantity += 1; // Increment quantity
      console.log(`Product "${productDataFromPocketBase.name}" quantity updated in the cart.`);
      alert(`"${productDataFromPocketBase.name}" quantity updated in your cart.`);
    } else {
      // Add product with quantity 1
      cart.push({
        id: productDataFromPocketBase.id,
        name: productDataFromPocketBase.name,
        price: productDataFromPocketBase.price,
        image_url: productDataFromPocketBase.image_url,
        quantity: 1
      });
      console.log(`Product "${productDataFromPocketBase.name}" added to cart from PocketBase.`);
      alert(`"${productDataFromPocketBase.name}" has been added to your cart!`);
    }

    saveCartToLocalStorage();
    if (typeof updateCartLink === 'function') {
      updateCartLink();
    }

  } catch (error) {
    console.error(`Error in addToCart for product ID "${productId}":`, error);
    alert(`An unexpected error occurred while adding the product to your cart.`);
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
