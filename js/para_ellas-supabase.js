// Para Ellas - Integración con Supabase
class ParaEllasManager {
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
        await this.loadProducts();
        this.setupEventListeners();
        this.renderProducts();
        this.setupFilters();
    }

    async loadProducts() {
        try {
            // Cargar productos específicos para mujeres
            this.productos = await ProductosService.obtenerProductosPorCategoria('para-ellas');
            this.filteredProducts = [...this.productos];
            console.log('Productos para ellas cargados:', this.productos.length);
        } catch (error) {
            console.error('Error cargando productos:', error);
            this.productos = [];
            this.filteredProducts = [];
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.activeFilters.search = e.target.value;
                this.applyFilters();
            });
        }

        // Category filters
        const categoryFilters = document.querySelectorAll('.category-filter');
        categoryFilters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Update active state
                categoryFilters.forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                
                this.activeFilters.category = filter.dataset.category || '';
                this.applyFilters();
            });
        });

        // Price slider
        const priceSlider = document.getElementById('price-slider');
        if (priceSlider && typeof noUiSlider !== 'undefined') {
            noUiSlider.create(priceSlider, {
                start: [0, 2000000],
                connect: true,
                range: {
                    'min': 0,
                    'max': 2000000
                },
                format: {
                    to: function (value) {
                        return Math.round(value);
                    },
                    from: function (value) {
                        return Number(value);
                    }
                }
            });

            priceSlider.noUiSlider.on('update', (values) => {
                this.activeFilters.priceMin = parseInt(values[0]);
                this.activeFilters.priceMax = parseInt(values[1]);
                
                // Update price display
                const priceMinEl = document.getElementById('price-min');
                const priceMaxEl = document.getElementById('price-max');
                if (priceMinEl) priceMinEl.textContent = formatearPrecio(parseInt(values[0]));
                if (priceMaxEl) priceMaxEl.textContent = formatearPrecio(parseInt(values[1]));
            });

            priceSlider.noUiSlider.on('change', () => {
                this.applyFilters();
            });
        }

        // Clear filters button
        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }
    }

    async applyFilters() {
        try {
            // Aplicar filtros para categoría "para-ellas" específicamente
            const filtros = { ...this.activeFilters, categoria: 'para-ellas' };
            this.filteredProducts = await ProductosService.obtenerProductos(filtros);
            this.currentPage = 1;
            this.renderProducts();
            this.updateCounters();
        } catch (error) {
            console.error('Error applying filters:', error);
        }
    }

    clearFilters() {
        // Reset filters
        this.activeFilters = {
            category: '',
            search: '',
            priceMin: 0,
            priceMax: 2000000
        };

        // Reset UI
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';

        const categoryFilters = document.querySelectorAll('.category-filter');
        categoryFilters.forEach(f => f.classList.remove('active'));
        
        const allFilter = document.querySelector('.category-filter[data-category=""]');
        if (allFilter) allFilter.classList.add('active');

        const priceSlider = document.getElementById('price-slider');
        if (priceSlider && priceSlider.noUiSlider) {
            priceSlider.noUiSlider.set([0, 2000000]);
        }

        this.applyFilters();
    }

    renderProducts() {
        const container = document.getElementById('products-grid');
        if (!container) return;

        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        const productsToShow = this.filteredProducts.slice(startIndex, endIndex);

        if (productsToShow.length === 0) {
            container.innerHTML = `
                <div class="no-products">
                    <div class="no-products-content">
                        <i class="fas fa-search"></i>
                        <h3>No se encontraron productos</h3>
                        <p>Intenta ajustar los filtros o realiza una nueva búsqueda</p>
                        <button class="btn-primary" onclick="paraEllasManager.clearFilters()">
                            Limpiar filtros
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        const productsHTML = productsToShow.map(product => this.createProductCard(product)).join('');
        container.innerHTML = productsHTML;

        this.renderPagination();
        this.setupModals();
    }

    createProductCard(product) {
        const price = formatearPrecio(product.precio);
        const image = product.imagen_principal || product.imagen;
        const brand = product.marcas?.nombre || product.marca;

        return `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="${image}" alt="${product.nombre}" loading="lazy">
                    <div class="product-overlay">
                        <button class="btn-details" onclick="paraEllasManager.openModal(${product.id})">
                            <i class="fas fa-eye"></i>
                            Ver detalles
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-brand">${brand}</div>
                    <h3 class="product-name">${product.nombre}</h3>
                    <p class="product-description">${product.descripcion_corta || product.descripcionCorta || ''}</p>
                    <div class="product-price">${price}</div>
                </div>
            </div>
        `;
    }

    renderPagination() {
        const container = document.getElementById('pagination');
        if (!container) return;

        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `
                <button class="btn-pagination" onclick="paraEllasManager.goToPage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                </button>
            `;
        }

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            const active = i === this.currentPage ? 'active' : '';
            paginationHTML += `
                <button class="btn-pagination ${active}" onclick="paraEllasManager.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        // Next button
        if (this.currentPage < totalPages) {
            paginationHTML += `
                <button class="btn-pagination" onclick="paraEllasManager.goToPage(${this.currentPage + 1})">
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }

        container.innerHTML = paginationHTML;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderProducts();
        
        // Smooth scroll to products grid
        const productsGrid = document.getElementById('products-grid');
        if (productsGrid) {
            productsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    updateCounters() {
        const resultsCounter = document.getElementById('results-counter');
        if (resultsCounter) {
            const total = this.filteredProducts.length;
            const start = (this.currentPage - 1) * this.productsPerPage + 1;
            const end = Math.min(start + this.productsPerPage - 1, total);
            
            resultsCounter.textContent = total > 0 
                ? `Mostrando ${start}-${end} de ${total} productos`
                : 'No se encontraron productos';
        }
    }

    async openModal(productId) {
        try {
            const product = await ProductosService.obtenerProductoPorId(productId);
            if (product) {
                this.showProductModal(product);
            }
        } catch (error) {
            console.error('Error loading product:', error);
        }
    }

    showProductModal(product) {
        const price = formatearPrecio(product.precio);
        const image = product.imagen_principal || product.imagen;
        const brand = product.marcas?.nombre || product.marca;

        const notasSalida = product.notas_salida || product.notasOlfativas?.salida || [];
        const notasCorazon = product.notas_corazon || product.notasOlfativas?.corazon || [];
        const notasFondo = product.notas_fondo || product.notasOlfativas?.fondo || [];

        const modalHTML = `
            <div class="modal-overlay" id="product-modal">
                <div class="modal-content">
                    <button class="modal-close" onclick="paraEllasManager.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="modal-body">
                        <div class="modal-image">
                            <img src="${image}" alt="${product.nombre}">
                        </div>
                        <div class="modal-info">
                            <div class="modal-brand">${brand}</div>
                            <h2 class="modal-name">${product.nombre}</h2>
                            <div class="modal-price">${price}</div>
                            <p class="modal-description">${product.descripcion}</p>
                            
                            ${notasSalida.length > 0 || notasCorazon.length > 0 || notasFondo.length > 0 ? `
                                <div class="olfactory-notes">
                                    <h4>Notas Olfativas</h4>
                                    ${notasSalida.length > 0 ? `
                                        <div class="note-group">
                                            <span class="note-type">Salida:</span>
                                            <span class="note-list">${notasSalida.join(', ')}</span>
                                        </div>
                                    ` : ''}
                                    ${notasCorazon.length > 0 ? `
                                        <div class="note-group">
                                            <span class="note-type">Corazón:</span>
                                            <span class="note-list">${notasCorazon.join(', ')}</span>
                                        </div>
                                    ` : ''}
                                    ${notasFondo.length > 0 ? `
                                        <div class="note-group">
                                            <span class="note-type">Fondo:</span>
                                            <span class="note-list">${notasFondo.join(', ')}</span>
                                        </div>
                                    ` : ''}
                                </div>
                            ` : ''}
                            
                            <div class="modal-actions">
                                <button class="btn-primary">
                                    <i class="fas fa-shopping-cart"></i>
                                    Añadir al carrito
                                </button>
                                <button class="btn-secondary">
                                    <i class="fas fa-heart"></i>
                                    Favoritos
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.classList.add('modal-open');
    }

    closeModal() {
        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.remove();
            document.body.classList.remove('modal-open');
        }
    }

    setupModals() {
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    async setupFilters() {
        try {
            // Load categories dynamically
            const categories = await ProductosService.obtenerCategorias();
            this.renderCategoryFilters(categories.filter(cat => cat.slug === 'para-ellas' || cat.slug === 'clasicas' || cat.slug === 'exclusivas'));
        } catch (error) {
            console.error('Error setting up filters:', error);
        }
    }

    renderCategoryFilters(categories) {
        const container = document.getElementById('category-filters');
        if (!container) return;

        const categoriesHTML = categories.map(category => `
            <button class="category-filter" data-category="${category.slug}">
                ${category.nombre}
            </button>
        `).join('');

        container.innerHTML = `
            <button class="category-filter active" data-category="">
                Todos
            </button>
            ${categoriesHTML}
        `;

        // Re-setup event listeners
        const categoryFilters = container.querySelectorAll('.category-filter');
        categoryFilters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                e.preventDefault();
                
                categoryFilters.forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                
                this.activeFilters.category = filter.dataset.category || '';
                this.applyFilters();
            });
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('products-grid')) {
        window.paraEllasManager = new ParaEllasManager();
    }
});
