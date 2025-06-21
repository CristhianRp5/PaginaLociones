// Panel de Administración - JavaScript
class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.productos = [];
        this.categorias = [];
        this.marcas = [];
        this.imageData = null; // Para almacenar imagen en base64 o URL        this.imageType = 'url'; // 'url' o 'file'
        
        this.init();
    }

    async init() {
        console.log('🚀 Inicializando Panel de Administración...');
        
        try {
            // Esperar a que todas las dependencias estén disponibles
            await this.waitForDependencies();
            
            // Configurar navegación
            this.setupNavigation();
            
            // Configurar tabs de imagen
            this.setupImageTabs();
            
            // Configurar formularios
            this.setupForms();
            
            // Configurar eventos
            this.setupEvents();
            
            // Cargar datos iniciales
            await this.loadInitialData();
            
            // Mostrar dashboard por defecto
            this.showSection('dashboard');
            
            console.log('✅ Panel de Administración listo');
            
        } catch (error) {
            console.error('❌ Error inicializando panel:', error);
            // Continuar con funcionalidad limitada
            this.setupNavigation();
            this.setupForms();
            this.setupEvents();
            this.showSection('dashboard');
        }
    }

    // Esperar a que todas las dependencias estén disponibles
    async waitForDependencies() {
        console.log('⏳ Esperando dependencias...');
        
        const maxAttempts = 50; // 5 segundos máximo
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            const hasSupabase = typeof window.supabase !== 'undefined';
            const hasInitSupabase = typeof initSupabase === 'function';
            const hasProductosService = typeof ProductosService !== 'undefined';
            const hasSupabaseClient = typeof supabaseClient !== 'undefined';
            
            console.log(`Intento ${attempts + 1}/${maxAttempts}:`, {
                supabase: hasSupabase,
                initSupabase: hasInitSupabase,
                ProductosService: hasProductosService,
                supabaseClient: hasSupabaseClient
            });
            
            if (hasSupabase && hasInitSupabase && hasProductosService) {
                // Inicializar Supabase si no está inicializado
                if (!hasSupabaseClient && hasInitSupabase) {
                    console.log('🔄 Inicializando Supabase...');
                    const initialized = initSupabase();
                    console.log(initialized ? '✅ Supabase inicializado' : '⚠️ Error inicializando Supabase');
                }
                
                console.log('✅ Todas las dependencias disponibles');
                return;
            }
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.error('❌ Timeout esperando dependencias');
        // Continuar de todos modos pero con funcionalidad limitada
    }

    setupImageTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                
                // Remover active de todos los tabs
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Activar tab seleccionado
                btn.classList.add('active');
                document.getElementById(`${targetTab}-tab`).classList.add('active');
                
                // Limpiar imagen previa al cambiar tab
                this.clearImagePreview();
                this.imageType = targetTab;
            });
        });
    }    setupNavigation() {
        console.log('🔗 Configurando navegación...');
        
        const navLinks = document.querySelectorAll('.sidebar-menu a');
        console.log(`📍 Enlaces de navegación encontrados: ${navLinks.length}`);
        
        navLinks.forEach((link, index) => {
            const href = link.getAttribute('href');
            console.log(`📎 Link ${index + 1}: ${href}`);
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                console.log(`🖱️ Click en navegación: ${href}`);
                
                // Remover active de todos los links
                navLinks.forEach(l => l.classList.remove('active'));
                
                // Agregar active al link clickeado
                link.classList.add('active');
                
                // Mostrar sección correspondiente
                const section = href.substring(1);
                console.log(`🎯 Navegando a sección: ${section}`);
                this.showSection(section);
            });
        });
        
        console.log('✅ Navegación configurada');
    }

    showSection(sectionName) {
        console.log(`📄 Mostrando sección: ${sectionName}`);
        
        // Ocultar todas las secciones
        const sections = document.querySelectorAll('.content-section');
        console.log(`📄 Secciones encontradas: ${sections.length}`);
        
        sections.forEach(section => {
            section.classList.remove('active');
            console.log(`🔸 Ocultando sección: ${section.id}`);
        });

        // Mostrar la sección seleccionada
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
            console.log(`✅ Sección ${sectionName} activada`);
            
            // Cargar datos específicos de la sección
            this.loadSectionData(sectionName);
        } else {
            console.error(`❌ No se encontró la sección: ${sectionName}`);
        }
    }async loadSectionData(sectionName) {
        console.log(`🔄 Cargando datos para sección: ${sectionName}`);
        
        switch (sectionName) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'productos':
                console.log('📦 Cargando sección productos...');
                await this.loadProductsData();
                break;
            case 'configuracion':
                this.checkConnection();
                break;
        }
    }    async loadInitialData() {
        console.log('📊 Cargando datos iniciales...');
        
        try {
            this.showLoading(true);
            
            // Cargar productos primero
            await this.loadProductos();
            console.log(`✅ Productos cargados: ${this.productos.length}`);
            
            // Cargar categorías y marcas
            await this.loadCategorias();
            await this.loadMarcas();
            
            console.log('✅ Datos iniciales cargados correctamente');
            
        } catch (error) {
            console.error('❌ Error cargando datos iniciales:', error);
            // No lanzar error, continuar con arrays vacíos
            this.productos = [];
            this.categorias = [];
            this.marcas = [];
        } finally {
            this.showLoading(false);
        }
    }async loadProductos() {
        try {
            console.log('📦 Cargando productos...');
            
            if (typeof ProductosService !== 'undefined') {
                this.productos = await ProductosService.obtenerProductos();
                console.log(`✅ ${this.productos.length} productos cargados`);
            } else {
                console.warn('⚠️ ProductosService no disponible, usando datos locales');
                this.productos = [];
            }
        } catch (error) {
            console.error('❌ Error cargando productos:', error);
            this.productos = [];
        }
    }

    async loadCategorias() {
        try {
            if (typeof ProductosService !== 'undefined') {
                this.categorias = await ProductosService.obtenerCategorias();
            } else {
                this.categorias = [
                    { id: 1, nombre: 'Para Ellos', slug: 'para-ellos' },
                    { id: 2, nombre: 'Para Ellas', slug: 'para-ellas' },
                    { id: 3, nombre: 'Unisex', slug: 'unisex' }
                ];
            }
        } catch (error) {
            console.error('Error cargando categorías:', error);
            this.categorias = [];
        }
    }

    async loadMarcas() {
        const marcasUnicas = [...new Set(this.productos.map(p => p.marca).filter(Boolean))];
        this.marcas = marcasUnicas.sort();
    }

    // Actualizar datos del dashboard
    async loadDashboardData() {
        console.log('📊 Actualizando dashboard...');
        
        const totalProducts = this.productos.length;
        const activeProducts = this.productos.filter(p => p.activo !== false).length;
        const totalCategories = this.categorias.length;
        const totalBrands = this.marcas.length;

        // Actualizar cards del dashboard
        this.updateDashboardCard('total-productos', totalProducts);
        this.updateDashboardCard('productos-activos', activeProducts);
        this.updateDashboardCard('total-categorias', totalCategories);
        this.updateDashboardCard('total-marcas', totalBrands);
        
        console.log(`✅ Dashboard actualizado: ${totalProducts} productos, ${totalCategories} categorías, ${totalBrands} marcas`);
    }

    updateDashboardCard(cardType, value) {
        const card = document.querySelector(`[data-card="${cardType}"] .number`);
        if (card) {
            card.textContent = value;
        }
    }    async loadProductsData() {
        console.log('📦 Cargando datos de productos para mostrar...');
        
        const container = document.querySelector('.products-grid');
        if (!container) {
            console.warn('❌ Contenedor .products-grid no encontrado');
            return;
        }

        try {
            // Si no hay productos cargados, intentar cargarlos
            if (this.productos.length === 0) {
                console.log('🔄 No hay productos, cargando...');
                await this.loadProductos();
            }

            if (this.productos.length === 0) {
                container.innerHTML = '<div class="no-products">No hay productos disponibles. <button class="btn btn-primary" onclick="adminPanel.reloadProducts()">Recargar</button></div>';
                console.log('⚠️ No hay productos para mostrar');
                return;
            }

            console.log(`🎨 Renderizando ${this.productos.length} productos...`);

            const productsHTML = this.productos.map(product => `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${product.imagen_url || product.imagen || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUYwIi8+CjxwYXRoIGQ9Ik08NSA2MEM4NSA1MS43NiA5MS43NiA0NSAxMDAgNDVDMTA4LjI0IDQ1IDExNSA1MS43NiAxMTUgNjBWOTBDMTE1IDk4LjI0IDEwOC4yNCAxMDUgMTAwIDEwNUM5MS43NiAxMDUgODUgOTguMjQgODUgOTBWNjBaIiBmaWxsPSIjQjg4NjBCIi8+CjxwYXRoIGQ9Ik05MCA3NUg5NVY4MEg5MFY3NVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMDUgNzVIMTEwVjgwSDEwNVY3NVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik05NSA4NUgxMDVWOTBIOTVWODVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4='}" 
                             alt="${product.nombre}"
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUYwIi8+CjxwYXRoIGQ9Ik08NSA2MEM4NSA1MS43NiA5MS43NiA0NSAxMDAgNDVDMTA4LjI0IDQ1IDExNSA1MS43NiAxMTUgNjBWOTBDMTE1IDk4LjI0IDEwOC4yNCAxMDUgMTAwIDEwNUM5MS43NiAxMDUgODUgOTguMjQgODUgOTBWNjBaIiBmaWxsPSIjQjg4NjBCIi8+CjxwYXRoIGQ9Ik05MCA3NUg5NVY4MEg5MFY3NVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMDUgNzVIMTEwVjgwSDEwNVY3NVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik05NSA4NUgxMDVWOTBIOTVWODVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=';">
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${product.nombre}</h3>
                        <p class="product-brand">${product.marca || ''}</p>
                        <div class="product-price">${this.getPrecioInfo(product)}</div>
                        <p class="product-category">${this.getCategoryName(product.categoria)}</p>
                        <div class="product-actions">
                            <button class="btn btn-secondary btn-sm" onclick="adminPanel.editProduct(${product.id})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="adminPanel.deleteProduct(${product.id})">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

            container.innerHTML = productsHTML;
            console.log(`✅ ${this.productos.length} productos renderizados en la interfaz`);
            
        } catch (error) {
            console.error('❌ Error en loadProductsData:', error);
            container.innerHTML = `<div class="no-products error">Error cargando productos: ${error.message}</div>`;
        }
    }

    // Función auxiliar para obtener nombre de categoría
    getCategoryName(category) {
        const categories = {
            'para-ellos': 'Para Ellos',
            'para-ellas': 'Para Ellas',
            'unisex': 'Unisex'
        };
        return categories[category] || category;
    }

    setupForms() {
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProductSubmit(e);
            });
        }
    }    setupEvents() {
        // Configurar búsqueda de productos
        const searchInput = document.getElementById('searchProducts');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterProducts(e.target.value);
            });
        }
        
        // Configurar botón de actualizar datos
        const refreshBtn = document.getElementById('refreshData');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                console.log('🔄 Actualizando datos generales...');
                this.showLoading(true);
                await this.loadInitialData();
                await this.loadSectionData(this.currentSection);
                this.showAlert('Datos actualizados correctamente', 'success');
                this.showLoading(false);
            });
        }
        
        // Configurar botón específico de recargar productos
        const refreshProductsBtn = document.getElementById('refreshProducts');
        if (refreshProductsBtn) {
            refreshProductsBtn.addEventListener('click', async () => {
                console.log('🔄 Recargando productos específicamente...');
                this.showLoading(true);
                await this.loadProductos();
                await this.loadProductsData();
                this.showAlert('Lista de productos actualizada', 'success');
                this.showLoading(false);
            });
        }
        
        // Configurar evento de cambio de estado para mostrar/ocultar descuento
        const estadoSelect = document.getElementById('estado');
        if (estadoSelect) {
            estadoSelect.addEventListener('change', () => {
                this.handleEstadoChange();
            });
        }
        
        // Configurar eventos de cambio de precio y descuento para actualizar vista previa
        const precioInput = document.getElementById('precio');
        const descuentoInput = document.getElementById('descuento');
        
        if (precioInput) {
            precioInput.addEventListener('input', () => {
                this.updatePrecioConDescuento();
            });
        }
        
        if (descuentoInput) {
            descuentoInput.addEventListener('input', () => {
                this.updatePrecioConDescuento();
            });
        }
        
        // Configurar eventos de vista previa de imagen
        const imagenUrlInput = document.getElementById('imagen_url');
        if (imagenUrlInput) {
            imagenUrlInput.addEventListener('blur', () => {
                if (imagenUrlInput.value.trim()) {
                    this.previewImageFromUrl();
                }
            });
        }
        
        // Configurar validación de precio
        if (precioInput) {
            precioInput.addEventListener('input', (e) => {
                this.validatePrice(e.target);
            });
        }
    }
    
    // Función para validar precio en tiempo real
    validatePrice(input) {
        const value = parseInt(input.value);
        const PRECIO_MAXIMO = 2147483647;
        
        if (value > PRECIO_MAXIMO) {
            input.style.borderColor = '#e74c3c';
            input.title = `El precio máximo permitido es $${new Intl.NumberFormat('es-CO').format(PRECIO_MAXIMO)}`;
        } else if (value < 0) {
            input.style.borderColor = '#e74c3c';
            input.title = 'El precio no puede ser negativo';
        } else {
            input.style.borderColor = '';
            input.title = '';
        }
    }async handleProductSubmit(e) {
        let productData = null; // Definir aquí para que esté disponible en catch
        
        try {
            this.showLoading(true);
            console.log('📝 Procesando formulario de producto...');
            
            const formData = new FormData(e.target);
            
            // Verificar si estamos editando un producto existente
            const isEditMode = e.target.dataset.editId;
            const productId = isEditMode ? parseInt(isEditMode) : null;
            
            console.log(isEditMode ? `✏️ Actualizando producto ID: ${productId}` : '➕ Creando nuevo producto');
            
            // Procesar imagen según el tipo
            let imagenFinal = null;
            
            if (this.imageType === 'url') {
                // Imagen desde URL
                imagenFinal = formData.get('imagen_url');
                console.log('🔗 Usando imagen desde URL:', imagenFinal);
                
            } else if (this.imageType === 'file' && this.imageData) {
                // Imagen desde archivo local - subir al storage
                console.log('📤 Subiendo imagen local al storage...');
                
                try {
                    // Obtener el archivo original del input
                    const fileInput = document.getElementById('imagen_file');
                    const file = fileInput && fileInput.files && fileInput.files[0];
                    
                    if (file) {
                        // Subir archivo directamente
                        const fileName = formData.get('nombre') || 'producto';
                        imagenFinal = await ImageStorageService.uploadImage(file, fileName);
                        console.log('✅ Imagen subida exitosamente:', imagenFinal);
                        
                    } else if (this.imageData.startsWith('data:')) {
                        // Fallback: convertir base64 a archivo
                        const fileName = formData.get('nombre') || 'producto';
                        imagenFinal = await ImageStorageService.uploadImageFromBase64(this.imageData, fileName);
                        console.log('✅ Imagen convertida y subida:', imagenFinal);
                        
                    } else {
                        console.warn('⚠️ No se pudo procesar la imagen local');
                    }
                    
                } catch (imageError) {
                    console.error('❌ Error subiendo imagen:', imageError);
                    // Continuar sin imagen en lugar de fallar completamente
                    this.showAlert('Advertencia: No se pudo subir la imagen. El producto se guardará sin imagen.', 'warning');
                    imagenFinal = null;
                }
            } else if (isEditMode) {
                // En modo edición, si no hay nueva imagen, mantener la existente
                const existingProduct = this.productos.find(p => p.id === productId);
                if (existingProduct && existingProduct.imagen_url) {
                    imagenFinal = existingProduct.imagen_url;
                    console.log('🔄 Manteniendo imagen existente:', imagenFinal);
                }
            }
              // Validar y limpiar el precio
            let precioLimpiado = parseInt(formData.get('precio')) || 0;
            
            // Aplicar límites de precio para evitar overflow
            const PRECIO_MAXIMO = 2147483647; // Límite de int en PostgreSQL
            if (precioLimpiado > PRECIO_MAXIMO) {
                console.warn(`⚠️ Precio ${precioLimpiado} excede el máximo permitido, ajustando a ${PRECIO_MAXIMO}`);
                precioLimpiado = PRECIO_MAXIMO;
                this.showAlert(`Precio ajustado al máximo permitido: $${new Intl.NumberFormat('es-CO').format(PRECIO_MAXIMO)}`, 'warning');
            }
            
            if (precioLimpiado < 0) {
                console.warn('⚠️ Precio negativo no permitido, ajustando a 0');
                precioLimpiado = 0;
            }
            
            // Obtener estado y descuento
            const estado = formData.get('estado') || 'disponible';
            let descuento = null;
            
            // Si el estado es "oferta", validar que el descuento sea obligatorio
            if (estado === 'oferta') {
                descuento = parseInt(formData.get('descuento')) || 0;
                if (descuento <= 0 || descuento > 99) {
                    throw new Error('Para productos en oferta, el descuento debe ser entre 1% y 99%');
                }
            }
            
            productData = {
                nombre: formData.get('nombre'),
                marca: formData.get('marca'),
                precio: precioLimpiado,
                categoria: formData.get('categoria'),
                subcategoria: formData.get('subcategoria') || null,
                descripcion: formData.get('descripcion') || '',
                notas: formData.get('notas') || '',
                imagen_url: imagenFinal,
                estado: estado,
                descuento: descuento,
                activo: formData.get('activo') === 'on'
            };

            console.log('📦 Datos del producto a guardar:', productData);
            
            let result;
            if (isEditMode) {
                // Actualizar producto existente
                result = await this.updateProduct(productId, productData);
            } else {
                // Crear nuevo producto
                result = await this.saveProduct(productData);
            }
            
            if (result) {
                // Limpiar formulario
                e.target.reset();
                this.clearImagePreview();
                
                // Restaurar modo agregar si estábamos editando
                if (isEditMode) {
                    this.setFormEditMode(false);
                }
                
                // Recargar datos
                await this.loadProductos();
                if (this.currentSection === 'productos') {
                    await this.loadProductsData();
                }
                
                const action = isEditMode ? 'actualizado' : 'guardado';
                this.showAlert(`Producto ${action} exitosamente` + (imagenFinal ? ' con imagen' : ' sin imagen'), 'success');
                console.log(`✅ Producto ${action}:`, result);
                
                // Navegar a la lista de productos
                this.showSection('productos');
            } else {
                throw new Error(`No se pudo ${isEditMode ? 'actualizar' : 'guardar'} el producto`);
            }
              } catch (error) {
            console.error('❌ Error guardando producto:', error);
            
            // Mostrar error más detallado al usuario
            let userMessage = 'Error al guardar el producto. ';
            
            if (error.message.includes('conexión') || error.message.includes('network') || error.message.includes('fetch')) {
                userMessage += 'Problema de conexión. Verifica tu internet y vuelve a intentar.';
            } else if (error.message.includes('authentication') || error.message.includes('auth')) {
                userMessage += 'Problema de autenticación con la base de datos.';
            } else if (error.message.includes('campos requeridos')) {
                userMessage += 'Faltan campos requeridos en el formulario.';
            } else if (error.message.includes('base de datos')) {
                userMessage += 'Error en la base de datos: ' + error.message;
            } else {
                userMessage += error.message;
            }
            
            this.showAlert(userMessage, 'error');
            
            // Mostrar información adicional en consola para debugging
            console.log('🔍 Información de debugging:');
            console.log('- ProductosService disponible:', typeof ProductosService !== 'undefined');
            console.log('- supabaseClient disponible:', typeof supabaseClient !== 'undefined');
            console.log('- Datos del formulario:', productData);
        } finally {
            this.showLoading(false);
        }
    }async saveProduct(productData) {
        try {
            console.log('💾 Intentando guardar producto...');
            console.log('📦 Datos del producto:', productData);
            
            // Verificar que ProductosService esté disponible
            if (typeof ProductosService === 'undefined') {
                throw new Error('ProductosService no está disponible. Verifica que supabase-config.js esté cargado correctamente.');
            }
            
            // Verificar estado de Supabase
            console.log('🔍 Verificando conexión Supabase...');
            console.log('- supabaseClient:', typeof supabaseClient !== 'undefined' ? '✅' : '❌');
            console.log('- window.supabase:', typeof window.supabase !== 'undefined' ? '✅' : '❌');
            
            // Intentar inicializar Supabase si no está disponible
            if (typeof supabaseClient === 'undefined' || !supabaseClient) {
                console.log('🔄 Intentando inicializar Supabase...');
                if (typeof initSupabase === 'function') {
                    const initialized = initSupabase();
                    if (!initialized) {
                        console.warn('⚠️ No se pudo inicializar Supabase, continuando sin validación...');
                    }
                } else {
                    console.warn('⚠️ initSupabase no disponible');
                }
            }
            
            // Probar conexión de manera más simple
            let connectionOk = false;
            try {
                if (supabaseClient) {
                    // Test simple de conexión
                    const { error } = await supabaseClient.from('productos').select('id').limit(1);
                    connectionOk = !error;
                    console.log('🔗 Test de conexión:', connectionOk ? '✅' : '❌', error ? error.message : '');
                } else {
                    console.warn('⚠️ supabaseClient no disponible');
                }
            } catch (testError) {
                console.warn('⚠️ Error probando conexión:', testError.message);
            }
            
            // Intentar guardar el producto
            console.log('💾 Enviando producto a Supabase...');
            const result = await ProductosService.crearProducto(productData);
            
            console.log('✅ Resultado del guardado:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Error en saveProduct:', error);
            console.error('📋 Stack trace:', error.stack);
            
            // Proporcionar información más detallada del error
            let errorMessage = error.message;
            
            if (error.message.includes('fetch')) {
                errorMessage = 'Error de conexión de red. Verifica tu conexión a internet.';
            } else if (error.message.includes('CORS')) {
                errorMessage = 'Error de CORS. Verifica la configuración de Supabase.';
            } else if (error.message.includes('authentication') || error.message.includes('auth')) {
                errorMessage = 'Error de autenticación con Supabase. Verifica las credenciales.';
            } else if (error.message.includes('not found') || error.message.includes('404')) {
                errorMessage = 'Tabla de productos no encontrada en Supabase.';
            }
            
            throw new Error(errorMessage);
        }
    }    // Función para editar producto
    async editProduct(productId) {
        console.log(`✏️ Editando producto ID: ${productId}`);
        
        try {
            // Buscar el producto actual
            const product = this.productos.find(p => p.id === productId);
            if (!product) {
                this.showAlert('Producto no encontrado', 'error');
                return;
            }
            
            // Poblar el formulario con los datos del producto
            this.populateEditForm(product);
            
            // Cambiar a la sección de agregar producto (que ahora funciona como editar)
            this.showSection('agregar-producto');
            
            // Cambiar el título y botón del formulario
            this.setFormEditMode(true, productId);
            
        } catch (error) {
            console.error('❌ Error cargando producto para editar:', error);
            this.showAlert('Error al cargar el producto', 'error');
        }
    }    // Función para eliminar producto
    async deleteProduct(productId) {
        // Mostrar confirmación con información del producto
        const product = this.productos.find(p => p.id === productId);
        const productName = product ? product.nombre : `ID ${productId}`;
        
        if (!confirm(`¿Estás seguro de que quieres eliminar el producto "${productName}"?\n\nEsta acción no se puede deshacer.`)) {
            return;
        }

        try {
            console.log(`🗑️ Eliminando producto ID: ${productId}`);
            this.showLoading(true);
            
            // Verificar que ProductosService esté disponible
            if (typeof ProductosService === 'undefined') {
                throw new Error('ProductosService no está disponible. Verifica que supabase-config.js esté cargado correctamente.');
            }
            
            // Eliminar el producto
            const result = await ProductosService.deleteProduct(productId);
            
            if (result) {
                console.log('✅ Producto eliminado exitosamente');
                
                // Recargar datos
                await this.loadProductos();
                if (this.currentSection === 'productos') {
                    await this.loadProductsData();
                }
                
                this.showAlert(`Producto "${productName}" eliminado exitosamente`, 'success');
            } else {
                throw new Error('No se pudo eliminar el producto');
            }
            
        } catch (error) {
            console.error('❌ Error eliminando producto:', error);
            
            let errorMessage = 'Error al eliminar el producto: ';
            
            if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
                errorMessage += 'No se pudo conectar a la base de datos. Verifica tu conexión a internet.';
            } else if (error.message.includes('404')) {
                errorMessage += 'Producto no encontrado.';
            } else if (error.message.includes('403')) {
                errorMessage += 'No tienes permisos para eliminar este producto.';
            } else if (error.message.includes('500')) {
                errorMessage += 'Error interno del servidor. Intenta nuevamente más tarde.';
            } else {
                errorMessage += error.message;
            }
            
            this.showAlert(errorMessage, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Función para filtrar productos
    filterProducts(searchTerm) {
        const filteredProducts = this.productos.filter(product => 
            product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.categoria.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        this.renderFilteredProducts(filteredProducts);
    }

    // Renderizar productos filtrados
    renderFilteredProducts(products) {
        const container = document.querySelector('.products-grid');
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = '<div class="no-products">No se encontraron productos con ese criterio de búsqueda</div>';
            return;
        }

        const productsHTML = products.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.imagen_url || product.imagen || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUYwIi8+CjxwYXRoIGQ9Ik08NSA2MEM4NSA1MS43NiA5MS43NiA0NSAxMDAgNDVDMTA4LjI0IDQ1IDExNSA1MS43NiAxMTUgNjBWOTBDMTE1IDk4LjI0IDEwOC4yNCAxMDUgMTAwIDEwNUM5MS43NiAxMDUgODUgOTguMjQgODUgOTBWNjBaIiBmaWxsPSIjQjg4NjBCIi8+CjxwYXRoIGQ9Ik05MCA3NUg5NVY4MEg5MFY3NVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMDUgNzVIMTEwVjgwSDEwNVY3NVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik05NSA4NUgxMDVWOTBIOTVWODVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4='}" 
                         alt="${product.nombre}"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUYwIi8+CjxwYXRoIGQ9Ik08NSA2MEM4NSA1MS43NiA5MS43NiA0NSAxMDAgNDVDMTA4LjI0IDQ1IDExNSA1MS43NiAxMTUgNjBWOTBDMTE1IDk4LjI0IDEwOC4yNCAxMDUgMTAwIDEwNUM5MS43NiAxMDUgODUgOTguMjQgODUgOTBWNjBaIiBmaWxsPSIjQjg4NjBCIi8+CjxwYXRoIGQ9Ik05MCA3NUg5NVY4MEg5MFY3NVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMDUgNzVIMTEwVjgwSDEwNVY3NVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik05NSA4NUgxMDVWOTBIOTVWODVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=';">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.nombre}</h3>
                    <p class="product-brand">${product.marca || ''}</p>
                    <p class="product-price">$${this.formatPrice(product.precio || 0)}</p>
                    <div class="product-actions">
                        <button class="btn btn-secondary btn-sm" onclick="adminPanel.editProduct(${product.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="adminPanel.deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = productsHTML;
    }

    checkConnection() {
        const statusDiv = document.getElementById('connectionStatus');
        if (!statusDiv) return;

        if (typeof ProductosService !== 'undefined') {
            statusDiv.className = 'alert alert-success';
            statusDiv.innerHTML = '<i class="fas fa-check-circle"></i> Conexión establecida correctamente';
        } else {
            statusDiv.className = 'alert alert-error';
            statusDiv.innerHTML = '<i class="fas fa-times-circle"></i> Error de conexión con la base de datos';
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
    }

    showAlert(message, type = 'info') {
        // Crear elemento de alerta
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
            ${message}
        `;

        // Agregar al body
        document.body.appendChild(alert);

        // Posicionar en la esquina superior derecha
        alert.style.position = 'fixed';
        alert.style.top = '20px';
        alert.style.right = '20px';
        alert.style.zIndex = '10001';
        alert.style.maxWidth = '400px';

        // Remover después de 5 segundos
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 5000);
   }    // Función para poblar el formulario con datos del producto
    populateEditForm(product) {
        console.log('📝 Poblando formulario con datos del producto:', product);
        lateEditForm(product) {
        try {le.log('📝 Poblando formulario con datos del producto:', product);
            // Función auxiliar para establecer valor de forma segura
            const safeSetValue = (id, value, defaultValue = '') => {
                const element = document.getElementById(id);mbre || '';
                if (element) {d('marca').value = product.marca || '';
                    if (element.type === 'checkbox') {uct.precio || '';
                        element.checked = value !== false;ct.categoria || '';
                    } else {yId('subcategoria').value = product.subcategoria || '';
                        element.value = value || defaultValue;.descripcion || '';
                    }lementById('notas').value = product.notas || '';
                    console.log(`✅ ${id}: ${value || defaultValue}`);disponible';
                } else {entById('descuento').value = product.descuento || '';
                    console.warn(`⚠️ Elemento '${id}' no encontrado en el DOM`);
                }
            };ejar imagen
        if (product.imagen_url) {
            // Datos básicosentById('imagen_url').value = product.imagen_url;
            safeSetValue('nombre', product.nombre);_url);
            safeSetValue('marca', product.marca);
            safeSetValue('precio', product.precio);
            safeSetValue('categoria', product.categoria);
            safeSetValue('subcategoria', product.subcategoria);
            safeSetValue('descripcion', product.descripcion);
            safeSetValue('notas', product.notas);revia de precios
            safeSetValue('estado', product.estado, 'disponible'); {
            safeSetValue('descuento', product.descuento);
            safeSetValue('activo', product.activo);
            
            // Manejar imagen con verificación adicional
            if (product.imagen_url) {ario a modo edición
                const imagenUrlInput = document.getElementById('imagen_url');
                if (imagenUrlInput) {.querySelector('#agregar-producto .section-title');
                    imagenUrlInput.value = product.imagen_url; button[type="submit"]');
                    console.log('✅ imagen_url:', product.imagen_url);type="reset"]');
                    
                    // Intentar mostrar preview de imagen
                    try {ón
                        this.previewImageFromUrl(product.imagen_url);
                    } catch (previewError) {"fas fa-save"></i> Actualizar Producto';
                        console.warn('⚠️ Error mostrando preview de imagen:', previewError);
                    }
                } else {tributo para identificar que estamos editando
                    console.warn('⚠️ Elemento imagen_url no encontrado');ctId;
                }
            }/ Cambiar evento del botón cancelar
            resetBtn.onclick = () => this.cancelEdit();
            // Manejar campo de descuento según el estado
            try {
                this.handleEstadoChange();
            } catch (estadoError) {t = 'Agregar Nuevo Producto';
                console.warn('⚠️ Error manejando cambio de estado:', estadoError);
            }esetBtn.innerHTML = '<i class="fas fa-undo"></i> Limpiar Formulario';
            
            // Si tiene descuento, actualizar vista previa de precios
            if (product.estado === 'oferta' && product.descuento > 0) {d;
                try {
                    this.updatePrecioConDescuento();
                } catch (precioError) {
                    console.warn('⚠️ Error actualizando precio con descuento:', precioError);
                }
            }
            ón para cancelar edición
            console.log('✅ Formulario poblado exitosamente');
            impiar formulario
        } catch (error) {ntById('productForm').reset();
            console.error('❌ Error poblando formulario:', error);
            throw error;ew de imagen
        }his.clearImagePreview();
    }   
      // Función para cambiar el formulario a modo edición
    setFormEditMode(isEditMode, productId = null) {
        try {
        // Volver a la lista de productos
        this.showSection('productos');
        
        this.showAlert('Edición cancelada', 'info');
    }
    
    // Función para manejar cambio de estado (ya existe pero la mejoramos)
    handleEstadoChange() {
        const estadoSelect = document.getElementById('estado');
        const descuentoGroup = document.getElementById('descuentoGroup');
        const descuentoInput = document.getElementById('descuento');
        
        if (!estadoSelect || !descuentoGroup) return;
        
        const selectedEstado = estadoSelect.value;
        
        if (selectedEstado === 'oferta') {
            descuentoGroup.style.display = 'block';
            descuentoInput.required = true;
            descuentoInput.min = '1';
            descuentoInput.max = '99';
        } else {
            descuentoGroup.style.display = 'none';
            descuentoInput.required = false;
            descuentoInput.value = '';
            // Limpiar vista previa de precios
            const precioInfo = document.getElementById('precioInfo');
            if (precioInfo) {
                precioInfo.style.display = 'none';
            }
        }
    }
    
    // Función para actualizar precio con descuento
    updatePrecioConDescuento() {
        const precioInput = document.getElementById('precio');
        const descuentoInput = document.getElementById('descuento');
        const precioInfo = document.getElementById('precioInfo');
        const precioOriginal = document.getElementById('precioOriginal');
        const precioConDescuento = document.getElementById('precioConDescuento');
        
        if (!precioInput || !descuentoInput || !precioInfo) return;
        
        const precio = parseFloat(precioInput.value) || 0;
        const descuento = parseFloat(descuentoInput.value) || 0;
        
        if (precio > 0 && descuento > 0) {
            const precioFinal = precio - (precio * descuento / 100);
            
            precioOriginal.textContent = `$${this.formatPrice(precio)}`;
            precioConDescuento.textContent = `$${this.formatPrice(precioFinal)}`;
            precioInfo.style.display = 'block';
        } else {
            precioInfo.style.display = 'none';
        }
    }
    
    // Función para previsualizar imagen desde URL
    previewImageFromUrl(url = null) {
        const imageUrl = url || document.getElementById('imagen_url').value;
        const imagePreview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        
        if (!imageUrl.trim()) {
            this.clearImagePreview();
            return;
        }
        
        // Crear nueva imagen para verificar que carga correctamente
        const img = new Image();
        img.onload = () => {
            previewImg.src = imageUrl;
            imagePreview.style.display = 'block';
            this.imageData = imageUrl;
            this.imageType = 'url';
        };
        img.onerror = () => {
            this.showAlert('No se pudo cargar la imagen desde la URL proporcionada', 'error');
            this.clearImagePreview();
        };
        img.src = imageUrl;
    }
    
    // Función para previsualizar imagen desde archivo
    previewImageFromFile(input) {
        const file = input.files[0];
        const imagePreview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        
        if (!file) {
            this.clearImagePreview();
            return;
        }
        
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            this.showAlert('Por favor selecciona un archivo de imagen válido', 'error');
            input.value = '';
            return;
        }
        
        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showAlert('La imagen es muy grande. Máximo 5MB', 'error');
            input.value = '';
            return;
        }
        
        // Leer archivo y mostrar preview
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            imagePreview.style.display = 'block';
            this.imageData = file;
            this.imageType = 'file';
        };
        reader.readAsDataURL(file);
    }
    
    // Función para limpiar preview de imagen
    clearImagePreview() {
        const imagePreview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        const imageUrlInput = document.getElementById('imagen_url');
        const imageFileInput = document.getElementById('imagen_file');
        
        if (imagePreview) imagePreview.style.display = 'none';
        if (previewImg) previewImg.src = '';
        if (imageUrlInput) imageUrlInput.value = '';
        if (imageFileInput) imageFileInput.value = '';
        
        this.imageData = null;
        this.imageType = 'url';
    }

    // Método para forzar recarga de productos
    async reloadProducts() {
        console.log('🔄 Recargando productos forzadamente...');
        
        try {
            this.showLoading(true);
            
            // Limpiar productos actuales
            this.productos = [];
            
            // Recargar desde Supabase
            await this.loadProductos();
            
            // Si estamos en la sección productos, actualizar vista
            if (this.currentSection === 'productos') {
                await this.loadProductsData();
            }
            
            // Actualizar dashboard
            await this.loadDashboardData();
            
            console.log('✅ Productos recargados exitosamente');
            this.showAlert('Productos recargados exitosamente', 'success');
            
        } catch (error) {
            console.error('❌ Error recargando productos:', error);
            this.showAlert('Error recargando productos: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
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
    
    // Función auxiliar para formatear precios
    formatPrice(price) {
        return new Intl.NumberFormat('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    }

    // Función para actualizar producto existente
    async updateProduct(productId, productData) {
        try {
            console.log(`💾 Actualizando producto ID ${productId}...`);
            console.log('📦 Datos de actualización:', productData);
            
            // Verificar que ProductosService esté disponible
            if (typeof ProductosService === 'undefined') {
                throw new Error('ProductosService no está disponible. Verifica que supabase-config.js esté cargado correctamente.');
            }
            
            // Verificar estado de Supabase
            console.log('🔍 Verificando conexión Supabase...');
            console.log('- supabaseClient:', typeof supabaseClient !== 'undefined' ? '✅' : '❌');
            console.log('- window.supabase:', typeof window.supabase !== 'undefined' ? '✅' : '❌');
            
            // Intentar actualizar el producto
            const result = await ProductosService.updateProduct(productId, productData);
            
            if (result) {
                console.log('✅ Producto actualizado exitosamente:', result);
                return result;
            } else {
                throw new Error('No se recibió respuesta de la actualización');
            }
            
        } catch (error) {
            console.error('❌ Error actualizando producto:', error);
            
            // Determinar el tipo de error y lanzar mensaje específico
            let errorMessage = 'Error actualizando producto: ';
            
            if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
                errorMessage += 'No se pudo conectar a la base de datos. Verifica tu conexión a internet.';
            } else if (error.message.includes('404')) {
                errorMessage += 'Producto no encontrado.';
            } else if (error.message.includes('400')) {
                errorMessage += 'Datos inválidos enviados al servidor.';
            } else if (error.message.includes('500')) {
                errorMessage += 'Error interno del servidor. Intenta nuevamente más tarde.';
            } else {
                errorMessage += error.message;
            }
            
            throw new Error(errorMessage);
        }
    }
}
