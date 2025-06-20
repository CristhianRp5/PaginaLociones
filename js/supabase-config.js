// Configuración de Supabase - Versión Corregida
const SUPABASE_URL = 'https://xelobsbzytdxrrxgmlta.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbG9ic2J6eXRkeHJyeGdtbHRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzODUzNTksImV4cCI6MjA2NTk2MTM1OX0.bJL5DsL4pxlQ_FV3jX0ieiW3bYLA-Zf3M2HlNmdMMy4';

// Inicializar cliente de Supabase
let supabaseClient = null;

// Función para inicializar Supabase
function initSupabase() {
    try {
        if (typeof window !== 'undefined' && window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase client created successfully');
            return true;
        }
        console.log('⚠️ Supabase not available or not configured');
        return false;
    } catch (error) {
        console.error('❌ Error initializing Supabase:', error);
        return false;
    }
}

// Funciones para productos
class ProductosService {
    // Obtener todos los productos
    static async obtenerProductos(filtros = {}) {
        if (!supabaseClient) {
            console.warn('Supabase no configurado, usando datos locales');
            return this.obtenerProductosLocales(filtros);
        }

        try {
            let query = supabaseClient
                .from('productos')
                .select('*')
                .eq('activo', true);

            // Aplicar filtros básicos
            if (filtros.categoria) {
                query = query.eq('categoria', filtros.categoria);
            }
            
            if (filtros.busqueda) {
                query = query.or(
                    `nombre.ilike.%${filtros.busqueda}%,` +
                    `descripcion.ilike.%${filtros.busqueda}%,` +
                    `marca.ilike.%${filtros.busqueda}%`
                );
            }
            
            if (filtros.precioMin) {
                query = query.gte('precio', filtros.precioMin);
            }
            
            if (filtros.precioMax) {
                query = query.lte('precio', filtros.precioMax);
            }

            const { data, error } = await query.order('created_at', { ascending: false });
            
            if (error) {
                console.error('Error obteniendo productos:', error);
                return this.obtenerProductosLocales(filtros);
            }
            
            return data || [];
        } catch (error) {
            console.error('Error en obtenerProductos:', error);
            return this.obtenerProductosLocales(filtros);
        }
    }

