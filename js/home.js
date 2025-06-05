document.addEventListener('DOMContentLoaded', async function() {
    const superiorProductsRow = document.getElementById('superior-products-row');
    const mountainRecommendationsRow = document.getElementById('mountain-recommendations-row');
    const POCKETBASE_URL = 'http://127.0.0.1:8090';

    function getRandomElements(array, numElements) {
        if (!array || array.length === 0) return [];
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, numElements);
    }

    async function displaySuperiorProducts() {
        if (!superiorProductsRow) return;
        superiorProductsRow.innerHTML = '<p>Loading products...</p>';

        try {
            const response = await fetch(`${POCKETBASE_URL}/api/collections/products/records?perPage=100`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const products = data.items;

            if (!products || products.length === 0) {
                superiorProductsRow.innerHTML = '<p>No products available at the moment.</p>';
                return;
            }

            const numberOfProductsToShow = Math.min(3, products.length);
            const randomProducts = getRandomElements(products, numberOfProductsToShow);

            if (randomProducts.length === 0) {
                 superiorProductsRow.innerHTML = '<p>Could not select any random products.</p>';
                 return;
            }

            let productsHTML = '';
            randomProducts.forEach(product => {
                let addToCartButtonHTML = '';
                const token = localStorage.getItem('pocketbase_token');
                if (token) {
                    addToCartButtonHTML = `<button class="btn btn-primary add-to-cart-btn mt-auto" data-product-id="${product.id}">Add to Cart</button>`;
                } else {
                    addToCartButtonHTML = '';
                }

                productsHTML += `
                    <div class="col-md-4 mb-4">
                        <div class="card h-100 d-flex flex-column">
                            <img src="${product.image_url}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover;">
                            <div class="card-body d-flex flex-column flex-grow-1">
                                <h5 class="card-title">${product.name}</h5>
                                <p class="card-text flex-grow-1">${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</p>
                                <p class="card-text"><strong>Price: Rp ${product.price.toLocaleString('id-ID')}</strong></p>
                                ${addToCartButtonHTML}
                            </div>
                        </div>
                    </div>`;
            });
            superiorProductsRow.innerHTML = productsHTML;

            // Add event listeners to new "Add to Cart" buttons
            superiorProductsRow.querySelectorAll('.add-to-cart-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = this.dataset.productId;
                    // Assuming addToCart is a global function from cart.js
                    if (typeof addToCart === 'function') {
                        addToCart(productId);
                    } else {
                        console.error('addToCart function is not defined. Make sure cart.js is loaded.');
                        alert('Error: Could not add to cart. Functionality missing.');
                    }
                });
            });
        } catch (error) {
            console.error('Failed to load superior products:', error);
            superiorProductsRow.innerHTML = '<p>Failed to load products. Please try again later.</p>';
        }
    }

    async function displayMountainRecommendations() {
        if (!mountainRecommendationsRow) return;
        mountainRecommendationsRow.innerHTML = '<p>Loading recommendations...</p>';

        try {
            const response = await fetch(`${POCKETBASE_URL}/api/collections/mountains/records?perPage=100`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const recommendations = data.items;

            if (!recommendations || recommendations.length === 0) {
                mountainRecommendationsRow.innerHTML = '<p>No mountain recommendations available at the moment.</p>';
                return;
            }

            const numberOfRecommendationsToShow = Math.min(3, recommendations.length);
            const randomRecommendations = getRandomElements(recommendations, numberOfRecommendationsToShow);

            if (randomRecommendations.length === 0) {
                 mountainRecommendationsRow.innerHTML = '<p>Could not select any random recommendations.</p>';
                 return;
            }

            let recommendationsHTML = '';
            randomRecommendations.forEach(rec => {
                recommendationsHTML += `
                    <div class="col-md-4 mb-4">
                        <div class="card h-100">
                            <img src="${rec.image_url}" class="card-img-top" alt="${rec.name}" style="height: 200px; object-fit: cover;">
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">${rec.name}</h5>
                                <p class="card-text"><strong>Skill Level:</strong> ${rec.skill_level}</p>
                                <p class="card-text flex-grow-1">${rec.description.substring(0, 150)}${rec.description.length > 150 ? '...' : ''}</p>
                            </div>
                        </div>
                    </div>`;
            });
            mountainRecommendationsRow.innerHTML = recommendationsHTML;
        } catch (error) {
            console.error('Failed to load mountain recommendations:', error);
            mountainRecommendationsRow.innerHTML = '<p>Failed to load recommendations. Please try again later.</p>';
        }
    }

    if (superiorProductsRow) {
        await displaySuperiorProducts();
    }

    if (mountainRecommendationsRow) {
        await displayMountainRecommendations();
    }
});
