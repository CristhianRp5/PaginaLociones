// Para Ellos - Integración con Supabase
class ParaEllosManager {
    constructor() {
        this.productos = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.productsPerPage = 12;
        this.activeFilters = {
            category: '',
            search: '',
            priceMin: 0,
            priceMax: 2000000
        };
        
        this.init();
    }

    async init() {
        // Inicializar Supabase si está disponible
        if (typeof initSupabase === 'function') {
            initSupabase();
        }
        
        await this.loadProducts();
        this.setupEventListeners();
        this.renderProducts();
        this.setupFilters();
    }

    async loadProducts() {
        try {
            // Cargar productos específicos para hombres
            this.productos = await ProductosService.obtenerProductosPorCategoria('para-ellos');
            this.filteredProducts = [...this.productos];
            console.log('Productos para ellos cargados:', this.productos.length);
        } catch (error) {
            console.error('Error cargando productos:', error);
            this.productos = [];
            this.filteredProducts = [];
        }
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

        // Price range sliders
        this.setupPriceFilter();

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

        // Price filter
        filtered = filtered.filter(product => {
            const price = product.precio || 0;
            return price >= this.activeFilters.priceMin && price <= this.activeFilters.priceMax;
        });

        this.filteredProducts = filtered;
        this.currentPage = 1;
        this.renderProducts();
        this.updateSearchResults();
    }

    renderProducts() {
        const container = document.querySelector('.index-grid');
        if (!container) return;

        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        const currentProducts = this.filteredProducts.slice(startIndex, endIndex);

        if (currentProducts.length === 0) {
            container.innerHTML = `
                <div class="no-products">
                    <h3>No se encontraron productos</h3>
                    <p>Intenta ajustar los filtros de búsqueda</p>
                </div>
            `;
            return;
        }

        const productsHTML = currentProducts.map(product => `
            <div class="index-item" data-product-id="${product.id}">
                <div class="item-image">
                    <img src="${product.imagen_url || product.imagen || '../IMAGENES/placeholder.jpg'}" 
                         alt="${product.nombre}" 
                         loading="lazy">
                    <div class="item-overlay">
                        <button class="quick-view-btn" onclick="window.paraEllosManager.showQuickView(${product.id})">
                            Vista Rápida
                        </button>
                    </div>
                </div>
                <div class="item-info">
                    <h3 class="item-name">${product.nombre}</h3>
                    <p class="item-brand">${product.marca || ''}</p>
                    <p class="item-price">$${this.formatPrice(product.precio || 0)}</p>
                    <div class="item-actions">
                        <button class="add-to-cart-btn" onclick="window.paraEllosManager.addToCart(${product.id})">
                            Agregar al Carrito
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = productsHTML;
        this.updatePagination();
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
            maxSlider.min = minPrice;
            maxSlider.max = maxPrice;
            
            this.activeFilters.priceMin = minPrice;
            this.activeFilters.priceMax = maxPrice;
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

        // Inicializar
        updatePriceRange();
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
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para que Supabase se cargue
    setTimeout(() => {
        window.paraEllosManager = new ParaEllosManager();
    }, 100);
});
