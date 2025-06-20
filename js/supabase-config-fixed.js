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
            console.error('Error en obtenerProductoPorId:', error);
            return this.obtenerProductoLocalPorId(id);
        }
    }

    // Obtener productos por categoría
    static async obtenerProductosPorCategoria(categoria) {
        return this.obtenerProductos({ categoria });
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
    }

    // Crear producto
    static async crearProducto(producto) {
        if (!supabaseClient) {
            console.error('Supabase no configurado');
            return null;
        }

        try {
            const { data, error } = await supabaseClient
                .from('productos')
                .insert([producto])
                .select()
                .single();

            if (error) {
                console.error('Error creando producto:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error en crearProducto:', error);
            return null;
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
                imagen: 'LOCIONES_PARA _ELLOS/212_CAROLINA_HERRERA.png',
                descripcion: 'Fragancia fresca y urbana para el hombre moderno',
                activo: true
            },
            {
                id: 2,
                nombre: 'Versace Eros Blue',
                marca: 'Versace',
                categoria: 'para-ellos',
                precio: 120000,
                imagen: 'LOCIONES_PARA _ELLOS/VERSACE_EROS_BLUE.png',
                descripcion: 'Frescura mediterránea con notas aromáticas',
                activo: true
            },
            {
                id: 3,
                nombre: 'One Million',
                marca: 'Paco Rabanne',
                categoria: 'para-ellos',
                precio: 110000,
                imagen: 'LOCIONES_PARA _ELLOS/ONE_MILLON_PACO_RABANE.png',
                descripcion: 'El aroma del éxito y la seducción',
                activo: true
            },
            {
                id: 4,
                nombre: 'Montblanc Legend Night',
                marca: 'Montblanc',
                categoria: 'para-ellos',
                precio: 95000,
                imagen: 'LOCIONES_PARA _ELLOS/MONTBLACK_LEGEND_NIGH.png',
                descripcion: 'Elegancia nocturna y sofisticación',
                activo: true
            },
            {
                id: 5,
                nombre: 'Givenchy Blue Label',
                marca: 'Givenchy',
                categoria: 'para-ellos',
                precio: 85000,
                imagen: 'LOCIONES_PARA _ELLOS/GIVENCHY_BLUE_LABEL.png',
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

// Función utilitaria para formatear precios
function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP'
    }).format(precio);
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
