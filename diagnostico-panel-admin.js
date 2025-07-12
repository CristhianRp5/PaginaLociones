console.log('🔍 DIAGNÓSTICO DEL PANEL DE ADMINISTRACIÓN');
console.log('==========================================');

// Verificar dependencias
console.log('1. Verificando dependencias...');
console.log('   - Supabase disponible:', typeof window.supabase !== 'undefined');
console.log('   - Cliente Supabase disponible:', typeof supabaseClient !== 'undefined');
console.log('   - ProductosServiceOptimized disponible:', typeof ProductosServiceOptimized !== 'undefined');
console.log('   - AdminPanel disponible:', typeof AdminPanel !== 'undefined');

// Verificar instancia del panel
console.log('\n2. Verificando instancia del panel...');
console.log('   - window.adminPanel existe:', typeof window.adminPanel !== 'undefined');
if (window.adminPanel) {
    console.log('   - Productos cargados:', window.adminPanel.productos.length);
    console.log('   - Datos cargados:', window.adminPanel.dataLoaded);
    console.log('   - Cargando datos:', window.adminPanel.loadingData);
}

// Verificar conexión a base de datos
console.log('\n3. Verificando conexión a base de datos...');
if (typeof supabaseClient !== 'undefined') {
    supabaseClient
        .from('productos')
        .select('count(*)')
        .then(({ data, error }) => {
            if (error) {
                console.error('   ❌ Error de conexión:', error);
            } else {
                console.log('   ✅ Conexión exitosa');
            }
        });
} else {
    console.log('   ❌ Cliente Supabase no disponible');
}

// Verificar elementos del DOM
console.log('\n4. Verificando elementos del DOM...');
const elements = {
    'products-grid': document.querySelector('.products-grid'),
    'productForm': document.getElementById('productForm'),
    'searchProducts': document.getElementById('searchProducts'),
    'refreshData': document.getElementById('refreshData')
};

Object.entries(elements).forEach(([name, element]) => {
    console.log(`   - ${name}:`, element ? 'Encontrado' : 'No encontrado');
});

// Función para diagnóstico completo
window.diagnosticoCompleto = async function() {
    console.log('\n🚀 INICIANDO DIAGNÓSTICO COMPLETO...');
    
    try {
        // Test 1: Verificar carga de productos
        console.log('\n📦 Test 1: Cargando productos...');
        if (window.adminPanel && typeof window.adminPanel.loadProductos === 'function') {
            await window.adminPanel.loadProductos();
            console.log('   ✅ Productos cargados:', window.adminPanel.productos.length);
        } else {
            console.log('   ❌ Función loadProductos no disponible');
        }
        
        // Test 2: Verificar servicio optimizado
        console.log('\n⚡ Test 2: Servicio optimizado...');
        if (typeof ProductosServiceOptimized !== 'undefined') {
            const productos = await ProductosServiceOptimized.obtenerProductosOptimizado();
            console.log('   ✅ Productos del servicio optimizado:', productos.length);
        } else {
            console.log('   ❌ ProductosServiceOptimized no disponible');
        }
        
        // Test 3: Verificar renderizado
        console.log('\n🎨 Test 3: Renderizado de productos...');
        if (window.adminPanel && typeof window.adminPanel.loadProductsData === 'function') {
            await window.adminPanel.loadProductsData();
            console.log('   ✅ Productos renderizados en la interfaz');
        } else {
            console.log('   ❌ Función loadProductsData no disponible');
        }
        
        // Test 4: Verificar dashboard
        console.log('\n📊 Test 4: Dashboard...');
        if (window.adminPanel && typeof window.adminPanel.updateDashboardDisplay === 'function') {
            window.adminPanel.updateDashboardDisplay();
            console.log('   ✅ Dashboard actualizado');
        } else {
            console.log('   ❌ Función updateDashboardDisplay no disponible');
        }
        
        console.log('\n✅ DIAGNÓSTICO COMPLETO FINALIZADO');
        
    } catch (error) {
        console.error('\n❌ Error en diagnóstico:', error);
    }
};

// Función para recargar datos
window.recargarDatos = async function() {
    console.log('\n🔄 RECARGANDO DATOS...');
    
    try {
        if (window.adminPanel) {
            // Limpiar cache
            if (typeof ProductosServiceOptimized !== 'undefined' && ProductosServiceOptimized.clearCache) {
                ProductosServiceOptimized.clearCache();
                console.log('   ✅ Cache limpiado');
            }
            
            // Marcar datos como no cargados
            window.adminPanel.dataLoaded = false;
            
            // Recargar datos
            await window.adminPanel.loadInitialData();
            
            // Actualizar vista
            if (window.adminPanel.currentSection === 'productos') {
                await window.adminPanel.loadProductsData();
            }
            
            console.log('   ✅ Datos recargados correctamente');
        } else {
            console.log('   ❌ Panel de administración no disponible');
        }
        
    } catch (error) {
        console.error('   ❌ Error recargando datos:', error);
    }
};

// Función para verificar estado actual
window.verificarEstado = function() {
    console.log('\n📋 ESTADO ACTUAL DEL PANEL:');
    console.log('============================');
    
    if (window.adminPanel) {
        console.log('Productos cargados:', window.adminPanel.productos.length);
        console.log('Datos cargados:', window.adminPanel.dataLoaded);
        console.log('Cargando datos:', window.adminPanel.loadingData);
        console.log('Sección actual:', window.adminPanel.currentSection);
        console.log('Categorías:', window.adminPanel.categorias.length);
        console.log('Marcas:', window.adminPanel.marcas.length);
        
        // Verificar algunos productos
        if (window.adminPanel.productos.length > 0) {
            console.log('\nPrimeros 3 productos:');
            window.adminPanel.productos.slice(0, 3).forEach((producto, index) => {
                console.log(`  ${index + 1}. ${producto.nombre} - ${producto.marca} - $${producto.precio}`);
            });
        }
    } else {
        console.log('❌ Panel de administración no disponible');
    }
};

// Ejecutar diagnóstico básico automáticamente
console.log('\n🔍 Ejecutando diagnóstico básico...');
setTimeout(() => {
    window.verificarEstado();
}, 2000);

console.log('\n📋 FUNCIONES DISPONIBLES:');
console.log('- diagnosticoCompleto(): Ejecuta diagnóstico completo');
console.log('- recargarDatos(): Recarga todos los datos');
console.log('- verificarEstado(): Muestra estado actual');
console.log('=====================================');
