document.addEventListener('DOMContentLoaded', async function() {
    const categoryFilterContainer = document.getElementById('category-filter-container');
    const productListRow = document.getElementById('product-list-row');
    let currentActiveButton = null;
    const POCKETBASE_URL = 'http://127.0.0.1:8090';

    function displayProducts(productsData, filterCategoryApplied = 'all') {
        if (!productListRow) return;
        productListRow.innerHTML = '';

        if (!productsData || productsData.length === 0) {
            productListRow.innerHTML = `<div class="col"><p class="text-center">No products found ${filterCategoryApplied === 'all' ? '' : 'in the category ' + filterCategoryApplied}.</p></div>`;
            return;
        }

        productsData.forEach(product => {
            let addToCartButtonHTML = '';
            const token = localStorage.getItem('pocketbase_token');
            if (token) {
                addToCartButtonHTML = `<button class="btn btn-primary add-to-cart-btn mt-auto" data-product-id="${product.id}">Add to Cart</button>`;
            } else {
                addToCartButtonHTML = ''; // Or a disabled button: <button class="btn btn-secondary mt-auto" disabled title="Please login to add items to cart">Add to Cart</button>
            }

            const productCard = `
                <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                    <div class="card h-100 d-flex flex-column">
                        <img src="${product.image_url}" class="card-img-top" alt="${product.name}" style="height: 180px; object-fit: cover;">
                        <div class="card-body d-flex flex-column flex-grow-1">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text flex-grow-1">${product.description.substring(0, 80)}${product.description.length > 80 ? '...' : ''}</p>
                            <p class="card-text"><strong>Price: Rp ${product.price.toLocaleString('id-ID')}</strong></p>
                            ${addToCartButtonHTML}
                        </div>
                    </div>
                </div>`;
            productListRow.innerHTML += productCard;
        });

        // Add event listeners to "Add to Cart" buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.dataset.productId;
                addToCart(productId); // Call the addToCart function from cart.js
            });
        });
    }

    async function setupCategoryFilters() {
        if (!categoryFilterContainer) return;
        categoryFilterContainer.innerHTML = '<p class="text-center">Loading categories...</p>';

        try {
            const response = await fetch(`${POCKETBASE_URL}/api/collections/categories/records`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const fetchedCategories = data.items;

            categoryFilterContainer.innerHTML = '';

            const allButton = document.createElement('button');
            allButton.classList.add('btn', 'btn-outline-secondary', 'mx-1', 'mb-2', 'active');
            allButton.dataset.category = 'all';
            allButton.textContent = 'All';
            currentActiveButton = allButton;

            allButton.addEventListener('click', async function() {
                if (currentActiveButton) {
                    currentActiveButton.classList.remove('active');
                }
                this.classList.add('active');
                currentActiveButton = this;
                await fetchAndDisplayProducts(this.dataset.category);
            });
            categoryFilterContainer.appendChild(allButton);

            if (fetchedCategories && fetchedCategories.length > 0) {
                fetchedCategories.forEach(category => {
                    const button = document.createElement('button');
                    button.classList.add('btn', 'btn-outline-secondary', 'mx-1', 'mb-2');
                    button.dataset.category = category.name;

                    const img = document.createElement('img');
                    img.src = category.image_url;
                    img.alt = category.name;
                    img.style.height = '20px';
                    img.style.marginRight = '5px';

                    button.appendChild(img);
                    button.appendChild(document.createTextNode(category.name.charAt(0).toUpperCase() + category.name.slice(1)));

                    button.addEventListener('click', async function() {
                        if (currentActiveButton) {
                            currentActiveButton.classList.remove('active');
                        }
                        this.classList.add('active');
                        currentActiveButton = this;
                        await fetchAndDisplayProducts(this.dataset.category);
                    });
                    categoryFilterContainer.appendChild(button);
                });
            } else {
                 const noCategoriesMsg = document.createElement('p');
                 noCategoriesMsg.textContent = 'No other categories found.';
                 noCategoriesMsg.classList.add('text-center', 'ms-2');
                 categoryFilterContainer.appendChild(noCategoriesMsg);
            }

        } catch (error) {
            console.error('Failed to load categories:', error);
            categoryFilterContainer.innerHTML = '<p class="text-center">Failed to load categories.</p>';
        }
    }

    async function fetchAndDisplayProducts(filterCategory = 'all') {
        if (!productListRow) return;
        productListRow.innerHTML = `<div class="col"><p class="text-center">Loading products ${filterCategory === 'all' ? '' : 'for ' + filterCategory}...</div>`;

        let url = `${POCKETBASE_URL}/api/collections/products/records?perPage=100`;
        if (filterCategory !== 'all') {
            url += `&filter=(category='${encodeURIComponent(filterCategory)}')`;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            displayProducts(data.items, filterCategory);
        } catch (error) {
            console.error(`Failed to fetch products for category ${filterCategory}:`, error);
            productListRow.innerHTML = `<div class="col"><p class="text-center">Failed to load products. Please try again later.</p></div>`;
        }
    }

    if (categoryFilterContainer && productListRow) {
        await setupCategoryFilters();
        await fetchAndDisplayProducts('all');
    } else {
        if (productListRow) productListRow.innerHTML = '<div class="col"><p class="text-center">Required page elements are missing.</p></div>';
        if (categoryFilterContainer) categoryFilterContainer.innerHTML = '';
    }
});
