// Script para migrar productos existentes a Supabase
async function migrarDatos() {
    console.log('🚀 Iniciando migración de datos...');

    // Primero crear categorías si no existen
    const categorias = [
        { nombre: "Para Ellos", slug: "para-ellos", descripcion: "Fragancias masculinas" },
        { nombre: "Para Ellas", slug: "para-ellas", descripcion: "Fragancias femeninas" },
        { nombre: "Unisex", slug: "unisex", descripcion: "Fragancias para todos" },
        { nombre: "Clásicas", slug: "clasicas", descripcion: "Fragancias atemporales" },
        { nombre: "Exclusivas", slug: "exclusivas", descripcion: "Fragancias de lujo" },
        { nombre: "Vintage", slug: "vintage", descripcion: "Fragancias retro" }
    ];

    for (const categoria of categorias) {
        const { error } = await supabaseClient
            .from('categorias')
            .insert(categoria);
        
        if (error && !error.message.includes('duplicate')) {
            console.error('Error insertando categoría:', categoria.nombre, error);
        } else {
            console.log('✓ Categoría insertada:', categoria.nombre);
        }
    }

    // Insertar marcas únicas
    const marcasUnicas = [...new Set(productosOriginales.map(p => p.marca))];
    
    for (const marca of marcasUnicas) {
        const { error } = await supabaseClient
            .from('marcas')
            .insert({ 
                nombre: marca,
                descripcion: `Marca ${marca}`,
                activo: true
            });
        
        if (error && !error.message.includes('duplicate')) {
            console.error('Error insertando marca:', marca, error);
        } else {
            console.log('✓ Marca insertada:', marca);
        }
    }

    // Obtener IDs de marcas y categorías
    const { data: marcas } = await supabaseClient.from('marcas').select('*');
    const { data: categoriasDb } = await supabaseClient.from('categorias').select('*');

    // Crear mapas para búsqueda rápida
    const marcasMap = marcas.reduce((acc, marca) => {
        acc[marca.nombre] = marca.id;
        return acc;
    }, {});

    const categoriasMap = categoriasDb.reduce((acc, cat) => {
        acc[cat.slug] = cat.id;
        return acc;
    }, {});

    // Migrar productos
    for (const producto of productosOriginales) {
        const productoSupabase = {
            nombre: producto.nombre,
            marca_id: marcasMap[producto.marca],
            categoria_id: categoriasMap[producto.categoria],
            precio: producto.precio,
            descripcion: producto.descripcion,
            descripcion_corta: producto.descripcionCorta || producto.descripcion?.substring(0, 150) + '...',
            notas_salida: producto.notasOlfativas?.salida || [],
            notas_corazon: producto.notasOlfativas?.corazon || [],
            notas_fondo: producto.notasOlfativas?.fondo || [],
            imagen_principal: producto.imagen,
            slug: producto.nombre.toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, ''),
            stock: Math.floor(Math.random() * 50) + 10, // Stock aleatorio para demo
            disponible: true,
            activo: true
        };        const { error } = await supabaseClient
            .from('productos')
            .insert(productoSupabase);

        if (error) {
            console.error('Error insertando producto:', producto.nombre, error);
        } else {
            console.log('✓ Producto migrado:', producto.nombre);
        }
    }

    console.log('🎉 Migración completada!');
}

// Array de productos para migrar
const productosOriginales = [
    {
        nombre: "212 Carolina Herrera",
        marca: "Carolina Herrera",
        categoria: "para-ellos",
        precio: 850000,
        imagen: "LOCIONES_PARA _ELLOS/212_CAROLINA_HERRERA.png",
        descripcion: "Una fragancia masculina sofisticada y moderna que combina frescura y elegancia en perfecta armonía.",
        descripcionCorta: "Fragancia masculina sofisticada",
        notasOlfativas: {
            salida: ["Bergamota", "Limón", "Pomelo"],
            corazon: ["Jengibre", "Violeta", "Gardenia"],
            fondo: ["Sándalo", "Almizcle", "Incienso"]
        }
    },
    {
        nombre: "Givenchy Blue Label",
        marca: "Givenchy",
        categoria: "para-ellos",
        precio: 920000,
        imagen: "LOCIONES_PARA _ELLOS/GIVENCHY_BLUE_LABEL.png",
        descripcion: "Elegancia y distinción en cada gota. Una fragancia que refleja la sofisticación francesa.",
        descripcionCorta: "Elegancia y distinción francesa",
        notasOlfativas: {
            salida: ["Bergamota", "Cardamomo", "Limón"],
            corazon: ["Lavanda", "Geranio", "Especias"],
            fondo: ["Vetiver", "Cedro", "Sándalo"]
        }
    },
    {
        nombre: "Montblanc Legend Night",
        marca: "Montblanc",
        categoria: "para-ellos",
        precio: 780000,
        imagen: "LOCIONES_PARA _ELLOS/MONTBLACK_LEGEND_NIGH.png",
        descripcion: "La noche cobra vida con esta fragancia intensa y seductora que despierta los sentidos.",
        descripcionCorta: "Fragancia nocturna intensa",
        notasOlfativas: {
            salida: ["Bergamota", "Salvia", "Cardamomo"],
            corazon: ["Cedro", "Lavanda", "Especias"],
            fondo: ["Vetiver", "Pachulí", "Oud"]
        }
    },
    {
        nombre: "One Million Paco Rabanne",
        marca: "Paco Rabanne",
        categoria: "para-ellos",
        precio: 950000,
        imagen: "LOCIONES_PARA _ELLOS/ONE_MILLON_PACO_RABANE.png",
        descripcion: "Lujo y opulencia en una fragancia irresistible que conquista y seduce sin límites.",
        descripcionCorta: "Lujo y opulencia irresistible",
        notasOlfativas: {
            salida: ["Pomelo", "Menta", "Mandarina"],
            corazon: ["Canela", "Rosa", "Especias"],
            fondo: ["Ámbar", "Cuero", "Madera blanca"]
        }
    },
    {
        nombre: "Versace Eros Blue",
        marca: "Versace",
        categoria: "para-ellos",
        precio: 890000,
        imagen: "LOCIONES_PARA _ELLOS/VERSACE_EROS_BLUE.png",
        descripcion: "Pasión mediterránea en una fragancia seductora que evoca el poder del amor y la atracción.",
        descripcionCorta: "Pasión mediterránea seductora",
        notasOlfativas: {
            salida: ["Limón", "Mandarina", "Menta"],
            corazon: ["Ambroxan", "Loto azul", "Geranio"],
            fondo: ["Sándalo", "Pachulí", "Maderas"]
        }
    }
];

// Función para ejecutar la migración manualmente
function ejecutarMigracion() {
    if (!supabaseClient) {
        console.error('❌ Supabase no está configurado. Por favor configura las credenciales primero.');
        return;
    }
    
    const confirmacion = confirm('¿Estás seguro de que quieres migrar todos los productos a Supabase?');
    if (confirmacion) {
        migrarDatos().then(() => {
            console.log('✅ Migración completada exitosamente');
        }).catch(error => {
            console.error('❌ Error durante la migración:', error);
        });
    }
}

// Exportar funciones
window.ejecutarMigracion = ejecutarMigracion;