    // Obtener producto por ID
    static async obtenerProductoPorId(id) {
        if (!supabaseClient) {
            return this.obtenerProductoLocalPorId(id);
        }

        try {
            const { data, error } = await supabaseClient
                .from('productos')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error obteniendo producto:', error);
                return this.obtenerProductoLocalPorId(id);
            }

            return data;
        } catch (error) {
            console.error('Error en obtenerProductoPorId:', error);            return this.obtenerProductoLocalPorId(id);
        }
    }

    // Obtener productos por categoría
    static async obtenerProductosPorCategoria(categoria) {
        console.log(`🔍 Buscando productos para categoría: "${categoria}"`);
        
        if (!supabaseClient) {
            console.warn('Supabase no configurado, usando datos locales');
            return this.obtenerProductosLocales({ categoria });
        }

        try {
            // Obtener todos los productos activos primero
            const { data: allData, error: allError } = await supabaseClient
                .from('productos')
                .select('*')
                .eq('activo', true);
            
            if (allError) {
                console.error('Error obteniendo productos:', allError);
                return this.obtenerProductosLocales({ categoria });
            }
            
            console.log(`📦 ${allData.length} productos totales encontrados en la BD`);
            
            // Log de todas las categorías para debugging
            const categorias = [...new Set(allData.map(p => p.categoria).filter(Boolean))];
            console.log(`📂 Categorías disponibles en BD:`, categorias);
            
            // Filtrar productos para la categoría específica con mayor flexibilidad
            let filteredData = allData.filter(product => {
                // Normalizar strings para comparación
                const normalize = (str) => str ? str.toLowerCase().trim() : '';
                const targetCategory = normalize(categoria);
                
                const matchCategory = normalize(product.categoria) === targetCategory;
                const matchSubcategory = normalize(product.subcategoria) === targetCategory;
                const matchTipo = normalize(product.tipo) === targetCategory;
                
                // Para "para-ellos", también buscar variantes comunes
                if (targetCategory === 'para-ellos') {
                    const isForMen = normalize(product.categoria).includes('ellos') ||
                                   normalize(product.categoria).includes('hombre') ||
                                   normalize(product.categoria).includes('masculino') ||
                                   normalize(product.subcategoria).includes('ellos') ||
                                   normalize(product.subcategoria).includes('hombre') ||
                                   normalize(product.subcategoria).includes('masculino');
                    
                    return matchCategory || matchSubcategory || matchTipo || isForMen;
                }
                
                return matchCategory || matchSubcategory || matchTipo;
            });
            
            console.log(`🎯 ${filteredData.length} productos filtrados para "${categoria}"`);
            
            // Log de productos encontrados para debugging
            if (filteredData.length > 0) {
                filteredData.forEach(product => {
                    console.log(`   - ${product.nombre} (cat: "${product.categoria}", subcat: "${product.subcategoria}")`);
                });
            }
            
            // Si no encuentra productos, intentar con fallback local
            if (filteredData.length === 0) {
                console.warn(`⚠️ No se encontraron productos para "${categoria}", usando datos locales`);
                return this.obtenerProductosLocales({ categoria });
            }
            
            return filteredData;
            
        } catch (error) {
            console.error('Error en obtenerProductosPorCategoria:', error);
            return this.obtenerProductosLocales({ categoria });
        }
    }

    // Buscar productos
    static async buscarProductos(termino) {
        return this.obtenerProductos({ busqueda: termino });
    }

    // Obtener categorías
    static async obtenerCategorias() {
        if (!supabaseClient) {
            return [
                { id: 1, nombre: 'Para Ellos', slug: 'para-ellos' },
                { id: 2, nombre: 'Para Ellas', slug: 'para-ellas' },
                { id: 3, nombre: 'Unisex', slug: 'unisex' },
                { id: 4, nombre: 'Clásicas', slug: 'clasicas' },
                { id: 5, nombre: 'Vintage', slug: 'vintage' }
            ];
        }

        try {
            const { data, error } = await supabaseClient
                .from('categorias')
                .select('*')
                .eq('activo', true)
                .order('nombre');

            if (error) {
                console.error('Error obteniendo categorías:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error en obtenerCategorias:', error);
            return [];
        }
    }

    // Obtener marcas
    static async obtenerMarcas() {
        if (!supabaseClient) {
            return [
                { id: 1, nombre: 'Chanel' },
                { id: 2, nombre: 'Dior' },
                { id: 3, nombre: 'Tom Ford' },
                { id: 4, nombre: 'Versace' },
                { id: 5, nombre: 'Paco Rabanne' }
            ];
        }

        try {
            const { data, error } = await supabaseClient
                .from('marcas')
                .select('*')
                .eq('activo', true)
                .order('nombre');

            if (error) {
                console.error('Error obteniendo marcas:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error en obtenerMarcas:', error);
            return [];
        }
    }    // Crear producto
    static async crearProducto(producto) {
        if (!supabaseClient) {
            console.error('❌ Supabase no configurado');
            throw new Error('Supabase no está configurado');
        }

        try {
            console.log('💾 Creando producto:', producto.nombre);
              // Validar datos requeridos
            if (!producto.nombre || !producto.marca || !producto.precio || !producto.categoria) {
                throw new Error('Faltan campos requeridos: nombre, marca, precio, categoria');
            }
            
            // Validar y limpiar precio antes de enviar
            let precioValidado = Number(producto.precio);
            if (isNaN(precioValidado)) {
                throw new Error('El precio debe ser un número válido');
            }
            
            // Límites de precio para PostgreSQL integer
            const PRECIO_MAX = 2147483647;
            const PRECIO_MIN = 0;
            
            if (precioValidado > PRECIO_MAX) {
                console.warn(`⚠️ Precio ${precioValidado} excede máximo, ajustando a ${PRECIO_MAX}`);
                precioValidado = PRECIO_MAX;
            }
            
            if (precioValidado < PRECIO_MIN) {
                console.warn(`⚠️ Precio ${precioValidado} es negativo, ajustando a ${PRECIO_MIN}`);
                precioValidado = PRECIO_MIN;
            }
            
            // Preparar datos BÁSICOS del producto (solo columnas que probablemente existen)
            const productDataBasic = {
                nombre: producto.nombre.trim(),
                marca: producto.marca.trim(),
                precio: precioValidado,
                categoria: producto.categoria,
                activo: producto.activo !== false // por defecto true
            };
            
            // Agregar campos opcionales solo si se proporcionan
            if (producto.descripcion) {
                productDataBasic.descripcion = producto.descripcion;
            }
            
            // Intentar con imagen_url/imagen
            if (producto.imagen_url) {
                productDataBasic.imagen_url = producto.imagen_url;
                productDataBasic.imagen = producto.imagen_url; // fallback
            }
            
            console.log('📤 Enviando datos básicos a Supabase:', productDataBasic);

            const { data, error } = await supabaseClient
                .from('productos')
                .insert([productDataBasic])
                .select()
                .single();            if (error) {
                console.error('❌ Error de Supabase:', error);
                
                // Manejar errores específicos
                if (error.message.includes('numeric field overflow')) {
                    throw new Error('El precio es demasiado alto. El máximo permitido es $2,147,483,647 COP.');
                }
                
                if (error.message.includes('duplicate key') || error.message.includes('unique')) {
                    throw new Error('Ya existe un producto con ese nombre. Por favor usa un nombre diferente.');
                }
                
                // Si hay error, intentar solo con campos mínimos (con precio validado)
                let precioValidado = Number(producto.precio);
                if (precioValidado > 2147483647) {
                    precioValidado = 2147483647;
                }
                if (precioValidado < 0) {
                    precioValidado = 0;
                }
                
                const productDataMinimal = {
                    nombre: producto.nombre.trim(),
                    marca: producto.marca.trim(),
                    precio: precioValidado,
                    categoria: producto.categoria
                };
                
                console.log('🔄 Reintentando con datos mínimos y precio validado:', productDataMinimal);
                
                const { data: retryData, error: retryError } = await supabaseClient
                    .from('productos')
                    .insert([productDataMinimal])
                    .select()
                    .single();
                    
                if (retryError) {
                    if (retryError.message.includes('numeric field overflow')) {
                        throw new Error('Error de precio: El valor es demasiado alto para la base de datos.');
                    }
                    throw new Error(`Error de base de datos: ${retryError.message}`);
                }
                
                console.log('✅ Producto creado con datos mínimos:', retryData);
                return retryData;
            }

            console.log('✅ Producto creado exitosamente:', data);
            return data;
            
        } catch (error) {
            console.error('❌ Error en crearProducto:', error);            throw error;
        }
    }

    // Datos locales como fallback
    static obtenerProductosLocales(filtros = {}) {
        const productos = [
            {
                id: 1,
                nombre: '212 Men',
                marca: 'Carolina Herrera',
                categoria: 'para-ellos',
                precio: 89000,
                imagen_url: '../LOCIONES_PARA _ELLOS/212_CAROLINA_HERRERA.png',
                descripcion: 'Fragancia fresca y urbana para el hombre moderno',
                activo: true
            },
            {
                id: 2,
                nombre: 'Versace Eros Blue',
                marca: 'Versace',
                categoria: 'para-ellos',
                precio: 120000,
                imagen_url: '../LOCIONES_PARA _ELLOS/VERSACE_EROS_BLUE.png',
                descripcion: 'Frescura mediterránea con notas aromáticas',
                activo: true
            },
            {
                id: 3,
                nombre: 'One Million',
                marca: 'Paco Rabanne',
                categoria: 'para-ellos',
                precio: 110000,
                imagen_url: '../LOCIONES_PARA _ELLOS/ONE_MILLON_PACO_RABANE.png',
                descripcion: 'El aroma del éxito y la seducción',
                activo: true
            },
            {
                id: 4,
                nombre: 'Montblanc Legend Night',
                marca: 'Montblanc',
                categoria: 'para-ellos',
                precio: 95000,
                imagen_url: '../LOCIONES_PARA _ELLOS/MONTBLACK_LEGEND_NIGH.png',
                descripcion: 'Elegancia nocturna y sofisticación',
                activo: true
            },
            {
                id: 5,
                nombre: 'Givenchy Blue Label',
                marca: 'Givenchy',
                categoria: 'para-ellos',
                precio: 85000,
                imagen_url: '../LOCIONES_PARA _ELLOS/GIVENCHY_BLUE_LABEL.png',
                descripcion: 'Frescura azul con carácter masculino',
                activo: true
            }
        ];

        let productosFiltrados = [...productos];

        // Aplicar filtros
        if (filtros.categoria) {
            productosFiltrados = productosFiltrados.filter(p => p.categoria === filtros.categoria);
        }

        if (filtros.busqueda) {
            const termino = filtros.busqueda.toLowerCase();
            productosFiltrados = productosFiltrados.filter(p => 
                p.nombre.toLowerCase().includes(termino) ||
                p.marca.toLowerCase().includes(termino) ||
                p.descripcion.toLowerCase().includes(termino)
            );
        }

        if (filtros.precioMin) {
            productosFiltrados = productosFiltrados.filter(p => p.precio >= filtros.precioMin);
        }

        if (filtros.precioMax) {
            productosFiltrados = productosFiltrados.filter(p => p.precio <= filtros.precioMax);
        }

        return productosFiltrados;
    }

    static obtenerProductoLocalPorId(id) {
        const productos = this.obtenerProductosLocales();
        return productos.find(p => p.id == id) || null;
    }
}

// Funciones para manejo de Storage (imágenes)
class ImageStorageService {
    // Subir imagen al storage de Supabase
    static async uploadImage(file, fileName) {
        if (!supabaseClient) {
            throw new Error('Supabase no está configurado');
        }

        try {
            console.log('📤 Subiendo imagen:', fileName);
            
            // Validar archivo
            if (!file || !(file instanceof File)) {
                throw new Error('Archivo no válido');
            }
            
            // Validar tamaño (5MB máximo)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('El archivo es demasiado grande. Máximo 5MB.');
            }
            
            // Validar tipo
            if (!file.type.startsWith('image/')) {
                throw new Error('El archivo debe ser una imagen');
            }
            
            // Crear nombre único para evitar colisiones
            const timestamp = new Date().getTime();
            const extension = file.name.split('.').pop();
            const uniqueFileName = `productos/${timestamp}_${fileName}.${extension}`;
            
            console.log('📁 Nombre de archivo:', uniqueFileName);
            
            // Subir archivo
            const { data, error } = await supabaseClient.storage
                .from('imagenes') // nombre del bucket
                .upload(uniqueFileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });
                
            if (error) {
                console.error('❌ Error subiendo imagen:', error);
                throw new Error(`Error subiendo imagen: ${error.message}`);
            }
            
            console.log('✅ Imagen subida:', data);
            
            // Obtener URL pública
            const { data: urlData } = supabaseClient.storage
                .from('imagenes')
                .getPublicUrl(uniqueFileName);
                
            if (!urlData || !urlData.publicUrl) {
                throw new Error('No se pudo obtener la URL pública de la imagen');
            }
            
            console.log('🔗 URL pública generada:', urlData.publicUrl);
            return urlData.publicUrl;
            
        } catch (error) {
            console.error('❌ Error en uploadImage:', error);
            throw error;
        }
    }
    
    // Subir imagen desde base64
    static async uploadImageFromBase64(base64Data, fileName) {
        try {
            console.log('📤 Subiendo imagen desde base64...');
            
            // Convertir base64 a blob
            const response = await fetch(base64Data);
            const blob = await response.blob();
            
            // Crear archivo a partir del blob
            const file = new File([blob], fileName, { type: blob.type });
            
            // Usar la función de upload normal
            return await this.uploadImage(file, fileName);
            
        } catch (error) {
            console.error('❌ Error convirtiendo base64:', error);
            throw new Error('Error procesando imagen: ' + error.message);
        }
    }
    
    // Eliminar imagen del storage
    static async deleteImage(imagePath) {
        if (!supabaseClient) {
            throw new Error('Supabase no está configurado');
        }
        
        try {
            console.log('🗑️ Eliminando imagen:', imagePath);
            
            // Extraer el path relativo de la URL completa
            const relativePath = imagePath.includes('/storage/v1/object/public/imagenes/') 
                ? imagePath.split('/storage/v1/object/public/imagenes/')[1]
                : imagePath;
            
            const { error } = await supabaseClient.storage
                .from('imagenes')
                .remove([relativePath]);
                
            if (error) {
                console.error('❌ Error eliminando imagen:', error);
                throw new Error(`Error eliminando imagen: ${error.message}`);
            }
            
            console.log('✅ Imagen eliminada');
            return true;
            
        } catch (error) {
            console.error('❌ Error en deleteImage:', error);
            throw error;
        }
    }
}

