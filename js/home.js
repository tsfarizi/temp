document.addEventListener('DOMContentLoaded', async function() {
    const superiorProductsRow = document.getElementById('superior-products-row');
    const mountainRecommendationsRow = document.getElementById('mountain-recommendations-row');
    const mountainDetailModalElement = document.getElementById('mountain-detail-modal');
    let mountainDetailModal = null;
    if (mountainDetailModalElement) {
        mountainDetailModal = new bootstrap.Modal(mountainDetailModalElement);
    }

    function getRandomElements(array, numElements) {
        if (!array || array.length === 0) return [];
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, numElements);
    }

    async function displaySuperiorProducts() {
        if (!superiorProductsRow) return;
        superiorProductsRow.innerHTML = '<p>Memuat produk...</p>';

        try {
            const response = await fetch(`${POCKETBASE_URL}/api/collections/products/records?perPage=100`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const products = data.items;

            if (!products || products.length === 0) {
                superiorProductsRow.innerHTML = '<p>Tidak ada produk yang tersedia saat ini.</p>';
                return;
            }

            const numberOfProductsToShow = Math.min(3, products.length);
            const randomProducts = getRandomElements(products, numberOfProductsToShow);

            if (randomProducts.length === 0) {
                 superiorProductsRow.innerHTML = '<p>Tidak dapat memilih produk acak.</p>';
                 return;
            }

            let productsHTML = '';
            randomProducts.forEach(product => {
                let addToCartButtonHTML = '';
                const token = localStorage.getItem('pocketbase_token');
                if (token) {
                    addToCartButtonHTML = `<button class="btn btn-primary add-to-cart-btn mt-auto" data-product-id="${product.id}">Tambah ke Keranjang</button>`;
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

            // Add event listeners to new "Tambah ke Keranjang" buttons
            superiorProductsRow.querySelectorAll('.add-to-cart-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = this.dataset.productId;
                    // Assuming addToCart is a global function from cart.js
                    if (typeof window.addToCart === 'function') {
                        window.addToCart(productId);
                    }
                });
            });
        } catch (error) {
            console.error('Gagal memuat produk unggulan:', error);
            superiorProductsRow.innerHTML = '<p>Gagal memuat produk. Silakan coba lagi nanti.</p>';
        }
    }

    async function displayMountainRecommendations() {
        if (!mountainRecommendationsRow) return;
        mountainRecommendationsRow.innerHTML = '<p>Memuat rekomendasi...</p>';

        try {
            const response = await fetch(`${POCKETBASE_URL}/api/collections/mountains/records?perPage=100`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const recommendations = data.items;

            if (!recommendations || recommendations.length === 0) {
                mountainRecommendationsRow.innerHTML = '<p>Tidak ada rekomendasi gunung yang tersedia saat ini.</p>';
                return;
            }

            const numberOfRecommendationsToShow = Math.min(3, recommendations.length);
            const randomRecommendations = getRandomElements(recommendations, numberOfRecommendationsToShow);

            if (randomRecommendations.length === 0) {
                 mountainRecommendationsRow.innerHTML = '<p>Tidak dapat memilih rekomendasi acak.</p>';
                 return;
            }

            let recommendationsHTML = '';
            randomRecommendations.forEach(rec => {
                recommendationsHTML += `
                    <div class="col-md-4 mb-4">
                        <div class="card h-100 mountain-card" data-name="${rec.name}" data-description="${rec.description}" data-image="${rec.image_url}">
                            <img src="${rec.image_url}" class="card-img-top" alt="${rec.name}" style="height: 200px; object-fit: cover;">
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">${rec.name}</h5>
                                <p class="card-text"><strong>Tingkat Keahlian:</strong> ${rec.skill_level}</p>
                                <p class="card-text flex-grow-1">${rec.description.substring(0, 150)}${rec.description.length > 150 ? '...' : ''}</p>
                            </div>
                        </div>
                    </div>`;
            });
            mountainRecommendationsRow.innerHTML = recommendationsHTML;

            // Add click event listeners to show modal with mountain details
            mountainRecommendationsRow.querySelectorAll('.mountain-card').forEach(card => {
                card.addEventListener('click', function() {
                    const name = this.dataset.name;
                    const desc = this.dataset.description;
                    const img = this.dataset.image;

                    const labelEl = document.getElementById('mountain-detail-modal-label');
                    const imageEl = document.getElementById('mountain-detail-image');
                    const nameEl = document.getElementById('mountain-detail-name');
                    const descEl = document.getElementById('mountain-detail-description');

                    if (labelEl) labelEl.textContent = name;
                    if (imageEl) {
                        imageEl.src = img;
                        imageEl.alt = name;
                    }
                    if (nameEl) nameEl.textContent = name;
                    if (descEl) descEl.textContent = desc;

                    if (mountainDetailModal) {
                        mountainDetailModal.show();
                    }
                });
            });
        } catch (error) {
            console.error('Gagal memuat rekomendasi gunung:', error);
            mountainRecommendationsRow.innerHTML = '<p>Gagal memuat rekomendasi. Silakan coba lagi nanti.</p>';
        }
    }

    if (superiorProductsRow) {
        await displaySuperiorProducts();
    }

    if (mountainRecommendationsRow) {
        await displayMountainRecommendations();
    }
});
