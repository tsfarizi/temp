document.addEventListener('DOMContentLoaded', async function () {
    const MIGRATION_FLAG = 'isDataMigrated_v3';

    async function migrateData() {
        if (localStorage.getItem(MIGRATION_FLAG)) {
            console.log('Data migration already performed. Skipping.');
            return;
        }

        console.log('Starting data migration to PocketBase...');

        try {
            if (typeof products === 'undefined' || typeof mountainRecommendations === 'undefined' || typeof categories === 'undefined') {
                console.error('Data arrays (products, mountainRecommendations, categories) not found. Make sure data.js is loaded before this script.');
                return;
            }

            console.log('Migrating products...');
            for (const product of products) {
                const { id, ...cleanProduct } = product;
                console.log('Attempting to migrate product:', JSON.stringify(cleanProduct, null, 2)); // Added log
                const response = await fetch(`${POCKETBASE_URL}/api/collections/products/records`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cleanProduct)
                });

                if (!response.ok) {
                    const errorData = await response.json(); // This is already good
                    console.error(`Failed to migrate product ${product.name}: ${response.status}`, errorData);
                } else {
                    const responseData = await response.json(); // Get response data for logging
                    console.log(`Successfully migrated product: ${product.name}`, responseData); // Added response data to log
                }
            }

            console.log('Migrating mountain recommendations...');
            for (const mountain of mountainRecommendations) {
                const { id, ...cleanMountain } = mountain;

                if (cleanMountain.image_url) {
                    cleanMountain.image_url = cleanMountain.image_url.replace('assets/mountains/', 'assets/gunung/');
                }

                const response = await fetch(`${POCKETBASE_URL}/api/collections/mountains/records`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cleanMountain)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error(`Failed to migrate mountain ${mountain.name}: ${response.status}`, errorData);
                } else {
                    console.log(`Migrated mountain: ${mountain.name}`);
                }
            }


            console.log('Migrating categories...');
            for (const category of categories) {
                const response = await fetch(`${POCKETBASE_URL}/api/collections/categories/records`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(category)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error(`Failed to migrate category ${category.name}: ${response.status}`, errorData);
                } else {
                    console.log(`Migrated category: ${category.name}`);
                }
            }

            localStorage.setItem(MIGRATION_FLAG, 'true');
            console.log('Data migration to PocketBase completed successfully.');
        } catch (error) {
            console.error('An error occurred during data migration:', error);
        }
    }

    try {
        const healthCheck = await fetch(`${POCKETBASE_URL}/api/health`);
        if (healthCheck.ok) {
            console.log('PocketBase server is accessible.');
            await migrateData();
        } else {
            const healthStatus = await healthCheck.json();
            console.warn('PocketBase server not healthy or not accessible. Migration will be skipped.', healthStatus);
            console.log(`You might need to start PocketBase using: ./pocketbase serve`);
        }
    } catch (error) {
        console.warn(`PocketBase server not found at ${POCKETBASE_URL}. Migration will be skipped. Make sure PocketBase is running.`, error.message);
        console.log(`You might need to start PocketBase using: ./pocketbase serve`);
    }
});
