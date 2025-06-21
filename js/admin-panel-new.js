// Panel de Administración - JavaScript
class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.productos = [];
        this.categorias = [];
        this.marcas = [];
        this.imageData = null; // Para almacenar imagen en base64 o URL
        this.imageType = 'url'; // 'url' o 'file'
        this.editingProductId = null; // ID del producto en edición
        
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
        
        const maxAttempts = 50;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            const hasSupabase = typeof window.supabase !== 'undefined';
            const hasProductosService = typeof ProductosService !== 'undefined';
            const hasSupabaseClient = typeof supabaseClient !== 'undefined';
            
            console.log(`Intento ${attempts + 1}/${maxAttempts}:`, {
                supabase: hasSupabase,
                ProductosService: hasProductosService,
                supabaseClient: hasSupabaseClient
            });
            
            if (hasSupabase && hasProductosService && hasSupabaseClient) {
                console.log('✅ Todas las dependencias disponibles');
                return;
            }
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.warn('⚠️ Timeout esperando dependencias, continuando con funcionalidad limitada');
    }

    // Configurar navegación
    setupNavigation() {
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
    }    // Configurar tabs de imagen
    setupImageTabs() {
        console.log('🖼️ Configurando tabs de imagen...');
        
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        console.log(`📋 Tabs encontrados: ${tabBtns.length} botones, ${tabContents.length} contenidos`);

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                console.log(`🖱️ Click en tab: ${targetTab}`);
                
                // Remover active de todos los tabs
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Activar tab seleccionado
                btn.classList.add('active');
                const targetContent = document.getElementById(`${targetTab}-tab`);
                if (targetContent) {
                    targetContent.classList.add('active');
                    console.log(`✅ Tab ${targetTab} activado`);
                } else {
                    console.error(`❌ Contenido del tab ${targetTab} no encontrado`);
                }
                
                // Solo cambiar el tipo, NO limpiar la imagen previa
                // Esto permite mantener la imagen cargada al cambiar tabs
                this.imageType = targetTab;
                
                console.log(`🔄 Tipo de imagen cambiado a: ${this.imageType}`);
            });
        });
        
        console.log('✅ Tabs de imagen configurados');
    }

    // Configurar formularios
    setupForms() {
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProductSubmit(e);
            });
            
            // Agregar evento para reset del formulario
            productForm.addEventListener('reset', (e) => {
                console.log('🧹 Formulario reseteado, limpiando preview de imagen...');
                setTimeout(() => {
                    this.clearImageInputs();
                    this.setFormEditMode(false); // Asegurar que vuelve a modo agregar
                }, 100); // Pequeño delay para que el reset se complete primero
            });
        }
    }

    // Configurar eventos adicionales
    setupEvents() {
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
            // Cambiar de 'blur' a 'input' con debounce para preview en tiempo real
            let previewTimeout;
            imagenUrlInput.addEventListener('input', (e) => {
                clearTimeout(previewTimeout);
                previewTimeout = setTimeout(() => {
                    const url = e.target.value.trim();
                    if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('.') || url.startsWith('/'))) {
                        this.previewImageFromUrl(url);                    } else if (!url) {
                        this.clearImagePreview(); // No limpiar inputs en tiempo real
                    }
                }, 1000); // Esperar 1 segundo después de que el usuario deje de escribir
            });
            
            // También mantener el evento blur como backup
            imagenUrlInput.addEventListener('blur', (e) => {
                const url = e.target.value.trim();
                if (url) {
                    this.previewImageFromUrl(url);
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

    // Mostrar sección
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
    }

    // Cargar datos específicos de la sección
    async loadSectionData(sectionName) {
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
    }

    // Cargar datos iniciales
    async loadInitialData() {
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
    }

    // Cargar productos
    async loadProductos() {
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

    // Cargar categorías
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

    // Cargar marcas
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

    // Actualizar card del dashboard
    updateDashboardCard(cardType, value) {
        const card = document.querySelector(`[data-card="${cardType}"] .number`);
        if (card) {
            card.textContent = value;
        }
    }    // Función auxiliar para obtener la ruta correcta de imagen placeholder
    getPlaceholderImagePath() {
        // Detectar si estamos en el panel admin (desde html/) o en otra página
        const currentPath = window.location.pathname;
        const isInHtmlFolder = currentPath.includes('/html/') || currentPath.includes('\\html\\');
        
        if (isInHtmlFolder) {
            return '../IMAGENES/placeholder-simple.svg';
        } else {
            return 'IMAGENES/placeholder-simple.svg';
        }
    }

    // Función auxiliar para obtener la ruta correcta de cualquier imagen
    getImagePath(imagePath) {
        if (!imagePath) return this.getPlaceholderImagePath();
        
        // Si es una URL completa (http/https), usarla tal como está
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        
        // Si es una ruta relativa que empieza con ../, usarla tal como está
        if (imagePath.startsWith('../')) {
            return imagePath;
        }
        
        // Si es una ruta absoluta desde la raíz, ajustarla según el contexto
        const currentPath = window.location.pathname;
        const isInHtmlFolder = currentPath.includes('/html/') || currentPath.includes('\\html\\');
        
        if (isInHtmlFolder && !imagePath.startsWith('../')) {
            // Estamos en html/ y la imagen no tiene ../, agregar ../
            return `../${imagePath}`;
        }
        
        return imagePath;
    }

    // Cargar datos de productos para mostrar
    async loadProductsData() {
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

            console.log(`🎨 Renderizando ${this.productos.length} productos...`);            const productsHTML = this.productos.map(product => {
                const imageSrc = this.getImagePath(product.imagen_url || product.imagen);
                const productName = product.nombre || 'Producto sin nombre';
                
                return `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${imageSrc}" 
                             alt="${productName}"
                             onerror="adminPanel.handleImageError(this, '${productName}');"
                             loading="lazy">
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${productName}</h3>
                        <p class="product-brand">${product.marca || ''}</p>
                        <div class="product-price">${this.getPrecioInfo(product)}</div>
                        <p class="product-category">${this.getCategoryName(product.categoria)}</p>
                        <div class="product-status">${this.getEstadoBadge(product.estado)}</div>
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
            `;
            }).join('');

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
    }    // Manejar envío del formulario de producto
    async handleProductSubmit(e) {
        try {
            this.showLoading(true);
            console.log('📝 Procesando formulario de producto...');
            
            const formData = new FormData(e.target);
            
            // Verificar si estamos editando
            const isEditMode = e.target.dataset.editId;
            const productId = isEditMode ? parseInt(isEditMode) : null;
            
            // Validación de campos requeridos antes de procesar
            const nombre = formData.get('nombre');
            const marca = formData.get('marca');
            const precio = formData.get('precio');
            const categoria = formData.get('categoria');
            
            if (!nombre || !marca || !precio || !categoria) {
                throw new Error('Por favor completa todos los campos requeridos: Nombre, Marca, Precio y Categoría');
            }
            
            if (!nombre.trim()) {
                throw new Error('El nombre del producto no puede estar vacío');
            }
            
            if (!marca.trim()) {
                throw new Error('La marca del producto no puede estar vacía');
            }
            
            const precioNum = parseInt(precio);
            if (isNaN(precioNum) || precioNum < 0) {
                throw new Error('El precio debe ser un número válido mayor o igual a 0');
            }
            
            // Recopilar datos del formulario
            const productData = {
                nombre: nombre.trim(),
                marca: marca.trim(),
                precio: precioNum,
                categoria: categoria,
                subcategoria: formData.get('subcategoria') || null,
                descripcion: formData.get('descripcion') || '',
                notas: formData.get('notas') || '',
                estado: formData.get('estado') || 'disponible',
                descuento: parseInt(formData.get('descuento')) || null,
                activo: formData.get('activo') === 'on'
            };            // Verificar estado de imagen antes de procesar
            this.verifyImageState();
            
            // Manejar imagen según el tipo activo
            console.log(`🖼️ Procesando imagen - Tipo: ${this.imageType}`);
            console.log(`🖼️ Datos de imagen disponibles: ${this.imageData ? 'Sí' : 'No'}`);
            
            if (this.imageType === 'url') {
                const imageUrl = formData.get('imagen_url');
                console.log(`🔗 Procesando URL de imagen: ${imageUrl}`);
                
                if (imageUrl && imageUrl.trim()) {
                    // Validar que la URL sea válida
                    const urlTrimmed = imageUrl.trim();
                    if (urlTrimmed.startsWith('http://') || urlTrimmed.startsWith('https://') || 
                        urlTrimmed.startsWith('./') || urlTrimmed.startsWith('../') || 
                        urlTrimmed.startsWith('/')) {
                        productData.imagen_url = urlTrimmed;
                        console.log(`✅ URL de imagen válida asignada: ${urlTrimmed.substring(0, 50)}...`);
                    } else {
                        console.warn('⚠️ URL de imagen no válida, ignorando:', urlTrimmed);
                    }
                } else {
                    console.log('ℹ️ No se proporcionó URL de imagen');
                }
            } else if (this.imageType === 'file') {
                console.log(`📁 Procesando archivo - Datos disponibles: ${this.imageData ? 'Sí' : 'No'}`);
                
                if (this.imageData) {
                    productData.imagen_url = this.imageData;
                    console.log(`✅ Archivo de imagen asignado:`);
                    console.log(`   - Tamaño: ${(this.imageData.length / 1024).toFixed(1)}KB`);
                    console.log(`   - Formato: ${this.imageData.startsWith('data:image/') ? 'Base64 válido' : 'Formato inválido'}`);
                    console.log(`   - Inicio: ${this.imageData.substring(0, 50)}...`);
                } else {
                    console.warn('⚠️ Tipo de imagen es "file" pero no hay datos de imagen');
                    
                    // Intentar obtener del input de archivo
                    const fileInput = document.getElementById('imagen_file');
                    if (fileInput && fileInput.files && fileInput.files[0]) {
                        console.log('� Intentando procesar archivo del input...');
                        const file = fileInput.files[0];
                          // Usar FileReader de forma síncrona (con Promise)
                        try {
                            const fileData = await this.readFileAsDataURL(file);
                            if (fileData) {
                                productData.imagen_url = fileData;
                                this.imageData = fileData; // Actualizar estado interno
                                console.log(`✅ Archivo procesado en tiempo real:`);
                                console.log(`   - Tamaño: ${(fileData.length / 1024).toFixed(1)}KB`);
                                console.log(`   - Formato: ${fileData.startsWith('data:image/') ? 'Base64 válido' : 'Formato inválido'}`);
                            } else {
                                console.error('❌ No se pudo procesar el archivo');
                                throw new Error('No se pudo procesar el archivo de imagen. Intenta de nuevo.');
                            }                        } catch (fileError) {
                            console.error('❌ Error procesando archivo:', fileError);
                            throw new Error('Error procesando el archivo de imagen: ' + fileError.message);
                        }
                    } else {
                        console.error('❌ No hay archivo disponible en el input');
                        throw new Error('No se encontró archivo de imagen. Por favor selecciona una imagen válida.');                    }
                }
            }

            console.log('📦 Datos del producto validados:', {
                ...productData,
                imagen_url: productData.imagen_url ? 
                    `${productData.imagen_url.substring(0, 50)}... (${productData.imagen_url.length} chars)` : 
                    'No imagen'
            });
            
            let result;
            if (isEditMode) {
                result = await this.updateProduct(productId, productData);
            } else {
                result = await this.saveProduct(productData);
            }

            if (result) {
                // Limpiar formulario después del éxito
                e.target.reset();
                
                // Limpiar imagen y datos relacionados
                this.clearImageInputs(); 
                this.imageData = null;
                this.imageType = 'url';
                
                // Reactivar tab por defecto (URL)
                const urlTab = document.querySelector('.tab-btn[data-tab="url"]');
                const fileTab = document.querySelector('.tab-btn[data-tab="file"]');
                const urlContent = document.getElementById('url-tab');
                const fileContent = document.getElementById('file-tab');
                
                if (urlTab && fileTab && urlContent && fileContent) {
                    urlTab.classList.add('active');
                    fileTab.classList.remove('active');
                    urlContent.classList.add('active');
                    fileContent.classList.remove('active');
                }
                
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
                this.showAlert(`Producto ${action} exitosamente`, 'success');
                console.log(`✅ Producto ${action}:`, result);
                
                // Navegar a la lista de productos
                this.showSection('productos');
            }
              
        } catch (error) {
            console.error('❌ Error guardando producto:', error);
            
            // Mostrar mensaje de error más específico
            let errorMessage = 'Error guardando producto: ';
            
            if (error.message.includes('campos requeridos')) {
                errorMessage = error.message;
            } else if (error.message.includes('número válido')) {
                errorMessage = error.message;
            } else if (error.message.includes('ya existe')) {
                errorMessage = error.message;
            } else if (error.message.includes('demasiado alto')) {
                errorMessage = error.message;
            } else if (error.message.includes('estructura de base de datos')) {
                errorMessage = 'Error de configuración de la base de datos. Contacta al administrador.';
            } else if (error.message.includes('no está configurado')) {
                errorMessage = 'Error de conexión con la base de datos. Verifica tu conexión.';
            } else {
                errorMessage += error.message;
            }
            
            this.showAlert(errorMessage, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Guardar producto
    async saveProduct(productData) {
        try {
            console.log('💾 Intentando guardar producto...');
            
            if (typeof ProductosService === 'undefined') {
                throw new Error('ProductosService no está disponible');
            }
            
            const result = await ProductosService.crearProducto(productData);
            console.log('✅ Producto guardado:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Error guardando producto:', error);
            throw error;
        }
    }

    // Actualizar producto
    async updateProduct(productId, productData) {
        try {
            console.log(`💾 Actualizando producto ID ${productId}...`);
            
            if (typeof ProductosService === 'undefined') {
                throw new Error('ProductosService no está disponible');
            }
            
            const result = await ProductosService.updateProduct(productId, productData);
            console.log('✅ Producto actualizado:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Error actualizando producto:', error);
            throw error;
        }
    }

    // Editar producto
    async editProduct(productId) {
        try {
            console.log(`✏️ Editando producto ID: ${productId}`);
            
            const product = this.productos.find(p => p.id === productId);
            if (!product) {
                this.showAlert('Producto no encontrado', 'error');
                return;
            }
            
            // Cambiar a la sección de agregar producto
            this.showSection('agregar-producto');
            
            // Poblar formulario
            this.populateEditForm(product);
            
            // Marcar como modo edición
            this.setFormEditMode(true, productId);
            
        } catch (error) {
            console.error('❌ Error editando producto:', error);
            this.showAlert('Error editando producto: ' + error.message, 'error');
        }
    }

    // Poblar formulario de edición
    populateEditForm(product) {
        console.log('📝 Poblando formulario con datos del producto:', product);
        
        // Función auxiliar para establecer valor de forma segura
        const safeSetValue = (id, value, defaultValue = '') => {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value !== false;
                } else {
                    element.value = value || defaultValue;
                }
            }
        };

        // Poblar campos básicos
        safeSetValue('nombre', product.nombre);
        safeSetValue('marca', product.marca);
        safeSetValue('precio', product.precio);
        safeSetValue('categoria', product.categoria);
        safeSetValue('subcategoria', product.subcategoria);
        safeSetValue('descripcion', product.descripcion);
        safeSetValue('notas', product.notas);
        safeSetValue('estado', product.estado, 'disponible');
        safeSetValue('descuento', product.descuento);
        safeSetValue('activo', product.activo);
        
        // Manejar imagen
        if (product.imagen_url) {
            safeSetValue('imagen_url', product.imagen_url);
            this.previewImageFromUrl(product.imagen_url);
        }

        // Manejar estado y descuento
        this.handleEstadoChange();
    }

    // Establecer modo de edición del formulario
    setFormEditMode(isEditMode, productId = null) {
        const form = document.getElementById('productForm');
        const title = document.querySelector('#agregar-producto .section-title');
        const submitBtn = document.querySelector('#productForm button[type="submit"]');
        
        if (isEditMode) {
            form.dataset.editId = productId;
            if (title) title.textContent = 'Editar Producto';
            if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Producto';
        } else {
            delete form.dataset.editId;
            if (title) title.textContent = 'Agregar Nuevo Producto';
            if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-plus"></i> Agregar Producto';
        }
    }    // Eliminar producto
    async deleteProduct(productId) {
        const product = this.productos.find(p => p.id === productId);
        const productName = product ? product.nombre : `ID ${productId}`;
        
        if (!confirm(`¿Estás seguro de que quieres eliminar el producto "${productName}"?\n\nEsta acción no se puede deshacer.`)) {
            return;
        }

        try {
            console.log(`🗑️ Eliminando producto ID: ${productId}`);
            this.showLoading(true);
            
            if (typeof ProductosService === 'undefined') {
                throw new Error('ProductosService no está disponible');
            }
            
            let result = null;
            let eliminationSuccessful = false;
            
            // Intentar eliminación con múltiples métodos para mayor robustez
            try {
                console.log('🔄 Intentando método principal...');
                result = await ProductosService.deleteProduct(productId);
                eliminationSuccessful = result && result.success;
                console.log('✅ Método principal completado:', result);
            } catch (normalError) {
                console.warn('⚠️ Método principal falló:', normalError.message);
                
                // Si el método principal falla, intentar con el método alternativo
                try {
                    console.log('🔄 Intentando método alternativo...');
                    result = await ProductosService.deleteProductSimple(productId);
                    eliminationSuccessful = result && result.success;
                    console.log('✅ Método alternativo completado:', result);
                } catch (simpleError) {
                    console.error('❌ Método alternativo también falló:', simpleError.message);
                    throw simpleError;
                }
            }
            
            // Verificar si la eliminación fue exitosa
            if (eliminationSuccessful) {
                console.log('🎉 Eliminación confirmada como exitosa');
                
                // Forzar recarga de productos para sincronizar el estado
                console.log('🔄 Recargando productos para sincronizar...');
                await this.loadProductos();
                
                // Actualizar vista si estamos en la sección de productos
                if (this.currentSection === 'productos') {
                    await this.loadProductsData();
                }
                
                // Actualizar dashboard
                await this.loadDashboardData();
                
                // Mostrar mensaje de éxito
                const successMessage = result.message || `Producto "${productName}" eliminado exitosamente`;
                this.showAlert(successMessage, 'success');
                console.log('✅ Proceso de eliminación completado exitosamente');
                
            } else {
                throw new Error('No se recibió confirmación de eliminación exitosa');
            }
            
        } catch (error) {
            console.error('❌ Error eliminando producto:', error);
            
            // Independientemente del error, intentar recargar productos para sincronizar estado
            try {
                console.log('🔄 Recargando productos después del error para sincronizar...');
                await this.loadProductos();
                if (this.currentSection === 'productos') {
                    await this.loadProductsData();
                }
                await this.loadDashboardData();
            } catch (reloadError) {
                console.warn('⚠️ Error recargando después del fallo:', reloadError.message);
            }
            
            // Determinar el mensaje de error apropiado
            let errorMessage = 'Error eliminando producto: ';
            
            if (error.message.includes('no existe') || error.message.includes('ya fue eliminado')) {
                errorMessage += 'El producto no existe o ya fue eliminado.';
                // En este caso, mostrar como warning en lugar de error
                this.showAlert(errorMessage.replace('Error eliminando producto: ', ''), 'warning');
                return; // Salir sin mostrar error grave
            } else if (error.message.includes('aún existe después')) {
                errorMessage += 'No se pudo completar la eliminación. Esto puede deberse a restricciones de la base de datos o problemas de permisos.';
            } else if (error.message.includes('referenciado en otras tablas')) {
                errorMessage += 'No se puede eliminar porque está siendo utilizado en otras partes del sistema.';
            } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
                errorMessage += 'No se pudo conectar a la base de datos. Verifica tu conexión a internet.';
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

    // Filtrar productos
    filterProducts(searchTerm) {
        const filteredProducts = this.productos.filter(product => 
            product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.marca && product.marca.toLowerCase().includes(searchTerm.toLowerCase())) ||
            product.categoria.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        this.renderFilteredProducts(filteredProducts);
    }    // Renderizar productos filtrados
    renderFilteredProducts(products) {
        const container = document.querySelector('.products-grid');
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = '<div class="no-products">No se encontraron productos</div>';
            return;
        }        const productsHTML = products.map(product => {
            const imageSrc = this.getImagePath(product.imagen_url || product.imagen);
            const productName = product.nombre || 'Producto sin nombre';
            
            return `
            <div class="product-card">
                <div class="product-image">
                    <img src="${imageSrc}" 
                         alt="${productName}"
                         onerror="adminPanel.handleImageError(this, '${productName}');"
                         loading="lazy">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${productName}</h3>
                    <p class="product-brand">${product.marca || ''}</p>
                    <div class="product-price">${this.getPrecioInfo(product)}</div>
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
        `;
        }).join('');

        container.innerHTML = productsHTML;
    }

    // Manejar cambio de estado
    handleEstadoChange() {
        const estadoSelect = document.getElementById('estado');
        const descuentoGroup = document.getElementById('descuentoGroup');
        const descuentoInput = document.getElementById('descuento');
        
        if (!estadoSelect || !descuentoGroup) return;
        
        const selectedEstado = estadoSelect.value;
        
        if (selectedEstado === 'oferta') {
            descuentoGroup.style.display = 'block';
            descuentoInput.required = true;
        } else {
            descuentoGroup.style.display = 'none';
            descuentoInput.required = false;
            descuentoInput.value = '';
            this.updatePrecioConDescuento();
        }
    }

    // Actualizar precio con descuento
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
    }    // Preview de imagen desde URL
    previewImageFromUrl(url = null) {
        const imageUrl = url || document.getElementById('imagen_url').value;
        const imagePreview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
          if (!imageUrl.trim()) {
            this.clearImagePreview(); // Solo limpiar preview si no hay URL
            return;
        }
        
        console.log(`🖼️ Cargando preview de imagen: ${imageUrl}`);
        
        // Mostrar loading en el preview
        if (imagePreview && previewImg) {
            imagePreview.style.display = 'block';
            previewImg.src = '';
            previewImg.alt = 'Cargando imagen...';
            previewImg.style.opacity = '0.5';
        }
        
        // Usar la función helper para obtener la ruta correcta
        const correctImageUrl = this.getImagePath(imageUrl);
        
        const img = new Image();
        img.onload = () => {
            console.log(`✅ Imagen cargada exitosamente: ${correctImageUrl}`);
            if (previewImg) {
                previewImg.src = correctImageUrl;
                previewImg.alt = 'Vista previa de imagen';
                previewImg.style.opacity = '1';
            }
            if (imagePreview) {
                imagePreview.style.display = 'block';
            }
        };
        
        img.onerror = () => {
            console.warn(`⚠️ Error cargando imagen: ${correctImageUrl}`);
            
            // Intentar con la URL original si la corrección falló
            if (correctImageUrl !== imageUrl) {
                console.log(`🔄 Intentando con URL original: ${imageUrl}`);
                const imgOriginal = new Image();
                imgOriginal.onload = () => {
                    console.log(`✅ Imagen cargada con URL original: ${imageUrl}`);
                    if (previewImg) {
                        previewImg.src = imageUrl;
                        previewImg.alt = 'Vista previa de imagen';
                        previewImg.style.opacity = '1';
                    }
                    if (imagePreview) {
                        imagePreview.style.display = 'block';
                    }
                };
                imgOriginal.onerror = () => {
                    this.handleImagePreviewError(imageUrl);
                };
                imgOriginal.src = imageUrl;
            } else {
                this.handleImagePreviewError(imageUrl);
            }
        };
        
        img.src = correctImageUrl;
    }
    
    // Manejar error en preview de imagen
    handleImagePreviewError(url) {
        console.error(`❌ No se pudo cargar la imagen: ${url}`);
        const imagePreview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        
        if (previewImg) {
            // Mostrar placeholder en caso de error
            previewImg.src = this.getPlaceholderImagePath();
            previewImg.alt = 'Error cargando imagen - usando placeholder';
            previewImg.style.opacity = '1';
        }
        
        if (imagePreview) {
            imagePreview.style.display = 'block';
        }
        
        this.showAlert(`No se pudo cargar la imagen desde la URL: ${url}`, 'warning');
    }    // Preview de imagen desde archivo
    previewImageFromFile(input) {
        const file = input.files[0];
        const imagePreview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        
        console.log(`📁 Procesando archivo de imagen:`, file);
        
        if (!file) {
            console.log('❌ No se seleccionó archivo');
            this.clearImagePreview(); // Solo limpiar preview, no inputs
            this.imageData = null;
            this.imageType = 'url'; // Volver al tipo por defecto
            return;
        }
        
        if (!file.type.startsWith('image/')) {
            console.error(`❌ Tipo de archivo inválido: ${file.type}`);
            this.showAlert('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP)', 'error');
            input.value = '';
            this.imageData = null;
            this.imageType = 'url';
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            console.error(`❌ Archivo muy grande: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
            this.showAlert('La imagen es muy grande. Máximo 5MB', 'error');
            input.value = '';
            this.imageData = null;
            this.imageType = 'url';
            return;
        }
        
        console.log(`✅ Archivo válido: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
        
        // Mostrar loading
        if (imagePreview && previewImg) {
            imagePreview.style.display = 'block';
            previewImg.src = '';
            previewImg.alt = 'Cargando archivo...';
            previewImg.style.opacity = '0.5';
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            console.log(`✅ Archivo leído exitosamente`);
            console.log(`📊 Tipo de datos: ${typeof imageData}`);
            console.log(`📊 Tamaño de datos: ${imageData ? imageData.length : 0} caracteres`);
            console.log(`📊 Inicio de datos: ${imageData ? imageData.substring(0, 50) : 'No datos'}...`);
            
            if (previewImg) {
                previewImg.src = imageData;
                previewImg.alt = `Preview de ${file.name}`;
                previewImg.style.opacity = '1';
            }
            if (imagePreview) {
                imagePreview.style.display = 'block';
            }
            
            // Guardar datos de imagen y establecer tipo
            this.imageData = imageData;
            this.imageType = 'file';
            
            console.log(`📊 Datos de imagen guardados correctamente:`);
            console.log(`   - Tipo: ${this.imageType}`);
            console.log(`   - Tamaño: ${(imageData.length / 1024).toFixed(1)}KB`);
            console.log(`   - Formato: ${imageData.startsWith('data:image/') ? 'Base64 válido' : 'Formato inválido'}`);
            
            // Verificar que los datos se guardaron correctamente
            if (this.imageData && this.imageType === 'file') {
                console.log(`✅ Imagen lista para enviar`);
            } else {
                console.error(`❌ Error guardando datos de imagen`);
            }
        };
        
        reader.onerror = () => {
            console.error(`❌ Error leyendo archivo: ${file.name}`);
            this.showAlert('Error leyendo el archivo de imagen', 'error');
            input.value = '';
            this.imageData = null;
            this.imageType = 'url';
            this.clearImagePreview(true); // Limpiar todo en caso de error
        };
        
        reader.readAsDataURL(file);
    }// Limpiar preview de imagen (mantener inputs a menos que se especifique)
    clearImagePreview(clearInputs = false) {
        console.log(`🧹 Limpiando preview de imagen${clearInputs ? ' e inputs' : ''}...`);
        
        const imagePreview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        
        if (imagePreview) {
            imagePreview.style.display = 'none';
        }
        
        if (previewImg) {
            previewImg.src = '';
            previewImg.alt = '';
            previewImg.style.opacity = '1';
        }
        
        // Solo limpiar inputs si se especifica explícitamente
        if (clearInputs) {
            const imageUrlInput = document.getElementById('imagen_url');
            const imageFileInput = document.getElementById('imagen_file');
            
            if (imageUrlInput) imageUrlInput.value = '';
            if (imageFileInput) imageFileInput.value = '';
            
            // Limpiar datos internos
            this.imageData = null;
            this.imageType = 'url';
        }
        
        console.log('✅ Preview limpiado');
    }
      // Limpiar formulario completo (incluyendo inputs)
    clearImageInputs() {
        console.log('🧹 Limpiando inputs de imagen completamente...');
        
        // Usar la función mejorada con parámetro para limpiar inputs
        this.clearImagePreview(true);
        
        console.log('✅ Inputs de imagen limpiados completamente');
    }

    // Validar precio
    validatePrice(input) {
        const value = parseInt(input.value);
        const PRECIO_MAXIMO = 2147483647;
        
        if (value > PRECIO_MAXIMO) {
            input.value = PRECIO_MAXIMO;
            this.showAlert(`Precio ajustado al máximo permitido: $${this.formatPrice(PRECIO_MAXIMO)}`, 'warning');
        }
        
        if (value < 0) {
            input.value = 0;
        }
    }

    // Verificar conexión
    checkConnection() {
        const statusElement = document.getElementById('connection-status');
        if (!statusElement) return;

        if (typeof ProductosService !== 'undefined') {
            statusElement.textContent = 'Conectado ✅';
            statusElement.style.color = 'green';
        } else {
            statusElement.textContent = 'Desconectado ❌';
            statusElement.style.color = 'red';
        }
    }

    // Mostrar loading
    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
    }

    // Mostrar alerta
    showAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
            ${message}
        `;

        document.body.appendChild(alert);

        alert.style.position = 'fixed';
        alert.style.top = '20px';
        alert.style.right = '20px';
        alert.style.zIndex = '10001';
        alert.style.maxWidth = '400px';
        alert.style.padding = '12px 16px';
        alert.style.borderRadius = '4px';
        alert.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        
        if (type === 'success') {
            alert.style.backgroundColor = '#d4edda';
            alert.style.color = '#155724';
            alert.style.border = '1px solid #c3e6cb';
        } else if (type === 'error') {
            alert.style.backgroundColor = '#f8d7da';
            alert.style.color = '#721c24';
            alert.style.border = '1px solid #f5c6cb';
        } else if (type === 'warning') {
            alert.style.backgroundColor = '#fff3cd';
            alert.style.color = '#856404';
            alert.style.border = '1px solid #ffeaa7';
        } else {
            alert.style.backgroundColor = '#d1ecf1';
            alert.style.color = '#0c5460';
            alert.style.border = '1px solid #bee5eb';
        }

        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 5000);
    }

    // Método de recarga para debugging
    async reloadProducts() {
        console.log('🔄 Recargando productos forzadamente...');
        
        try {
            this.showLoading(true);
            this.productos = [];
            await this.loadProductos();
            
            if (this.currentSection === 'productos') {
                await this.loadProductsData();
            }
            
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

    // Función auxiliar para manejar errores de imagen de forma inteligente
    handleImageError(imgElement, productName = '') {
        // Evitar bucles infinitos de error
        if (imgElement.hasAttribute('data-error-handled')) {
            return;
        }
        
        imgElement.setAttribute('data-error-handled', 'true');
        
        const placeholderSrc = this.getPlaceholderImagePath();
        console.warn(`⚠️ Error cargando imagen${productName ? ` para ${productName}` : ''}, usando placeholder: ${placeholderSrc}`);
        
        // Agregar una pequeña pausa antes de cambiar la imagen para evitar flasheo
        setTimeout(() => {
            imgElement.src = placeholderSrc;
            imgElement.alt = `Imagen no disponible${productName ? ` - ${productName}` : ''}`;
        }, 100);
   }

    // Verificar estado de imagen antes del envío
    verifyImageState() {
        console.log('🔍 Verificando estado de imagen...');
        console.log(`   - Tipo actual: ${this.imageType}`);
        console.log(`   - Datos disponibles: ${this.imageData ? 'Sí' : 'No'}`);
        
        if (this.imageData) {
            console.log(`   - Tamaño de datos: ${this.imageData.length} caracteres`);
            console.log(`   - Es base64: ${this.imageData.startsWith('data:') ? 'Sí' : 'No'}`);
            console.log(`   - Inicio: ${this.imageData.substring(0, 30)}...`);
        }
        
        const urlInput = document.getElementById('imagen_url');
        const fileInput = document.getElementById('imagen_file');
        
        console.log(`   - URL input: ${urlInput ? urlInput.value : 'No encontrado'}`);
        console.log(`   - File input: ${fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0].name : 'No archivo'}`);
        
        // Verificar consistencia
        if (this.imageType === 'file' && !this.imageData) {
            console.warn('⚠️ INCONSISTENCIA: Tipo es "file" pero no hay datos');
            return false;
        }
        
        if (this.imageType === 'url' && this.imageData && this.imageData.startsWith('data:')) {
            console.warn('⚠️ INCONSISTENCIA: Tipo es "url" pero hay datos base64');
            return false;
        }
        
        return true;
    }

    // Función auxiliar para leer archivo como Data URL de forma síncrona
    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No se proporcionó archivo'));
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                reject(new Error('El archivo no es una imagen válida'));
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                reject(new Error('El archivo es muy grande (máximo 5MB)'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const result = e.target.result;
                if (result && result.startsWith('data:image/')) {
                    resolve(result);
                } else {
                    reject(new Error('Error procesando el archivo de imagen'));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Error leyendo el archivo'));
            };
            
            reader.readAsDataURL(file);
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM listo, inicializando AdminPanel...');
    
    // Verificar que el HTML del panel esté presente
    const panelContainer = document.querySelector('.admin-container');
    if (!panelContainer) {
        console.error('❌ No se encontró el contenedor del panel de administración');
        return;
    }
    
    // Inicializar panel
    window.adminPanel = new AdminPanel();
});

// Exportar para uso global
window.AdminPanel = AdminPanel;
