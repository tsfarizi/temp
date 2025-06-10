document.addEventListener('DOMContentLoaded', async function() {
    const categoryFilterContainer = document.getElementById('category-filter-container');
    const genderFilterContainer = document.getElementById('gender-filter-container'); // New
    const productListRow = document.getElementById('product-list-row');
    let currentActiveCategoryButton = null; // Renamed for clarity
    let currentCategory = 'all'; // Added to store current category
    let currentGender = 'all'; // Added to store current gender

    function displayProducts(productsData, filterCategoryApplied = 'all', filterGenderApplied = 'all') { // Modified
        if (!productListRow) return;
        productListRow.innerHTML = '';

        if (!productsData || productsData.length === 0) {
            let message = "No products found";
            if (filterCategoryApplied !== 'all' && filterGenderApplied !== 'all') {
                message += ` for ${filterGenderApplied} in ${filterCategoryApplied} category.`;
            } else if (filterCategoryApplied !== 'all') {
                message += ` in the category ${filterCategoryApplied}.`;
            } else if (filterGenderApplied !== 'all') {
                message += ` for ${filterGenderApplied}.`;
            }
            productListRow.innerHTML = `<div class="col"><p class="text-center">${message}</p></div>`;
            return;
        }

        productsData.forEach(product => {
            let addToCartButtonHTML = '';
            const token = localStorage.getItem('pocketbase_token');
            if (token) {
                addToCartButtonHTML = `<button class="btn btn-primary add-to-cart-btn mt-auto" data-product-id="${product.id}">Add to Cart</button>`;
            } else {
                addToCartButtonHTML = '';
            }

            const productCard = `
                <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                    <div class="card h-100 d-flex flex-column">
                        <img src="${product.image_url}" class="card-img-top" alt="${product.name}" style="height: 180px; object-fit: cover;">
                        <div class="card-body d-flex flex-column flex-grow-1">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text flex-grow-1">${product.description.substring(0, 80)}${product.description.length > 80 ? '...' : ''}</p>
                            <p class="card-text"><strong>Price: Rp ${product.price.toLocaleString('id-ID')}</strong></p>
                            ${product.gender ? `<p class="card-text text-muted small">Gender: ${product.gender.charAt(0).toUpperCase() + product.gender.slice(1)}</p>` : ''}
                            ${addToCartButtonHTML}
                        </div>
                    </div>
                </div>`;
            productListRow.innerHTML += productCard;
        });

        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.dataset.productId;
                window.addToCart(productId);
            });
        });
    }

    // New function: setupGenderFilter
    function setupGenderFilter() {
        if (!genderFilterContainer) return;

        const selectLabel = document.createElement('label');
        selectLabel.setAttribute('for', 'gender-select');
        selectLabel.textContent = 'Filter by Gender:';
        selectLabel.classList.add('form-label', 'me-2');

        const selectDropdown = document.createElement('select');
        selectDropdown.classList.add('form-select', 'form-select-sm', 'd-inline-block', 'w-auto');
        selectDropdown.id = 'gender-select';

        const options = [
            { value: 'all', text: 'All Genders' },
            { value: 'pria', text: 'Pria' },
            { value: 'wanita', text: 'Wanita' }
        ];

        options.forEach(opt => {
            const optionElement = document.createElement('option');
            optionElement.value = opt.value;
            optionElement.textContent = opt.text;
            selectDropdown.appendChild(optionElement);
        });

        selectDropdown.addEventListener('change', async function() {
            currentGender = this.value;
            await fetchAndDisplayProducts(currentCategory, currentGender);
        });

        genderFilterContainer.appendChild(selectLabel);
        genderFilterContainer.appendChild(selectDropdown);
    }


    async function setupCategoryFilters() {
        if (!categoryFilterContainer) return;
        // Keep existing "Loading categories..."
        const initialLoadingMsg = categoryFilterContainer.querySelector('p');
        if (initialLoadingMsg) initialLoadingMsg.textContent = 'Loading categories...';
        else categoryFilterContainer.innerHTML = '<p class="text-center">Loading categories...</p>';


        try {
            const response = await fetch(`${POCKETBASE_URL}/api/collections/categories/records`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            const fetchedCategories = data.items;

            categoryFilterContainer.innerHTML = ''; // Clear loading message

            const allButton = document.createElement('button');
            allButton.classList.add('btn', 'btn-outline-secondary', 'mx-1', 'mb-2', 'active');
            allButton.dataset.category = 'all';
            allButton.textContent = 'All';
            currentActiveCategoryButton = allButton; // currentActiveButton renamed to currentActiveCategoryButton

            allButton.addEventListener('click', async function() {
                if (currentActiveCategoryButton) {
                    currentActiveCategoryButton.classList.remove('active');
                }
                this.classList.add('active');
                currentActiveCategoryButton = this;
                currentCategory = this.dataset.category; // Update currentCategory
                await fetchAndDisplayProducts(currentCategory, currentGender); // Modified call
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
                        if (currentActiveCategoryButton) {
                            currentActiveCategoryButton.classList.remove('active');
                        }
                        this.classList.add('active');
                        currentActiveCategoryButton = this;
                        currentCategory = this.dataset.category; // Update currentCategory
                        await fetchAndDisplayProducts(currentCategory, currentGender); // Modified call
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

    async function fetchAndDisplayProducts(filterCategory = 'all', filterGender = 'all') { // Modified signature
        if (!productListRow) return;
        // Modified loading message
        let loadingMessage = "Loading products";
        if (filterCategory !== 'all' && filterGender !== 'all') {
            loadingMessage += ` for ${filterGender} in ${filterCategory} category...`;
        } else if (filterCategory !== 'all') {
            loadingMessage += ` for ${filterCategory} category...`;
        } else if (filterGender !== 'all') {
            loadingMessage += ` for ${filterGender}...`;
        } else {
            loadingMessage += "...";
        }
        productListRow.innerHTML = `<div class="col"><p class="text-center">${loadingMessage}</p></div>`;


        let filterParts = [];
        if (filterCategory !== 'all') {
            filterParts.push(`category='${encodeURIComponent(filterCategory)}'`);
        }
        if (filterGender !== 'all') {
            filterParts.push(`gender='${encodeURIComponent(filterGender)}'`);
        }

        let filterString = "";
        if (filterParts.length > 0) {
            filterString = `&filter=(${filterParts.join('&&')})`;
        }

        let url = `${POCKETBASE_URL}/api/collections/products/records?perPage=100${filterString}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            displayProducts(data.items, filterCategory, filterGender); // Modified call
        } catch (error) {
            console.error(`Failed to fetch products for category ${filterCategory} and gender ${filterGender}:`, error);
            productListRow.innerHTML = `<div class="col"><p class="text-center">Failed to load products. Please try again later.</p></div>`;
        }
    }

    // Initialization updated
    if (categoryFilterContainer && productListRow && genderFilterContainer) { // Added genderFilterContainer check
        await setupCategoryFilters();
        setupGenderFilter(); // Call new function
        await fetchAndDisplayProducts(currentCategory, currentGender); // Modified initial call
    } else {
        if (productListRow) productListRow.innerHTML = '<div class="col"><p class="text-center">Required page elements are missing.</p></div>';
        if (categoryFilterContainer) categoryFilterContainer.innerHTML = '';
        if (genderFilterContainer) genderFilterContainer.innerHTML = ''; // Clear gender container if it exists but others don't
    }
});
