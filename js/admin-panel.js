// Panel de Administración - JavaScript
class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.productos = [];
        this.categorias = [];
        this.marcas = [];
        this.imageData = null; // Para almacenar imagen en base64
        
        this.init();
    }

    async init() {
        // Esperar a que Supabase esté disponible
        if (typeof initSupabase === 'function') {
            initSupabase();
        }
        
        // Esperar un poco para asegurar que ProductosService esté disponible
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Configurar navegación
        this.setupNavigation();
        
        // Configurar tabs de imagen
        this.setupImageTabs();
        
        // Cargar datos iniciales
        await this.loadInitialData();
        
        // Mostrar dashboard por defecto
        this.showSection('dashboard');
        
        // Configurar formularios
        this.setupForms();
        
        // Configurar eventos
        this.setupEvents();
    }
    }

    async loadProductos() {
        try {
            // Usar el servicio de productos existente
            if (typeof ProductosService !== 'undefined') {
                this.productos = await ProductosService.obtenerProductos();
            } else {
                console.warn('ProductosService no disponible');
                this.productos = [];
            }
            return this.productos;        } catch (error) {
            console.error('Error loading productos:', error);
            this.productos = [];
            return [];
        }
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.sidebar-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remover active de todos los links
                navLinks.forEach(l => l.classList.remove('active'));
                
                // Agregar active al link clickeado
                link.classList.add('active');
                
                // Mostrar sección correspondiente
                const section = link.getAttribute('href').substring(1);
                this.showSection(section);
            });
        });
    }

    showSection(sectionName) {
        // Ocultar todas las secciones
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Mostrar la sección seleccionada
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
            
            // Cargar datos específicos de la sección
            this.loadSectionData(sectionName);
        }
    }

    async loadSectionData(sectionName) {
        switch (sectionName) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'productos':
                await this.loadProductsData();
                break;
            case 'categorias':
                await this.loadCategoriasData();
                break;
        }
    }

    async loadInitialData() {
        try {
            await Promise.all([
                this.loadProductos(),
                this.loadCategorias(),
                this.loadMarcas()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    async loadProductos() {
        if (!this.supabaseClient) return [];

        try {
            const { data, error } = await this.supabaseClient
                .from('productos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.productos = data || [];
            return this.productos;
        } catch (error) {
            console.error('Error loading productos:', error);
            return [];
        }
    }

    async loadCategorias() {
        if (!this.supabaseClient) return [];

        try {
            const { data, error } = await this.supabaseClient
                .from('categorias')
                .select('*')
                .order('nombre');

            if (error) throw error;

            this.categorias = data || [];
            return this.categorias;
        } catch (error) {
            console.error('Error loading categorias:', error);
            return [];
        }
    }

    async loadMarcas() {
        // Extraer marcas únicas de los productos
        const marcasUnicas = [...new Set(this.productos.map(p => p.marca).filter(Boolean))];
        this.marcas = marcasUnicas.sort();
        return this.marcas;
    }

    async loadDashboardData() {
        const totalProductos = this.productos.length;
        const productosActivos = this.productos.filter(p => p.activo).length;
        const totalCategorias = this.categorias.length;
        const totalMarcas = this.marcas.length;

        // Actualizar cards del dashboard
        this.updateDashboardCard('total-productos', totalProductos);
        this.updateDashboardCard('productos-activos', productosActivos);
        this.updateDashboardCard('total-categorias', totalCategorias);
        this.updateDashboardCard('total-marcas', totalMarcas);
    }

    updateDashboardCard(cardId, value) {
        const card = document.querySelector(`[data-card="${cardId}"] .number`);
        if (card) {
            card.textContent = value;
        }
    }

    async loadProductsData() {
        const container = document.querySelector('#productos .products-grid');
        if (!container) return;

        if (this.productos.length === 0) {
            container.innerHTML = '<p>No hay productos disponibles.</p>';
            return;
        }        const productsHTML = this.productos.map(producto => `
            <div class="product-card" data-id="${producto.id}">
                <div class="product-image">
                    ${(producto.imagen_url || producto.imagen) ? 
                        `<img src="${producto.imagen_url || producto.imagen}" 
                             alt="${producto.nombre}" 
                             onerror="this.style.display='none'; this.parentNode.innerHTML='<i class=\\'fas fa-image product-placeholder\\' title=\\'Sin imagen\\'></i>'">` :
                        `<i class="fas fa-image product-placeholder" title="Sin imagen"></i>`
                    }
                </div>
                <div class="product-info">
                    <h4>${producto.nombre}</h4>
                    <p class="product-price">$${this.formatPrice(producto.precio || 0)}</p>
                    <p class="product-brand"><strong>Marca:</strong> ${producto.marca || 'N/A'}</p>
                    <p class="product-category"><strong>Categoría:</strong> ${producto.categoria || 'N/A'}</p>
                </div>
                <div class="product-actions">
                    <button class="btn btn-secondary btn-sm" onclick="adminPanel.editProduct(${producto.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="adminPanel.deleteProduct(${producto.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = productsHTML;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    }

    setupForms() {
        // Configurar formulario de productos
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProductSubmit(e);
            });
        }

        // Poblar select de categorías
        this.populateCategorySelect();
    }

    populateCategorySelect() {
        const categorySelect = document.getElementById('categoria');
        if (categorySelect && this.categorias.length > 0) {
            categorySelect.innerHTML = '<option value="">Seleccionar categoría</option>' +
                this.categorias.map(cat => `<option value="${cat.slug}">${cat.nombre}</option>`).join('');
        }
    }

    async handleProductSubmit(e) {
        const formData = new FormData(e.target);
        const productData = {
            nombre: formData.get('nombre'),
            descripcion: formData.get('descripcion'),
            precio: parseFloat(formData.get('precio')),
            marca: formData.get('marca'),
            categoria: formData.get('categoria'),
            subcategoria: formData.get('subcategoria'),
            imagen_url: formData.get('imagen_url'),
            notas: formData.get('notas'),
            activo: formData.get('activo') === 'on'
        };

        try {
            await this.saveProduct(productData);
            this.showAlert('Producto guardado exitosamente', 'success');
            e.target.reset();
            await this.loadProductos();
            if (this.currentSection === 'productos') {
                await this.loadProductsData();
            }
        } catch (error) {
            console.error('Error saving product:', error);
            this.showAlert('Error al guardar el producto', 'error');
        }
    }

    async saveProduct(productData) {
        if (!this.supabaseClient) {
            throw new Error('Supabase no está disponible');
        }

        // Generar slug
        productData.slug = this.generateSlug(productData.nombre);

        const { data, error } = await this.supabaseClient
            .from('productos')
            .insert([productData])
            .select();

        if (error) throw error;
        return data;
    }

    generateSlug(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
    }

    async editProduct(id) {
        const producto = this.productos.find(p => p.id === id);
        if (!producto) return;

        // Aquí puedes implementar un modal de edición
        // Por ahora, simplemente llenamos el formulario
        const form = document.getElementById('productForm');
        if (form) {
            form.nombre.value = producto.nombre || '';
            form.descripcion.value = producto.descripcion || '';
            form.precio.value = producto.precio || '';
            form.marca.value = producto.marca || '';
            form.categoria.value = producto.categoria || '';
            form.subcategoria.value = producto.subcategoria || '';
            form.imagen_url.value = producto.imagen_url || '';
            form.notas.value = producto.notas || '';
            form.activo.checked = producto.activo || false;

            // Scroll al formulario
            form.scrollIntoView({ behavior: 'smooth' });
        }
    }

    async deleteProduct(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            return;
        }

        try {
            if (!this.supabaseClient) {
                throw new Error('Supabase no está disponible');
            }

            const { error } = await this.supabaseClient
                .from('productos')
                .delete()
                .eq('id', id);

            if (error) throw error;

            this.showAlert('Producto eliminado exitosamente', 'success');
            await this.loadProductos();
            if (this.currentSection === 'productos') {
                await this.loadProductsData();
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            this.showAlert('Error al eliminar el producto', 'error');
        }
    }

    setupEvents() {
        // Configurar botones de acción
        const refreshBtn = document.getElementById('refreshData');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshAllData();
            });
        }
    }

    async refreshAllData() {
        this.showAlert('Actualizando datos...', 'info');
        await this.loadInitialData();
        await this.loadSectionData(this.currentSection);
        this.showAlert('Datos actualizados correctamente', 'success');
    }

    showAlert(message, type = 'info') {
        // Remover alertas existentes
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());

        // Crear nueva alerta
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;

        // Insertar en el contenido actual
        const currentSection = document.querySelector('.content-section.active');
        if (currentSection) {
            currentSection.insertBefore(alert, currentSection.firstChild);
        }

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    async loadCategoriasData() {
        const container = document.querySelector('#categorias .categories-list');
        if (!container) return;

        if (this.categorias.length === 0) {
            container.innerHTML = '<p>No hay categorías disponibles.</p>';
            return;
        }

        const categoriasHTML = this.categorias.map(categoria => `
            <div class="category-item">
                <h4>${categoria.nombre}</h4>
                <p><strong>Slug:</strong> ${categoria.slug}</p>
                <p><strong>Descripción:</strong> ${categoria.descripcion || 'N/A'}</p>
                <div class="category-actions">
                    <button class="btn btn-secondary" onclick="adminPanel.editCategory(${categoria.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger" onclick="adminPanel.deleteCategory(${categoria.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = categoriasHTML;
    }

    async editCategory(id) {
        // Implementar edición de categoría
        console.log('Edit category:', id);
    }

    async deleteCategory(id) {
        // Implementar eliminación de categoría
        console.log('Delete category:', id);
    }
}

// Inicializar el panel cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.adminPanel = new AdminPanel();
});
