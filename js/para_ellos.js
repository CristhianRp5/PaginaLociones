// Para Ellos - Integración con Supabase (Versión Final)
class ParaEllosManager {
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
    }    async init() {
        console.log('🚀 Inicializando ParaEllosManager...');
        
        // Verificar que Supabase esté disponible sin crear múltiples instancias
        if (typeof window.supabase === 'undefined' && typeof initSupabase === 'function') {
            console.log('🔄 Inicializando Supabase...');
            initSupabase();
        }
        
        // Verificar dependencias
        const dependencies = this.checkDependencies();
        if (Object.values(dependencies).some(dep => !dep)) {
            console.error('❌ Algunas dependencias no están disponibles:', dependencies);
            return;
        }
        
        await this.loadProducts();
        this.setupEventListeners();
        this.renderProducts();
        this.setupFilters();
        this.setupPriceFilter();
        
        console.log('✅ ParaEllosManager inicializado completamente');
    }    async loadProducts() {
        try {
            console.log('📦 Cargando productos para ellos...');
            
            // Verificar que ProductosService esté disponible
            if (typeof ProductosService === 'undefined') {
                console.error('❌ ProductosService no está disponible');
                this.productos = [];
                this.filteredProducts = [];
                return;
            }
            
            // Cargar productos específicos para hombres
            this.productos = await ProductosService.obtenerProductosPorCategoria('para-ellos');
            this.filteredProducts = [...this.productos];
            
            console.log(`✅ ${this.productos.length} productos cargados para ellos:`, this.productos);
            
            if (this.productos.length === 0) {
                console.warn('⚠️ No se encontraron productos para la categoría "para-ellos"');
            }
            
        } catch (error) {
            console.error('❌ Error cargando productos:', error);
            this.productos = [];
            this.filteredProducts = [];
        }
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
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.activeFilters.search = e.target.value;
                this.applyFilters();
            });
        }

        // Clear search button
        const clearSearch = document.getElementById('clearSearch');
        if (clearSearch) {
            clearSearch.addEventListener('click', () => {
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.value = '';
                    this.activeFilters.search = '';
                    this.applyFilters();
                }
            });
        }

        // Category filters
        const categoryFilters = document.querySelectorAll('.index-filter');
        categoryFilters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                e.preventDefault();
                
                categoryFilters.forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                
                this.activeFilters.category = filter.dataset.category || '';
                this.applyFilters();
            });
        });

        // Pagination
        this.setupPagination();
    }

    applyFilters() {
        let filtered = [...this.productos];

        // Search filter
        if (this.activeFilters.search) {
            const searchTerm = this.activeFilters.search.toLowerCase();
            filtered = filtered.filter(product => 
                product.nombre?.toLowerCase().includes(searchTerm) ||
                product.marca?.toLowerCase().includes(searchTerm) ||
                product.descripcion?.toLowerCase().includes(searchTerm)
            );
        }

        // Category filter
        if (this.activeFilters.category && this.activeFilters.category !== 'all') {
            filtered = filtered.filter(product => 
                product.subcategoria === this.activeFilters.category ||
                product.tipo === this.activeFilters.category
            );
        }

        // Brand filter
        if (this.activeFilters.brand) {
            filtered = filtered.filter(product => product.marca === this.activeFilters.brand);
        }

        // Subcategory filter
        if (this.activeFilters.subcategoria) {
            filtered = filtered.filter(product => product.subcategoria === this.activeFilters.subcategoria);
        }

        // Price filter
        filtered = filtered.filter(product => {
            const price = product.precio || 0;
            return price >= this.activeFilters.priceMin && price <= this.activeFilters.priceMax;
        });

        this.filteredProducts = filtered;
        this.currentPage = 1;
        this.renderProducts();
        this.updateSearchResults();
    }    renderProducts() {
        console.log('🎨 Renderizando productos...');
        
        const container = document.querySelector('.index-grid');
        if (!container) {
            console.error('❌ Contenedor .index-grid no encontrado');
            return;
        }

        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        const currentProducts = this.filteredProducts.slice(startIndex, endIndex);

        console.log(`📄 Página ${this.currentPage}: mostrando ${currentProducts.length} de ${this.filteredProducts.length} productos`);

        if (currentProducts.length === 0) {
            container.innerHTML = `
                <div class="no-products">
                    <h3>No se encontraron productos</h3>
                    <p>Total de productos disponibles: ${this.productos.length}</p>
                    <p>Productos filtrados: ${this.filteredProducts.length}</p>
                    <p>Intenta ajustar los filtros de búsqueda</p>
                </div>
            `;
            return;
        }        const productsHTML = currentProducts.map(product => {
            // Generar etiqueta de estado
            const estado = product.estado || 'disponible';
            const estadoBadge = this.getEstadoBadge(estado);
            
            // Calcular precios si hay descuento
            const precioInfo = this.getPrecioInfo(product);
            
            return `
            <div class="index-item" data-product-id="${product.id}">
                <div class="item-image">
                    <img src="${product.imagen_url || product.imagen || '../IMAGENES/placeholder.svg'}" 
                         alt="${product.nombre}"
                         loading="lazy"
                         onerror="this.src='../IMAGENES/placeholder.svg'; console.log('⚠️ Error cargando imagen para: ${product.nombre}');">
                    ${estadoBadge}
                    <div class="item-overlay">
                        <button class="quick-view-btn" onclick="window.paraEllosManager.showQuickView(${product.id})">
                            Vista Rápida
                        </button>
                    </div>
                </div>
                <div class="item-content">
                    <h3 class="item-title">${product.nombre || 'Sin nombre'}</h3>
                    <p class="item-brand">${product.marca || 'Sin marca'}</p>
                    <div class="item-price">${precioInfo}</div>
                    <div class="item-category">${product.subcategoria || product.categoria || 'Sin categoría'}</div>
                </div>
            </div>
            `;
        }).join('');

        container.innerHTML = productsHTML;
        this.updatePagination();        
        console.log(`✅ ${currentProducts.length} productos renderizados exitosamente`);
    }

    formatPrice(price) {
        return new Intl.NumberFormat('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    }

    showQuickView(productId) {
        const product = this.productos.find(p => p.id === productId);
        if (!product) return;

        const modal = document.querySelector('.quick-view-modal');
        const modalBody = modal.querySelector('.modal-body');

        modalBody.innerHTML = `
            <div class="quick-view-content">
                <div class="quick-view-image">
                    <img src="${product.imagen_url || product.imagen || '../IMAGENES/placeholder.jpg'}" 
                         alt="${product.nombre}">
                </div>
                <div class="quick-view-info">
                    <h2>${product.nombre}</h2>
                    <p class="brand">${product.marca || ''}</p>
                    <p class="price">$${this.formatPrice(product.precio || 0)}</p>
                    <p class="description">${product.descripcion || ''}</p>
                    ${product.notas ? `
                        <div class="notes">
                            <h4>Notas:</h4>
                            <p>${Array.isArray(product.notas) ? product.notas.join(', ') : product.notas}</p>
                        </div>
                    ` : ''}
                    <div class="actions">
                        <button class="add-to-cart-btn" onclick="window.paraEllosManager.addToCart(${product.id})">
                            Agregar al Carrito
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Close modal functionality
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.onclick = () => this.closeQuickView();

        modal.onclick = (e) => {
            if (e.target === modal) this.closeQuickView();
        };
    }

    closeQuickView() {
        const modal = document.querySelector('.quick-view-modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    addToCart(productId) {
        const product = this.productos.find(p => p.id === productId);
        if (!product) return;

        // Aquí puedes implementar la lógica del carrito
        console.log('Producto agregado al carrito:', product);
        
        // Mostrar notificación
        this.showNotification(`${product.nombre} agregado al carrito`);
    }

    showNotification(message) {
        // Crear y mostrar notificación
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    setupPriceFilter() {
        const minSlider = document.getElementById('minPriceSlider');
        const maxSlider = document.getElementById('maxPriceSlider');
        const priceDisplay = document.getElementById('priceRangeDisplay');
        const resetButton = document.getElementById('resetPriceFilter');

        if (!minSlider || !maxSlider) return;

        // Obtener rango de precios de los productos
        const prices = this.productos.map(p => p.precio || 0).filter(p => p > 0);
        if (prices.length > 0) {
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            
            minSlider.min = minPrice;
            minSlider.max = maxPrice;
            minSlider.value = minPrice;
            
            maxSlider.min = minPrice;
            maxSlider.max = maxPrice;
            maxSlider.value = maxPrice;
            
            // Actualizar los filtros activos
            this.activeFilters.priceMin = minPrice;
            this.activeFilters.priceMax = maxPrice;
            
            // Actualizar la visualización inicial
            if (priceDisplay) {
                priceDisplay.textContent = `$${this.formatPrice(minPrice)} - $${this.formatPrice(maxPrice)}`;
            }
        }

        const updatePriceRange = () => {
            const min = parseInt(minSlider.value);
            const max = parseInt(maxSlider.value);

            if (min > max) {
                minSlider.value = max;
                maxSlider.value = min;
            }

            this.activeFilters.priceMin = parseInt(minSlider.value);
            this.activeFilters.priceMax = parseInt(maxSlider.value);

            if (priceDisplay) {
                priceDisplay.textContent = `$${this.formatPrice(this.activeFilters.priceMin)} - $${this.formatPrice(this.activeFilters.priceMax)}`;
            }

            this.applyFilters();
        };

        minSlider.addEventListener('input', updatePriceRange);
        maxSlider.addEventListener('input', updatePriceRange);

        if (resetButton) {
            resetButton.addEventListener('click', () => {
                minSlider.value = minSlider.min;
                maxSlider.value = maxSlider.max;
                updatePriceRange();
            });
        }

        // Inicializar y aplicar filtros
        updatePriceRange();
        this.applyFilters();
    }

    setupPagination() {
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderProducts();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.renderProducts();
                }
            });
        }
    }

    updatePagination() {
        const totalProducts = this.filteredProducts.length;
        const totalPages = Math.ceil(totalProducts / this.productsPerPage);
        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = Math.min(startIndex + this.productsPerPage, totalProducts);

        // Update pagination info
        const paginationInfo = document.getElementById('paginationInfo');
        if (paginationInfo) {
            paginationInfo.textContent = `Mostrando ${startIndex + 1}-${endIndex} de ${totalProducts} fragancias`;
        }

        // Update pagination buttons
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');

        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= totalPages;
        }

        // Update pagination numbers
        const paginationNumbers = document.getElementById('paginationNumbers');
        if (paginationNumbers && totalPages > 1) {
            let numbersHTML = '';
            
            for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                    numbersHTML += `
                        <button class="pagination-number ${i === this.currentPage ? 'active' : ''}" 
                                onclick="window.paraEllosManager.goToPage(${i})">
                            ${i}
                        </button>
                    `;
                } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                    numbersHTML += '<span class="pagination-ellipsis">...</span>';
                }
            }
            
            paginationNumbers.innerHTML = numbersHTML;
        }
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderProducts();
    }

    updateSearchResults() {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        if (this.activeFilters.search) {
            searchResults.style.display = 'block';
            searchResults.textContent = `${this.filteredProducts.length} resultados para "${this.activeFilters.search}"`;
        } else {
            searchResults.style.display = 'none';
        }

        // Show/hide clear search button
        const clearSearch = document.getElementById('clearSearch');
        if (clearSearch) {
            clearSearch.style.display = this.activeFilters.search ? 'block' : 'none';
        }
    }

    async setupFilters() {
        // Configurar filtros dinámicos basados en los productos
        if (this.productos.length === 0) return;

        // Obtener marcas únicas
        const brands = [...new Set(this.productos.map(p => p.marca).filter(Boolean))].sort();
        
        // Obtener subcategorías únicas
        const subcategorias = [...new Set(this.productos.map(p => p.subcategoria).filter(Boolean))].sort();

        // Crear filtros de marca si hay contenedor
        const brandContainer = document.querySelector('.filter-brands');
        if (brandContainer && brands.length > 0) {
            const brandsHTML = brands.map(brand => `
                <button class="filter-btn" data-filter-type="marca" data-filter-value="${brand}">
                    ${brand}
                </button>
            `).join('');

            brandContainer.innerHTML = `
                <h4>Marcas</h4>
                <div class="filter-buttons">
                    <button class="filter-btn active" data-filter-type="marca" data-filter-value="">
                        Todas
                    </button>
                    ${brandsHTML}
                </div>
            `;
        }

        // Crear filtros de subcategoría si hay contenedor
        const subcategoryContainer = document.querySelector('.filter-subcategories');
        if (subcategoryContainer && subcategorias.length > 0) {
            const subcategoriasHTML = subcategorias.map(sub => `
                <button class="filter-btn" data-filter-type="subcategoria" data-filter-value="${sub}">
                    ${sub}
                </button>
            `).join('');

            subcategoryContainer.innerHTML = `
                <h4>Tipos</h4>
                <div class="filter-buttons">
                    <button class="filter-btn active" data-filter-type="subcategoria" data-filter-value="">
                        Todos
                    </button>
                    ${subcategoriasHTML}
                </div>
            `;
        }

        // Agregar event listeners a los filtros dinámicos
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                const filterType = btn.dataset.filterType;
                const filterValue = btn.dataset.filterValue;
                
                // Remover active de botones del mismo tipo
                const sameTypeButtons = document.querySelectorAll(`[data-filter-type="${filterType}"]`);
                sameTypeButtons.forEach(b => b.classList.remove('active'));
                
                // Agregar active al botón clickeado
                btn.classList.add('active');
                
                // Aplicar filtro
                if (filterType === 'marca') {
                    this.activeFilters.brand = filterValue;
                } else if (filterType === 'subcategoria') {
                    this.activeFilters.subcategoria = filterValue;
                }
                
                this.applyFilters();
            });
        });
    }

    // Método para forzar recarga de productos (útil después de agregar nuevos productos)
    async forceReloadProducts() {
        console.log('🔄 Forzando recarga de productos...');
        try {
            this.productos = [];
            this.filteredProducts = [];
            
            // Recargar productos
            await this.loadProducts();
            this.applyFilters();
            this.renderProducts();
            
            console.log('✅ Productos recargados exitosamente');
        } catch (error) {
            console.error('❌ Error recargando productos:', error);
        }
    }

    // Función auxiliar para generar etiqueta de estado
    getEstadoBadge(estado) {
        const estadoMap = {
            'disponible': { text: 'Disponible', class: 'estado-disponible' },
            'agotado': { text: 'Agotado', class: 'estado-agotado' },
            'proximo': { text: 'Próximamente', class: 'estado-proximo' },
            'oferta': { text: 'En Oferta', class: 'estado-oferta' }
        };
        
        const estadoInfo = estadoMap[estado] || estadoMap['disponible'];
        
        return `<span class="estado-badge ${estadoInfo.class}">${estadoInfo.text}</span>`;
    }
    
    // Función auxiliar para generar información de precio
    getPrecioInfo(product) {
        const precio = product.precio || 0;
        const estado = product.estado || 'disponible';
        const descuento = product.descuento || 0;
        
        if (estado === 'oferta' && descuento > 0) {
            const precioConDescuento = precio - (precio * descuento / 100);
            return `
                <div class="precio-con-descuento">
                    <span class="precio-original">$${this.formatPrice(precio)}</span>
                    <span class="precio-oferta">$${this.formatPrice(precioConDescuento)}</span>
                    <span class="descuento-badge">-${descuento}%</span>
                </div>
            `;
        } else {
            return `$${this.formatPrice(precio)}`;
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, verificando dependencias...');
    
    // Verificar que el contenedor exista antes de inicializar
    const checkContainer = () => {
        const container = document.querySelector('.index-grid');
        if (container) {
            console.log('✅ Contenedor encontrado, inicializando ParaEllosManager...');
            setTimeout(() => {
                window.paraEllosManager = new ParaEllosManager();
                
                // Agregar botón de recarga para debugging
                addDebugControls();
            }, 200);
        } else {
            console.log('⏳ Esperando contenedor .index-grid...');
            setTimeout(checkContainer, 100);
        }
    };
    
    // Verificar dependencias antes de inicializar
    const checkDependencies = () => {
        const hasSupabase = typeof window.supabase !== 'undefined';
        const hasConfig = typeof initSupabase === 'function';
        const hasService = typeof ProductosService !== 'undefined';
        
        if (hasSupabase && hasConfig && hasService) {
            console.log('✅ Todas las dependencias disponibles');
            checkContainer();
        } else {
            console.log('⏳ Esperando dependencias...', {
                supabase: hasSupabase,
                config: hasConfig,
                service: hasService
            });
            setTimeout(checkDependencies, 100);
        }
    };
    
    checkDependencies();
});

// Función para agregar controles de debugging
function addDebugControls() {
    // Solo agregar en modo debug (si hay parámetro en URL)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') === 'true') {
        const debugDiv = document.createElement('div');
        debugDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            z-index: 10000;
            font-family: monospace;
            font-size: 12px;
        `;
        
        debugDiv.innerHTML = `
            <div>Debug Controls</div>
            <button onclick="window.paraEllosManager.forceReloadProducts()" style="margin: 5px; padding: 5px;">🔄 Recargar</button>
            <button onclick="console.log('Productos:', window.paraEllosManager.productos)" style="margin: 5px; padding: 5px;">📦 Log Productos</button>
        `;
        
        document.body.appendChild(debugDiv);
        console.log('🛠️ Controles de debug agregados. Accede con ?debug=true');
    }
}
