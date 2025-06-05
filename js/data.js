const products = [
  { id: 'p1', name: 'Head-Lamp-XXX', category: 'lainnya', price: 389850, image_url: 'assets/produk/lainnya/Head-Lamp-XXX.jpg', description: 'Reliable headlamp for all your adventures.' },
  { id: 'p2', name: 'Head-Lamp', category: 'lainnya', price: 299850, image_url: 'assets/produk/lainnya/Head-Lamp.jpg', description: 'A trusty companion for dark trails.' },
  { id: 'p3', name: 'Kompor-Camping', category: 'lainnya', price: 682500, image_url: 'assets/produk/lainnya/Kompor-Camping.jpg', description: 'Compact and efficient camping stove.' },
  { id: 'p4', name: 'Kompor-Portable', category: 'lainnya', price: 525000, image_url: 'assets/produk/lainnya/Kompor-Portable.jpg', description: 'Lightweight stove for quick meals.' },
  { id: 'p5', name: 'Lampu-Tenda', category: 'lainnya', price: 236250, image_url: 'assets/produk/lainnya/Lampu-Tenda.jpg', description: 'Brightens up your tent at night.' },
  { id: 'p6', name: 'Lensatic-Compas', category: 'lainnya', price: 330000, image_url: 'assets/produk/lainnya/Lensatic-Compas.jpg', description: 'Essential for navigation.' },
  { id: 'p7', name: 'Pisau-lipat-XYZ', category: 'lainnya', price: 284850, image_url: 'assets/produk/lainnya/Pisau-lipat-XYZ.jpg', description: 'Versatile folding knife.' },
  { id: 'p8', name: 'Sendok-Garpu', category: 'lainnya', price: 150000, image_url: 'assets/produk/lainnya/Sendok-Garpu.jpg', description: 'Durable utensil set.' },
  { id: 'p9', name: 'Tongkat-Gunung', category: 'lainnya', price: 449850, image_url: 'assets/produk/lainnya/Tongkat-Gunung.jpg', description: 'Provides stability on uneven terrain.' },
  { id: 'p10', name: 'Jaket-Adventure', category: 'pakaian', price: 1349850, image_url: 'assets/produk/pakaian/Jaket-Adventure.jpg', description: 'Weather-resistant adventure jacket.' },
  { id: 'p11', name: 'Jaket-Avtech', category: 'pakaian', price: 1125000, image_url: 'assets/produk/pakaian/Jaket-Avtech.jpg', description: 'Comfortable and stylish outdoor jacket.' },
  { id: 'p12', name: 'Jaket-Gunung', category: 'pakaian', price: 1492500, image_url: 'assets/produk/pakaian/Jaket-Gunung.jpg', description: 'Insulated jacket for mountain expeditions.' },
  { id: 'p13', name: 'Jaket-JACKWOLFS', category: 'pakaian', price: 1800000, image_url: 'assets/produk/pakaian/Jaket-JACKWOLFS.jpg', description: 'High-performance Jack Wolfskin jacket.' },
  { id: 'p14', name: 'Jaket-Wolfskin', category: 'pakaian', price: 1650000, image_url: 'assets/produk/pakaian/Jaket-Wolfskin.jpg', description: 'Durable Wolfskin outdoor jacket.' },
  { id: 'p15', name: 'Adidas-Neo-AX2', category: 'sepatu', price: 2250000, image_url: 'assets/produk/sepatu/Adidas-Neo-AX2.jpg', description: 'Comfortable Adidas hiking shoes.' },
  { id: 'p16', name: 'SEPATU-DELTA-6', category: 'sepatu', price: 1950000, image_url: 'assets/produk/sepatu/SEPATU-DELTA-6-.jpg', description: 'Tactical Delta 6 boots.' },
  { id: 'p17', name: 'Sepatu-Eiger', category: 'sepatu', price: 2100000, image_url: 'assets/produk/sepatu/Sepatu-Eiger.jpg', description: 'Reliable Eiger hiking footwear.' },
  { id: 'p18', name: 'Sepatu-Merrell', category: 'sepatu', price: 2475000, image_url: 'assets/produk/sepatu/Sepatu-Merrell-.jpg', description: 'High-quality Merrell trail shoes.' },
  { id: 'p19', name: 'Sepatu', category: 'sepatu', price: 1200000, image_url: 'assets/produk/sepatu/Sepatu.jpg', description: 'Generic but sturdy hiking shoe.' },
  { id: 'p20', name: 'sepatu-converse', category: 'sepatu', price: 900000, image_url: 'assets/produk/sepatu/sepatu-converse.jpeg', description: 'Classic Converse for casual trails.' },
  { id: 'p21', name: 'Tas-Ost-Rei', category: 'tas', price: 1425000, image_url: 'assets/produk/tas/Tas--Ost-Rei.jpg', description: 'Durable Ost Rei backpack.' },
  { id: 'p22', name: 'Tas-Consina', category: 'tas', price: 1575000, image_url: 'assets/produk/tas/Tas-Consina.jpg', description: 'Spacious Consina trekking bag.' },
  { id: 'p23', name: 'Tas-Deuter', category: 'tas', price: 1875000, image_url: 'assets/produk/tas/Tas-Deuter.jpg', description: 'Comfortable Deuter hiking backpack.' },
  { id: 'p24', name: 'Tas-Eiger', category: 'tas', price: 1725000, image_url: 'assets/produk/tas/Tas-Eiger.jpg', description: 'Versatile Eiger backpack for all needs.' },
  { id: 'p25', name: 'Tas-Moods', category: 'tas', price: 1050000, image_url: 'assets/produk/tas/Tas-Moods.jpg', description: 'Stylish Moods daypack.' },
  { id: 'p26', name: 'Tas-Royal-Mountain', category: 'tas', price: 1950000, image_url: 'assets/produk/tas/Tas-Royal-Mountain.jpg', description: 'Large capacity Royal Mountain expedition bag.' },
  { id: 'p27', name: 'Tenda-Camping', category: 'tenda', price: 3000000, image_url: 'assets/produk/tenda/Tenda-Camping.jpg', description: 'Easy setup camping tent.' },
  { id: 'p28', name: 'Tenda-Consina', category: 'tenda', price: 3300000, image_url: 'assets/produk/tenda/Tenda-Consina.jpg', description: 'Weatherproof Consina tent.' },
  { id: 'p29', name: 'Tenda-Dome', category: 'tenda', price: 2700000, image_url: 'assets/produk/tenda/Tenda-Dome.jpg', description: 'Classic dome tent for various conditions.' },
  { id: 'p30', name: 'Tenda-Eiger-E12', category: 'tenda', price: 3750000, image_url: 'assets/produk/tenda/Tenda-Eiger-E12.jpg', description: 'Spacious Eiger E12 family tent.' },
  { id: 'p31', name: 'Tenda-Montana', category: 'tenda', price: 2850000, image_url: 'assets/produk/tenda/Tenda-Montana.jpg', description: 'Robust Montana tent for hikers.' },
  { id: 'p32', name: 'Tenda-Summer', category: 'tenda', price: 2250000, image_url: 'assets/produk/tenda/Tenda-Summer.jpg', description: 'Lightweight summer tent.' }
];

