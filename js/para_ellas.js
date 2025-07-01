// Para Ellas - Integración con Supabase (Versión Final)
class ParaEllasManager {
    constructor() {
        this.productos = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.productsPerPage = 12;
        this.activeFilters = {
            category: '',
            search: '',
            brand: '',
            subcategoria: '',
            priceMin: 0,
            priceMax: 10000000
        };
        
        this.init();
        this.initVideoHero();
    }

    // Inicializar el video hero
    initVideoHero() {
        document.addEventListener('DOMContentLoaded', () => {
            const video = document.querySelector('.hero-video');
            const overlay = document.querySelector('.video-overlay');
            const textContent = document.querySelector('.video-text-content');
            
            if (video) {
                // Asegurar que el video se reproduce automáticamente
                video.addEventListener('loadeddata', () => {
                    console.log('Video cargado correctamente');
                    video.play().catch(e => {
                        console.log('Error al reproducir video:', e);
                    });
                });
                
                // Forzar visibilidad del overlay
                if (overlay && textContent) {
                    overlay.style.display = 'flex';
                    overlay.style.zIndex = '10';
                    textContent.style.color = 'white';
                    textContent.style.visibility = 'visible';
                    textContent.style.opacity = '1';
                    
                    console.log('Overlay configurado correctamente');
                }
            }
        });
    }

    async init() {
        console.log('🚀 Inicializando ParaEllasManager...');
        
        // Hacer el manager disponible globalmente para reintentos
        window.paraEllasManager = this;
        
        this.showLoadingIndicator('Verificando dependencias...');
        
        // Verificar que Supabase esté disponible sin crear múltiples instancias
        if (typeof window.supabase === 'undefined' && typeof initSupabase === 'function') {
            console.log('🔄 Inicializando Supabase...');
            this.updateLoadingDetails('Configurando conexión a la base de datos...');
            initSupabase();
        }
        
        // Verificar dependencias
        const dependencies = this.checkDependencies();
        if (Object.values(dependencies).some(dep => !dep)) {
            console.error('❌ Algunas dependencias no están disponibles:', dependencies);
            this.hideLoadingIndicator();
            this.showError('Error de configuración', 'Faltan dependencias requeridas para cargar los productos');
            return;
        }
        
        this.updateLoadingDetails('Configurando eventos...');
        await this.loadProducts();
        
        this.updateLoadingDetails('Configurando interfaz...');
        this.setupEventListeners();
        this.renderProducts();
        this.setupFilters();
        this.setupPriceFilter();
        
        console.log('✅ ParaEllasManager inicializado completamente');
    }

    async loadProducts() {
        try {
            console.log('📦 Cargando productos para ellas...');
            this.showLoadingIndicator('Conectando con la base de datos...');
            
            // Verificar que ProductosService esté disponible
            if (typeof ProductosService === 'undefined') {
                console.error('❌ ProductosService no está disponible');
                this.hideLoadingIndicator();
                this.showError('Servicio de productos no disponible', 'ProductosService no está cargado correctamente');
                this.productos = [];
                this.filteredProducts = [];
                return;
            }
            
            this.updateLoadingDetails('Obteniendo productos para mujeres...');
            
            // Medir tiempo de carga
            const startTime = performance.now();
            
            // Cargar productos específicos para mujeres
            this.productos = await ProductosService.obtenerProductosPorCategoria('para-ellas');
            this.filteredProducts = [...this.productos];
            
            const endTime = performance.now();
            const loadTime = endTime - startTime;
            
            console.log(`✅ ${this.productos.length} productos cargados en ${loadTime.toFixed(2)}ms`);
            
            this.hideLoadingIndicator();
            
            if (this.productos.length === 0) {
                console.warn('⚠️ No se encontraron productos para la categoría "para-ellas"');
                this.showError('No se encontraron productos', 'No hay productos disponibles para la categoría "para-ellas"');
            } else {
                console.log(`✅ Productos cargados exitosamente:`, this.productos.slice(0, 3));
                console.log(`📊 Estadísticas: ${this.productos.length} productos, ${[...new Set(this.productos.map(p => p.marca))].length} marcas`);
            }
            
        } catch (error) {
            console.error('❌ Error cargando productos:', error);
            this.hideLoadingIndicator();
            this.showError('Error cargando productos', error.message);
            this.productos = [];
            this.filteredProducts = [];
        }
    }

    showLoadingIndicator(message = 'Cargando productos...') {
        const indicator = document.getElementById('loadingIndicator');
        const loadingText = indicator?.querySelector('.loading-text');
        
        if (indicator) {
            indicator.style.display = 'flex';
            if (loadingText) {
                loadingText.textContent = message;
            }
        }
        
        // También marcar el grid como loading
        const grid = document.querySelector('.index-grid');
        if (grid) {
            grid.classList.add('loading');
        }
    }

