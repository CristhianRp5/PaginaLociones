// Datos completos de fragancias para hombre
const products = [
    // Marcas de Diseñador Clásicas - Carolina Herrera
    {
        id: 1,
        name: '212',
        description: 'Una fragancia urbana y sofisticada que captura la esencia de la vida moderna.',
        image: '../LOCIONES_PARA _ELLOS/212_CAROLINA_HERRERA.png',
        category: 'designer',
        brand: 'Carolina Herrera',
        notes: ['Especias', 'Sándalo', 'Almizcle'],
        price: 380000
    },
    {
        id: 2,
        name: '212 VIP',
        description: 'Elegancia exclusiva con notas vibrantes y modernas.',
        image: '../LOCIONES_PARA _ELLOS/212_VIP.png',
        category: 'designer',
        brand: 'Carolina Herrera',
        notes: ['Lima', 'Jengibre', 'Ámbar'],
        price: 390000
    },
    {
        id: 3,
        name: '212 Sexy',
        description: 'Seducción pura en una fragancia irresistible.',
        image: '../LOCIONES_PARA _ELLOS/212_SEXY.png',
        category: 'designer',
        brand: 'Carolina Herrera',
        notes: ['Mandarina', 'Vainilla', 'Almizcle'],
        price: 385000
    },
    {
        id: 4,
        name: '212 Forever Young',
        description: 'Juventud eterna capturada en una botella.',
        image: '../LOCIONES_PARA _ELLOS/212_FOREVER_YOUNG.png',
        category: 'designer',
        brand: 'Carolina Herrera',
        notes: ['Cítricos', 'Madera', 'Almizcle'],
        price: 395000
    },
    {
        id: 5,
        name: '212 VIP Black',
        description: 'Sofisticación nocturna para el hombre moderno.',
        image: '../LOCIONES_PARA _ELLOS/212_VIP_BLACK.png',
        category: 'designer',
        brand: 'Carolina Herrera',
        notes: ['Anís', 'Vodka', 'Almizcle'],
        price: 400000
    },
    {
        id: 6,
        name: 'CH Privé',
        description: 'Lujo privado y sofisticación en cada gota.',
        image: '../LOCIONES_PARA _ELLOS/CH_PRIVE.png',
        category: 'designer',
        brand: 'Carolina Herrera',
        notes: ['Whisky', 'Madera', 'Cuero'],
        price: 420000
    },
    {
        id: 7,
        name: 'Bad Boy',
        description: 'La rebeldía elegante hecha fragancia.',
        image: '../LOCIONES_PARA _ELLOS/BAD_BOY.png',
        category: 'designer',
        brand: 'Carolina Herrera',
        notes: ['Pimienta', 'Cacao', 'Ámbar'],
        price: 410000
    },
    // Paco Rabanne
    {
        id: 8,
        name: 'One Million',
        description: 'El aroma del éxito y el lujo en su máxima expresión.',
        image: '../LOCIONES_PARA _ELLOS/ONE_MILLON_PACO_RABANE.png',
        category: 'designer',
        brand: 'Paco Rabanne',
        notes: ['Canela', 'Cuero', 'Ámbar'],
        price: 390000
    },
    {
        id: 9,
        name: 'One Million Elixir',
        description: 'La versión más intensa y seductora de One Million.',
        image: '../LOCIONES_PARA _ELLOS/ONE_MILLION_ELIXIR.png',
        category: 'designer',
        brand: 'Paco Rabanne',
        notes: ['Rosa', 'Vainilla', 'Benzoin'],
        price: 450000
    },
    {
        id: 10,
        name: 'One Million Lucky',
        description: 'La suerte dorada en una fragancia irresistible.',
        image: '../LOCIONES_PARA _ELLOS/ONE_MILLION_LUCKY.png',
        category: 'designer',
        brand: 'Paco Rabanne',
        notes: ['Ciruela', 'Avellana', 'Miel'],
        price: 405000
    },
    {
        id: 11,
        name: 'Invictus',
        description: 'El aroma de la victoria absoluta.',
        image: '../LOCIONES_PARA _ELLOS/INVICTUS.png',
        category: 'designer',
        brand: 'Paco Rabanne',
        notes: ['Pomelo', 'Hoja de Laurel', 'Ámbar Gris'],
        price: 380000
    },
    {
        id: 12,
        name: 'Invictus Aqua',
        description: 'Frescura acuática para el guerrero moderno.',
        image: '../LOCIONES_PARA _ELLOS/INVICTUS_AQUA.png',
        category: 'designer',
        brand: 'Paco Rabanne',
        notes: ['Yuzu', 'Violeta', 'Ámbar Gris'],
        price: 385000
    },
    {
        id: 13,
        name: 'Phantom',
        description: 'Futurista y enigmático, una experiencia olfativa única.',
        image: '../LOCIONES_PARA _ELLOS/PHANTOM.png',
        category: 'designer',
        brand: 'Paco Rabanne',
        notes: ['Limón', 'Lavanda', 'Vainilla'],
        price: 400000
    },
    // Montblanc
    {
        id: 14,
        name: 'Montblanc Legend Night',
        description: 'La elegancia de la noche capturada en una fragancia misteriosa.',
        image: '../LOCIONES_PARA _ELLOS/MONTBLACK_LEGEND_NIGH.png',
        category: 'designer',
        brand: 'Montblanc',
        notes: ['Menta', 'Lavanda', 'Musgo'],
        price: 350000
    },
    {
        id: 15,
        name: 'Montblanc Legend',
        description: 'Clásica y atemporal, para el hombre de carácter.',
        image: '../LOCIONES_PARA _ELLOS/MONTBLANC_LEGEND.png',
        category: 'designer',
        brand: 'Montblanc',
        notes: ['Bergamota', 'Coumarin', 'Sándalo'],
        price: 340000
    },
    {
        id: 16,
        name: 'Montblanc Explorer',
        description: 'Para el hombre aventurero que busca nuevos horizontes.',
        image: '../LOCIONES_PARA _ELLOS/MONTBLANC_EXPLORER.png',
        category: 'designer',
        brand: 'Montblanc',
        notes: ['Bergamota', 'Vetiver', 'Cacao'],
        price: 345000
    },
    // Versace
    {
        id: 17,
        name: 'Versace Eros',
        description: 'El poder y la seducción del mediterráneo en estado puro.',
        image: '../LOCIONES_PARA _ELLOS/VERSACE_EROS_BLUE.png',
        category: 'designer',
        brand: 'Versace',
        notes: ['Menta', 'Vainilla', 'Tonka'],
        price: 410000
    },
    {
        id: 18,
        name: 'Dylan Blue',
        description: 'Frescura mediterránea con un toque moderno.',
        image: '../LOCIONES_PARA _ELLOS/DYLAN_BLUE.png',
        category: 'designer',
        brand: 'Versace',
        notes: ['Bergamota', 'Papiro', 'Almizcle'],
        price: 395000
    },
    {
        id: 19,
        name: 'Pour Homme',
        description: 'Elegancia clásica de Versace para el hombre sofisticado.',
        image: '../LOCIONES_PARA _ELLOS/POUR_HOMME.png',
        category: 'designer',
        brand: 'Versace',
        notes: ['Limón', 'Geranio', 'Cedro'],
        price: 370000
    },
    {
        id: 20,
        name: 'Eros Flame',
        description: 'La pasión ardiente de Eros en su máxima expresión.',
        image: '../LOCIONES_PARA _ELLOS/EROS_FLAME.png',
        category: 'designer',
        brand: 'Versace',
        notes: ['Mandarina', 'Geranio', 'Sándalo'],
        price: 420000
    },
    // Giorgio Armani
    {
        id: 21,
        name: 'Acqua di Gio',
        description: 'Frescura marina inspirada en la isla de Pantelleria.',
        image: '../LOCIONES_PARA _ELLOS/ACQUA_DI_GIO.png',
        category: 'designer',
        brand: 'Giorgio Armani',
        notes: ['Bergamota', 'Jazmín', 'Cedro'],
        price: 430000
    },
    {
        id: 22,
        name: 'Acqua di Gio Profumo',
        description: 'Versión más intensa y sofisticada del clásico.',
        image: '../LOCIONES_PARA _ELLOS/ACQUA_DI_GIO_PROFUMO.png',
        category: 'designer',
        brand: 'Giorgio Armani',
        notes: ['Bergamota', 'Geranio', 'Pachulí'],
        price: 460000
    },
    {
        id: 23,
        name: 'Armani Code',
        description: 'Misterioso y seductor, el código de la seducción.',
        image: '../LOCIONES_PARA _ELLOS/ARMANI_CODE.png',
        category: 'designer',
        brand: 'Giorgio Armani',
        notes: ['Bergamota', 'Anís', 'Tonka'],
        price: 440000
    },
    // Christian Dior
    {
        id: 24,
        name: 'Sauvage',
        description: 'Salvaje y libre, inspirado en los grandes espacios.',
        image: '../LOCIONES_PARA _ELLOS/SAUVAGE.png',
        category: 'designer',
        brand: 'Christian Dior',
        notes: ['Bergamota', 'Pimienta', 'Ambroxan'],
        price: 480000
    },
    {
        id: 25,
        name: 'Sauvage Elixir',
        description: 'La concentración más intensa de Sauvage.',
        image: '../LOCIONES_PARA _ELLOS/SAUVAGE_ELIXIR.png',
        category: 'designer',
        brand: 'Christian Dior',
        notes: ['Canela', 'Cardamomo', 'Sándalo'],
        price: 550000
    },
    {
        id: 26,
        name: 'Fahrenheit',
        description: 'Revolucionario y único, un clásico atemporal.',
        image: '../LOCIONES_PARA _ELLOS/FAHRENHEIT.png',
        category: 'designer',
        brand: 'Christian Dior',
        notes: ['Madreselva', 'Sándalo', 'Cuero'],
        price: 470000
    },
    // Chanel
    {
        id: 27,
        name: 'Bleu de Chanel',
        description: 'La definición de la elegancia masculina francesa.',
        image: '../LOCIONES_PARA _ELLOS/BLEU_CHANEL.png',
        category: 'designer',
        brand: 'Chanel',
        notes: ['Pomelo', 'Incienso', 'Cedro'],
        price: 520000
    },
    {
        id: 28,
        name: 'Allure Sport',
        description: 'Deportivo y elegante, perfecto para cualquier ocasión.',
        image: '../LOCIONES_PARA _ELLOS/ALLURE_SPORT.png',
        category: 'designer',
        brand: 'Chanel',
        notes: ['Mandarina', 'Pimienta', 'Cedro'],
        price: 500000
    },

    // MARCAS ÁRABES
    {
        id: 29,
        name: 'Khamrah',
        description: 'Lujo árabe con notas especiadas y amaderadas.',
        image: '../LOCIONES_PARA _ELLOS/KHAMRAH.png',
        category: 'arabic',
        brand: 'Lattafa',
        notes: ['Canela', 'Nuez Moscada', 'Oud'],
        price: 280000
    },
    {
        id: 30,
        name: 'Bade\'e Al Oud Amethyst',
        description: 'Precioso como una joya, intenso como el oud.',
        image: '../LOCIONES_PARA _ELLOS/BADEE_AL_OUD_AMETHYST.png',
        category: 'arabic',
        brand: 'Lattafa',
        notes: ['Rosa', 'Oud', 'Ámbar'],
        price: 290000
    },
    {
        id: 31,
        name: 'Bharara King',
        description: 'Realeza olfativa con notas orientales exquisitas.',
        image: '../LOCIONES_PARA _ELLOS/BHARARA_KING.png',
        category: 'arabic',
        brand: 'Bharara',
        notes: ['Azafrán', 'Rosa', 'Oud'],
        price: 320000
    },
    {
        id: 32,
        name: 'Oud Saffron',
        description: 'La nobleza del azafrán combinada con el oud.',
        image: '../LOCIONES_PARA _ELLOS/OUD_SAFFRON.png',
        category: 'arabic',
        brand: 'Orientica',
        notes: ['Azafrán', 'Rosa', 'Oud'],
        price: 300000
    },
    {
        id: 33,
        name: 'Royal Amber',
        description: 'Ámbar real para una experiencia olfativa majestuosa.',
        image: '../LOCIONES_PARA _ELLOS/ROYAL_AMBER.png',
        category: 'arabic',
        brand: 'Orientica',
        notes: ['Ámbar', 'Rosa', 'Almizcle'],
        price: 290000
    },
    {
        id: 34,
        name: 'Amber Oud Gold',
        description: 'Oro líquido con notas orientales preciosas.',
        image: '../LOCIONES_PARA _ELLOS/AMBER_OUD_GOLD.png',
        category: 'arabic',
        brand: 'Al Haramain',
        notes: ['Ámbar', 'Oud', 'Rosa'],
        price: 310000
    },
    {
        id: 35,
        name: 'Asad',
        description: 'Fuerza y nobleza en una fragancia oriental.',
        image: '../LOCIONES_PARA _ELLOS/ASAD.png',
        category: 'arabic',
        brand: 'Lattafa',
        notes: ['Bergamota', 'Oud', 'Ámbar'],
        price: 275000
    },

    // PERFUMERÍA CONTEMPORÁNEA/ALTERNATIVA
    {
        id: 36,
        name: 'Aventus',
        description: 'El perfume de los vencedores, icónico y poderoso.',
        image: '../LOCIONES_PARA _ELLOS/AVENTUS.png',
        category: 'contemporary',
        brand: 'Creed',
        notes: ['Piña', 'Abedul', 'Almizcle'],
        price: 850000
    },
    {
        id: 37,
        name: 'Silver Mountain Water',
        description: 'Frescura alpina cristalina y sofisticada.',
        image: '../LOCIONES_PARA _ELLOS/SILVER_MOUNTAIN.png',
        category: 'contemporary',
        brand: 'Creed',
        notes: ['Bergamota', 'Grosellas', 'Almizcle'],
        price: 780000
    },
    {
        id: 38,
        name: 'Millésime Imperial',
        description: 'Lujo imperial con notas frutales y marinas.',
        image: '../LOCIONES_PARA _ELLOS/MILLESIME_IMPERIAL.png',
        category: 'contemporary',
        brand: 'Creed',
        notes: ['Frutas', 'Sal Marina', 'Sándalo'],
        price: 820000
    },
    {
        id: 39,
        name: 'Layton',
        description: 'Aristocracia olfativa con notas especiadas y dulces.',
        image: '../LOCIONES_PARA _ELLOS/LAYTON.png',
        category: 'contemporary',
        brand: 'Parfums de Marly',
        notes: ['Manzana', 'Lavanda', 'Vainilla'],
        price: 650000
    },
    {
        id: 40,
        name: 'Santal 33',
        description: 'Sándalo moderno y minimalista de alta perfumería.',
        image: '../LOCIONES_PARA _ELLOS/SANTAL_33.png',
        category: 'contemporary',
        brand: 'Le Labo',
        notes: ['Sándalo', 'Papiro', 'Cuero'],
        price: 720000
    },
    {
        id: 41,
        name: 'Club de Nuit',
        description: 'Elegancia nocturna con notas frescas y amaderadas.',
        image: '../LOCIONES_PARA _ELLOS/CLUB_DE_NUIT.png',
        category: 'contemporary',
        brand: 'Armaf',
        notes: ['Limón', 'Rosa', 'Vainilla'],
        price: 220000
    },
    {
        id: 42,
        name: 'Toy Boy',
        description: 'Rebeldía elegante y sofisticación contemporánea.',
        image: '../LOCIONES_PARA _ELLOS/TOY_BOY.png',
        category: 'contemporary',
        brand: 'Moschino',
        notes: ['Pera', 'Nuez Moscada', 'Cashmeran'],
        price: 360000
    }
];

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Asegurarse de que los elementos necesarios existan antes de inicializar
    const checkElements = setInterval(() => {
        const grid = document.querySelector('.index-grid');
        const filters = document.querySelector('.index-filters');
        const modal = document.querySelector('.quick-view-modal');
        
        if (grid && filters && modal) {
            clearInterval(checkElements);
            initializeProducts();
            initializeFilters();
            initializeModal();
            console.log('✓ Página de productos inicializada');
        }
    }, 100);
});