const mountainRecommendations = [
  { id: 'm1', name: 'Gunung Gede', skill_level: 'Beginner', description: 'Perfect for first-timers, offering great views with a gentle slope.', image_url: 'assets/mountains/gede.jpg' },
  { id: 'm2', name: 'Gunung Rinjani', skill_level: 'Intermediate', description: 'A moderately challenging hike with rewarding panoramic views from the summit.', image_url: 'assets/mountains/rinjani.jpg' },
  { id: 'm3', name: 'Gunung Bromo', skill_level: 'Beginner', description: 'A peaceful trail leading to a serene summit, ideal for a relaxing day out.', image_url: 'assets/mountains/bromo.jpg' },
  { id: 'm4', name: 'Gunung Semeru', skill_level: 'Advanced', description: 'A strenuous and technical climb for experienced hikers seeking a thrill.', image_url: 'assets/mountains/semeru.jpg' }
];

const categories = [
  { name: 'lainnya', image_url: 'assets/kategori/lainnya.png' },
  { name: 'pakaian', image_url: 'assets/kategori/pakaian.png' },
  { name: 'sepatu', image_url: 'assets/kategori/sepatu.png' },
  { name: 'tas', image_url: 'assets/kategori/tas.png' },
  { name: 'tenda', image_url: 'assets/kategori/tenda.png' }
];