// Función utilitaria para formatear precios
function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP'
    }).format(precio);
}

// Función para probar conexión
async function testSupabaseConnection() {
    try {
        if (!supabaseClient) {
            console.warn('⚠️ Cliente de Supabase no inicializado');
            return false;
        }
        
        // Probar una consulta simple
        const { data, error } = await supabaseClient
            .from('productos')
            .select('count')
            .limit(1);
            
        if (error) {
            console.error('❌ Error probando conexión:', error);
            return false;
        }
        
        console.log('✅ Conexión a Supabase exitosa');
        return true;
        
    } catch (error) {
        console.error('❌ Error en testSupabaseConnection:', error);
        return false;
    }
}

// Función para verificar estructura de tabla
async function verificarEstructuraTabla() {
    try {
        if (!supabaseClient) {
            console.warn('⚠️ Supabase no configurado');
            return null;
        }
        
        // Intentar obtener estructura de la tabla
        const { data, error } = await supabaseClient
            .rpc('get_table_columns', { table_name: 'productos' })
            .single();
            
        if (error) {
            console.log('📋 Verificando estructura con método alternativo...');
            
            // Método alternativo: intentar una consulta vacía para ver las columnas
            const { data: emptyData, error: emptyError } = await supabaseClient
                .from('productos')
                .select('*')
                .limit(0);
                
            if (emptyError) {
                console.error('❌ Error verificando tabla:', emptyError);
                return null;
            }
            
            console.log('✅ Tabla productos accesible');
            return true;
        }
        
        console.log('📋 Estructura de tabla productos:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error verificando estructura:', error);
        return null;
    }
}

// Inicializar cuando se carga el script
document.addEventListener('DOMContentLoaded', function() {
    const supabaseInicializado = initSupabase();
    if (supabaseInicializado) {
        console.log('✅ Supabase inicializado correctamente');
    } else {
        console.warn('⚠️ Supabase no configurado - usando datos locales como fallback');
    }
});

// Exportar para uso global
window.ProductosService = ProductosService;
window.formatearPrecio = formatearPrecio;
window.initSupabase = initSupabase;