function initializeProducts() {
    renderProducts('all');
}

function initializeFilters() {
    document.querySelectorAll('.index-filter').forEach(filter => {
        filter.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Actualizar filtros activos
            document.querySelectorAll('.index-filter').forEach(f => {
                f.classList.remove('active');
            });
            this.classList.add('active');
            
            // Renderizar productos filtrados
            renderProducts(category);
        });
    });
}

function renderProducts(category) {
    const grid = document.querySelector('.index-grid');
    if (!grid) {
        console.error('Grid container not found');
        return;
    }

    const filteredProducts = category === 'all' ? 
        products : 
        products.filter(p => p.category === category);
    
    grid.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div class="no-products">
                <p>No se encontraron productos en esta categoría.</p>
            </div>
        `;
        return;
    }
    
    // Función para formatear precio en COP
    function formatPrice(price) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    }

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'index-item';
        productCard.innerHTML = `
            <div class="index-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="index-info">
                <h3>${product.name}</h3>
                <p class="index-brand">${product.brand}</p>
                <p class="index-price">${formatPrice(product.price)}</p>
                <p class="index-description">${product.description}</p>
                <p class="index-notes">${product.notes.join(' · ')}</p>
            </div>
        `;
        
        productCard.addEventListener('click', () => showQuickView(product));
        grid.appendChild(productCard);
    });

    console.log(`✓ Renderizados ${filteredProducts.length} productos de la categoría ${category}`);
}

function initializeModal() {
    const modal = document.querySelector('.quick-view-modal');
    if (!modal) {
        console.error('Modal not found');
        return;
    }

    const closeBtn = modal.querySelector('.close-modal');
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
    
    // Cerrar al hacer click fuera del contenido
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

function showQuickView(product) {
    const modal = document.querySelector('.quick-view-modal');
    const modalBody = modal.querySelector('.modal-body');
    
    // Función para formatear precio en COP
    function formatPrice(price) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    }
    
    // Limpiar el contenido anterior
    modalBody.innerHTML = '';
    
    // Crear el lado izquierdo
    const modalLeft = document.createElement('div');
    modalLeft.className = 'modal-left';
    modalLeft.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="modal-image">
    `;
    
    // Crear el lado derecho
    const modalRight = document.createElement('div');
    modalRight.className = 'modal-right';
    modalRight.innerHTML = `
        <h2>${product.name}</h2>
        <p class="modal-brand">${product.brand}</p>
        <p class="modal-price">${formatPrice(product.price)}</p>
        <p class="modal-description">${product.description}</p>
        <div class="modal-notes">
            <h4>Notes de Tête</h4>
            <p>${product.notes.join(' · ')}</p>
        </div>
        <div class="modal-actions">
            <button class="modal-btn discover">Découvrir</button>
            <button class="modal-btn reserve">Réserver</button>
        </div>
    `;
    
    // Añadir los elementos al modal
    modalBody.appendChild(modalLeft);
    modalBody.appendChild(modalRight);
    
    modal.classList.add('active');
}
