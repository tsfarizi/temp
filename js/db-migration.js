document.addEventListener('DOMContentLoaded', async function() {
    const POCKETBASE_URL = 'http://127.0.0.1:8090';
    const MIGRATION_FLAG = 'isDataMigrated_v1'; // Added a version to allow future re-migrations if schema changes

    async function migrateData() {
        if (localStorage.getItem(MIGRATION_FLAG)) {
            console.log('Data migration already performed. Skipping.');
            return;
        }

        console.log('Starting data migration to PocketBase...');

        try {
            // Ensure data from data.js is loaded
            if (typeof products === 'undefined' || typeof mountainRecommendations === 'undefined' || typeof categories === 'undefined') {
                console.error('Data arrays (products, mountainRecommendations, categories) not found. Make sure data.js is loaded before this script.');
                return;
            }

            // Migrate Products
            console.log('Migrating products...');
            for (const product of products) {
                // PocketBase expects 'id' to be auto-generated or provided if you specifically set it up that way.
                // Here, we are sending the existing 'id' from data.js as a field, which is fine if your collection is set up to accept it.
                // If 'id' is meant to be the PocketBase record ID, you might omit it or handle it differently based on collection settings.
                // For this script, we assume 'id' is a custom field.
                const response = await fetch(`${POCKETBASE_URL}/api/collections/products/records`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(product)
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error(`Failed to migrate product ${product.name}: ${response.status}`, errorData);
                } else {
                    console.log(`Migrated product: ${product.name}`);
                }
            }

            // Migrate Mountain Recommendations
            console.log('Migrating mountain recommendations...');
            for (const mountain of mountainRecommendations) {
                // Similar assumption for 'id' as with products.
                const response = await fetch(`${POCKETBASE_URL}/api/collections/mountains/records`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(mountain)
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error(`Failed to migrate mountain ${mountain.name}: ${response.status}`, errorData);
                } else {
                    console.log(`Migrated mountain: ${mountain.name}`);
                }
            }

            // Migrate Categories
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

    // Check if PocketBase server is accessible before attempting migration
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
        console.warn('PocketBase server not found at `${POCKETBASE_URL}`. Migration will be skipped. Make sure PocketBase is running.', error.message);
        console.log(`You might need to start PocketBase using: ./pocketbase serve`);
    }
});
