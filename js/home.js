document.addEventListener('DOMContentLoaded', function() {
    const superiorProductsRow = document.getElementById('superior-products-row');
    const mountainRecommendationsRow = document.getElementById('mountain-recommendations-row');

    function getRandomElements(array, numElements) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, numElements);
    }

    function displaySuperiorProducts() {
        if (typeof products === 'undefined' || products.length === 0) {
            superiorProductsRow.innerHTML = '<p>No products available at the moment.</p>';
            return;
        }
        const numberOfProductsToShow = Math.min(3, products.length);
        const randomProducts = getRandomElements(products, numberOfProductsToShow);

        let productsHTML = '';
        randomProducts.forEach(product => {
            productsHTML += `
                <div class="col-md-4 mb-4">
                    <div class="card h-100">
                        <img src="${product.image_url}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover;">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text flex-grow-1">${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</p>
                            <p class="card-text"><strong>Price: $${product.price.toFixed(2)}</strong></p>
                        </div>
                    </div>
                </div>`;
        });
        superiorProductsRow.innerHTML = productsHTML;
    }

    function displayMountainRecommendations() {
        if (typeof mountainRecommendations === 'undefined' || mountainRecommendations.length === 0) {
            mountainRecommendationsRow.innerHTML = '<p>No mountain recommendations available at the moment.</p>';
            return;
        }

        let recommendationsHTML = '';
        mountainRecommendations.forEach(rec => {
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
    }

    if (superiorProductsRow) {
        displaySuperiorProducts();
    }

    if (mountainRecommendationsRow) {
        displayMountainRecommendations();
    }
});