    updateLoadingDetails(details) {
        const loadingDetails = document.getElementById('loadingDetails');
        if (loadingDetails) {
            loadingDetails.textContent = details;
        }
    }

    hideLoadingIndicator() {
        const indicator = document.getElementById('loadingIndicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
        
        // Remover clase loading del grid
        const grid = document.querySelector('.index-grid');
        if (grid) {
            grid.classList.remove('loading');
        }
    }

    showError(title, message) {
        const container = document.querySelector('.index-grid');
        if (!container) return;
        
        container.innerHTML = `
            <div class="error-message">
                <h3>${title}</h3>
                <p>${message}</p>
                <p>Tiempo de carga: ${new Date().toLocaleTimeString()}</p>
                <button class="retry-button" onclick="window.paraEllasManager?.init()">
                    Reintentar carga
                </button>
            </div>
        `;
    }

    checkDependencies() {
        console.log('🔍 Verificando dependencias...');
        
        const dependencies = {
            'Supabase JS': typeof window.supabase !== 'undefined',
            'initSupabase': typeof initSupabase !== 'undefined',
            'ProductosService': typeof ProductosService !== 'undefined',
            'supabaseClient': typeof supabaseClient !== 'undefined'
        };
        
        Object.entries(dependencies).forEach(([name, available]) => {
            console.log(`${available ? '✅' : '❌'} ${name}: ${available ? 'Disponible' : 'NO DISPONIBLE'}`);
        });
        
        return dependencies;
    }

    setupEventListeners() {
        // Configurar event listeners para filtros y búsqueda
        this.setupSearchFilter();
        this.setupCategoryFilters();
        this.setupBrandFilter();
        this.setupSubcategoryFilters();
        this.setupPaginationEvents();
    }

    setupSearchFilter() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.activeFilters.search = e.target.value.toLowerCase();
                    this.applyFilters();
                }, 300);
            });
        }
    }

    setupCategoryFilters() {
        const categoryButtons = document.querySelectorAll('.filter-btn[data-filter-type="category"]');
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Actualizar clases activas
                categoryButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Aplicar filtro
                this.activeFilters.category = btn.dataset.filterValue;
                this.applyFilters();
            });
        });
    }

    setupBrandFilter() {
        const brandSelect = document.getElementById('brandFilter');
        if (brandSelect) {
            brandSelect.addEventListener('change', (e) => {
                this.activeFilters.brand = e.target.value;
                this.applyFilters();
            });
        }
    }

    setupSubcategoryFilters() {
        // Generar subcategorías dinámicamente
        this.renderSubcategoryFilters();
        
        // Configurar event listeners
        const subcategoryButtons = document.querySelectorAll('.filter-btn[data-filter-type="subcategoria"]');
        subcategoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                subcategoryButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.activeFilters.subcategoria = btn.dataset.filterValue;
                this.applyFilters();
            });
        });
    }

    renderSubcategoryFilters() {
        const subcategoryContainer = document.querySelector('.subcategory-filters');
        const subcategorias = [...new Set(this.productos.map(p => p.subcategoria).filter(Boolean))].sort();
        
        if (subcategoryContainer && subcategorias.length > 0) {
            const subcategoriasHTML = subcategorias.map(sub => `
                <button class="filter-btn" data-filter-type="subcategoria" data-filter-value="${sub}">
                    ${sub}
                </button>
            `).join('');
            
            subcategoryContainer.innerHTML = `
                <div class="filter-group">
                    <h4>Subcategorías</h4>
                    <button class="filter-btn active" data-filter-type="subcategoria" data-filter-value="">
                        Todas
                    </button>
                    ${subcategoriasHTML}
                </div>
            `;
            
            // Reconfigurar event listeners después de crear los botones
            const newButtons = subcategoryContainer.querySelectorAll('.filter-btn[data-filter-type="subcategoria"]');
            newButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    newButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    this.activeFilters.subcategoria = btn.dataset.filterValue;
                    this.applyFilters();
                });
            });
        }
    }

    setupPriceFilter() {
        const priceRange = document.getElementById('priceRange');
        const priceDisplay = document.getElementById('priceDisplay');
        
        if (priceRange && priceDisplay) {
            priceRange.addEventListener('input', (e) => {
                const maxPrice = parseInt(e.target.value);
                this.activeFilters.priceMax = maxPrice;
                priceDisplay.textContent = `Hasta $${new Intl.NumberFormat('es-CO').format(maxPrice)}`;
                
                // Aplicar filtro con debounce
                clearTimeout(this.priceFilterTimeout);
                this.priceFilterTimeout = setTimeout(() => {
                    this.applyFilters();
                }, 300);
            });
        }
    }

    applyFilters() {
        console.log('🔍 Aplicando filtros...', this.activeFilters);
        
        const startTime = performance.now();
        
        let filtered = [...this.productos];
        
        // Filtro de búsqueda
        if (this.activeFilters.search) {
            const searchTerm = this.activeFilters.search;
            filtered = filtered.filter(product => 
                product.nombre.toLowerCase().includes(searchTerm) ||
                product.marca.toLowerCase().includes(searchTerm) ||
                (product.descripcion && product.descripcion.toLowerCase().includes(searchTerm))
            );
        }
        
        // Filtro de categoría
        if (this.activeFilters.category) {
            filtered = filtered.filter(product => 
                product.subcategoria === this.activeFilters.category ||
                product.categoria === this.activeFilters.category
            );
        }
        
        // Filtro de marca
        if (this.activeFilters.brand) {
            filtered = filtered.filter(product => product.marca === this.activeFilters.brand);
        }
        
        // Filtro de subcategoría
        if (this.activeFilters.subcategoria) {
            filtered = filtered.filter(product => product.subcategoria === this.activeFilters.subcategoria);
        }
        
        // Filtro de precio
        filtered = filtered.filter(product => 
            product.precio >= this.activeFilters.priceMin && 
            product.precio <= this.activeFilters.priceMax
        );
        
        const endTime = performance.now();
        const filterTime = endTime - startTime;
        
        this.filteredProducts = filtered;
        this.currentPage = 1; // Reset pagination
        
        console.log(`🔍 Filtros aplicados en ${filterTime.toFixed(2)}ms: ${filtered.length}/${this.productos.length} productos`);
        
        this.renderProducts();
        this.updatePagination();
    }

    renderProducts() {
        const container = document.querySelector('.index-grid');
        if (!container) {
            console.error('❌ Contenedor .index-grid no encontrado');
            return;
        }
        
        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        const productsToShow = this.filteredProducts.slice(startIndex, endIndex);
        
        if (productsToShow.length === 0) {
            container.innerHTML = `
                <div class="no-products-message">
                    <h3>No se encontraron productos</h3>
                    <p>Intenta ajustar los filtros para ver más resultados</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = productsToShow.map(product => this.createProductCard(product)).join('');
        
        // Configurar event listeners para las tarjetas
        this.setupProductCardEvents();
        
        console.log(`📄 Página ${this.currentPage}: Mostrando ${productsToShow.length} productos`);
    }

    createProductCard(product) {
        const hasDiscount = product.estado === 'oferta' && product.descuento > 0;
        const finalPrice = hasDiscount ? product.precio * (1 - product.descuento / 100) : product.precio;
        
        return `
            <div class="product-card" data-product-id="${product.id}">
                ${product.luxury ? '<div class="luxury-badge">LUXURY</div>' : ''}
                ${hasDiscount ? `<div class="discount-badge">-${product.descuento}%</div>` : ''}
                ${product.estado === 'agotado' ? '<div class="stock-badge out-of-stock">AGOTADO</div>' : ''}
                ${product.estado === 'proximo' ? '<div class="stock-badge coming-soon">PRÓXIMAMENTE</div>' : ''}
                
                <div class="product-image">
                    <img src="${product.imagen_url || '../IMAGENES/PARA_ELLAS.png'}" 
                         alt="${product.nombre}"
                         onerror="this.src='../IMAGENES/PARA_ELLAS.png'">
                </div>
                
                <div class="product-info">
                    <h3 class="product-name">${product.nombre}</h3>
                    <p class="product-brand">${product.marca}</p>
                    ${product.subcategoria ? `<p class="product-subcategory">${product.subcategoria}</p>` : ''}
                    
                    <div class="product-price">
                        ${hasDiscount ? `
                            <span class="original-price">$${new Intl.NumberFormat('es-CO').format(product.precio)}</span>
                            <span class="final-price">$${new Intl.NumberFormat('es-CO').format(finalPrice)}</span>
                        ` : `
                            <span class="final-price">$${new Intl.NumberFormat('es-CO').format(product.precio)}</span>
                        `}
                    </div>
                    
                    ${product.ml ? `<p class="product-size">${product.ml}ml</p>` : ''}
                    
                    <button class="add-to-cart-btn" 
                            data-product-id="${product.id}"
                            ${product.estado === 'agotado' || product.estado === 'proximo' ? 'disabled' : ''}>
                        ${product.estado === 'agotado' ? 'Agotado' : 
                          product.estado === 'proximo' ? 'Próximamente' : 
                          'Agregar al Carrito'}
                    </button>
                </div>
            </div>
        `;
    }

    setupProductCardEvents() {
        // Event listeners para agregar al carrito
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = btn.dataset.productId;
                this.addToCart(productId);
            });
        });
        
        // Event listeners para ver detalles
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.addEventListener('click', () => {
                const productId = card.dataset.productId;
                this.showProductDetails(productId);
            });
        });
    }

    addToCart(productId) {
        const product = this.productos.find(p => p.id == productId);
        if (!product) {
            console.error('❌ Producto no encontrado:', productId);
            return;
        }
        
        if (product.estado === 'agotado' || product.estado === 'proximo') {
            console.warn('⚠️ Producto no disponible para agregar al carrito');
            return;
        }
        
        // Usar el carrito global si está disponible
        if (window.shoppingCart && typeof window.shoppingCart.addItem === 'function') {
            console.log('🛒 Agregando producto al carrito:', product.nombre);
            window.shoppingCart.addItem({
                id: product.id,
                nombre: product.nombre,
                marca: product.marca,
                precio: product.precio,
                imagen: product.imagen_url || '../IMAGENES/PARA_ELLAS.png',
                ml: product.ml
            });
        } else {
            console.error('❌ Sistema de carrito no disponible');
            alert('El sistema de carrito no está disponible en este momento');
        }
    }

    showProductDetails(productId) {
        const product = this.productos.find(p => p.id == productId);
        if (!product) return;
        
        // Implementar modal de detalles del producto
        console.log('👁️ Mostrando detalles del producto:', product.nombre);
        // TODO: Implementar modal de detalles
    }

    setupPaginationEvents() {
        // Los event listeners de paginación se configuran en updatePagination()
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        const paginationContainer = document.querySelector('.pagination');
        
        if (!paginationContainer || totalPages <= 1) {
            if (paginationContainer) paginationContainer.style.display = 'none';
            return;
        }
        
        paginationContainer.style.display = 'flex';
        
        let paginationHTML = '';
        
        // Botón anterior
        paginationHTML += `
            <button class="pagination-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                    data-page="${this.currentPage - 1}" ${this.currentPage === 1 ? 'disabled' : ''}>
                Anterior
            </button>
        `;
        
        // Números de página
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                            data-page="${i}">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += '<span class="pagination-ellipsis">...</span>';
            }
        }
        
        // Botón siguiente
        paginationHTML += `
            <button class="pagination-btn ${this.currentPage === totalPages ? 'disabled' : ''}" 
                    data-page="${this.currentPage + 1}" ${this.currentPage === totalPages ? 'disabled' : ''}>
                Siguiente
            </button>
        `;
        
        paginationContainer.innerHTML = paginationHTML;
        
        // Configurar event listeners
        const paginationButtons = paginationContainer.querySelectorAll('.pagination-btn:not(.disabled)');
        paginationButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const newPage = parseInt(btn.dataset.page);
                if (newPage && newPage !== this.currentPage) {
                    this.currentPage = newPage;
                    this.renderProducts();
                    this.updatePagination();
                    
                    // Scroll hacia arriba
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });
    }

    // Método para reinicializar el manager
    async reinitialize() {
        console.log('🔄 Reinicializando ParaEllasManager...');
        this.productos = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        await this.init();
    }

    // Método para forzar recarga de productos
    async reloadProducts() {
        console.log('🔄 Recargando productos...');
        await this.loadProducts();
        this.applyFilters();
    }

    // Método de debug para verificar el estado
    debugCart() {
        console.group('🛒 DEBUG DEL CARRITO EN PARA ELLAS');
        console.log('¿Existe window.shoppingCart?', !!window.shoppingCart);
        console.log('¿Es función addItem?', typeof window.shoppingCart?.addItem === 'function');
        console.log('¿Está inicializado el carrito?', window.shoppingCart?.isInitialized);
        console.log('Items en carrito:', window.shoppingCart?.items?.length || 0);
        console.groupEnd();
    }

    // Método para testing
    testAddToCart() {
        if (this.productos.length > 0) {
            const testProduct = this.productos.find(p => p.estado === 'disponible' || !p.estado);
            if (testProduct) {
                console.log('🧪 Testing agregar al carrito:', testProduct.nombre);
                this.addToCart(testProduct.id);
            }
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado, inicializando ParaEllasManager...');
    
    // Pequeño delay para asegurar que todas las dependencias estén cargadas
    setTimeout(() => {
        if (!window.paraEllasManager) {
            window.paraEllasManager = new ParaEllasManager();
        }
    }, 1000);
});

// También inicializar en window.load como backup
window.addEventListener('load', function() {
    if (!window.paraEllasManager) {
        console.log('🔄 Inicializando ParaEllasManager desde window.load...');
        window.paraEllasManager = new ParaEllasManager();
    }
});

// Hacer la clase disponible globalmente
window.ParaEllasManager = ParaEllasManager;
