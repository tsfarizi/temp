document.addEventListener('DOMContentLoaded', function() {
    const categoryFilterContainer = document.getElementById('category-filter-container');
    const productListRow = document.getElementById('product-list-row');
    let currentActiveButton = null;

    function displayProducts(filterCategory = 'all') {
        if (typeof products === 'undefined' || products.length === 0 || !productListRow) {
            if (productListRow) productListRow.innerHTML = '<div class="col"><p class="text-center">No products available at the moment.</p></div>';
            return;
        }
        productListRow.innerHTML = '';

        const filteredProducts = filterCategory === 'all' ?
            products :
            products.filter(product => product.category === filterCategory);

        if (filteredProducts.length === 0) {
            productListRow.innerHTML = '<div class="col"><p class="text-center">No products found in this category.</p></div>';
            return;
        }

        filteredProducts.forEach(product => {
            const productCard = `
                <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                    <div class="card h-100">
                        <img src="${product.image_url}" class="card-img-top" alt="${product.name}" style="height: 180px; object-fit: cover;">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text flex-grow-1">${product.description.substring(0, 80)}${product.description.length > 80 ? '...' : ''}</p>
                            <p class="card-text"><strong>Price: $${product.price.toFixed(2)}</strong></p>
                        </div>
                    </div>
                </div>`;
            productListRow.innerHTML += productCard;
        });
    }

    function setupCategoryFilters() {
        if (typeof products === 'undefined' || products.length === 0 || !categoryFilterContainer) {
            if (categoryFilterContainer) categoryFilterContainer.innerHTML = '<p class="text-center">No categories to display.</p>';
            return;
        }

        const categories = ['all', ...new Set(products.map(product => product.category))];
        categoryFilterContainer.innerHTML = '';

        categories.forEach(category => {
            const button = document.createElement('button');
            button.classList.add('btn', 'btn-outline-secondary', 'mx-1', 'mb-2');
            button.dataset.category = category;
            button.textContent = category.charAt(0).toUpperCase() + category.slice(1);

            if (category === 'all') {
                button.classList.add('active');
                currentActiveButton = button;
            }

            button.addEventListener('click', function() {
                if (currentActiveButton) {
                    currentActiveButton.classList.remove('active');
                }
                this.classList.add('active');
                currentActiveButton = this;
                displayProducts(this.dataset.category);
            });
            categoryFilterContainer.appendChild(button);
        });
    }

    if (typeof products !== 'undefined' && products.length > 0) {
        setupCategoryFilters();
        displayProducts('all');
    } else {
        if (productListRow) productListRow.innerHTML = '<div class="col"><p class="text-center">Product data is not available or empty.</p></div>';
        if (categoryFilterContainer) categoryFilterContainer.innerHTML = '';
    }
});
