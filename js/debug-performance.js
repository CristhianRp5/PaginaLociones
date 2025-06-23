// Script de diagnóstico de performance para PaginaLociones
// Ejecutar en la consola del navegador para diagnosticar problemas de carga

console.log('🔬 Iniciando diagnóstico completo de performance...');

async function diagnosticarCompleto() {
    const startTime = performance.now();
    
    console.log('1. Verificando dependencias...');
    const dependencias = {
        'Supabase JS': typeof window.supabase !== 'undefined',
        'initSupabase': typeof initSupabase !== 'undefined',
        'ProductosService': typeof ProductosService !== 'undefined',
        'supabaseClient': typeof supabaseClient !== 'undefined',
        'ParaEllosManager': typeof ParaEllosManager !== 'undefined'
    };
    
    console.table(dependencias);
    
    console.log('2. Información de red...');
    if (navigator.connection) {
        console.log('Tipo de conexión:', navigator.connection.effectiveType);
        console.log('Velocidad estimada:', navigator.connection.downlink + ' Mbps');
        console.log('RTT:', navigator.connection.rtt + ' ms');
    }
    
    console.log('3. Probando conexión a Supabase...');
    if (typeof ProductosService !== 'undefined' && ProductosService.diagnosticarPerformance) {
        try {
            const diagnostico = await ProductosService.diagnosticarPerformance();
            console.log('📊 Resultados del diagnóstico:', diagnostico);
        } catch (error) {
            console.error('❌ Error en diagnóstico:', error);
        }
    } else {
        console.warn('⚠️ Función de diagnóstico no disponible');
    }
    
    console.log('4. Métricas del navegador...');
    if (performance.memory) {
        console.log('Memoria utilizada:', Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), 'MB');
        console.log('Memoria total:', Math.round(performance.memory.totalJSHeapSize / 1024 / 1024), 'MB');
        console.log('Límite de memoria:', Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024), 'MB');
    }
    
    const endTime = performance.now();
    console.log(`✅ Diagnóstico completado en ${(endTime - startTime).toFixed(2)}ms`);
    
    // Recomendaciones básicas
    console.log('\n💡 Recomendaciones:');
    console.log('- Si la carga es lenta, verificar conexión a internet');
    console.log('- Si hay errores de Supabase, verificar configuración de API');
    console.log('- Si el procesamiento es lento, considerar reducir el número de productos');
    console.log('- Abrir Network tab en DevTools para ver requests HTTP');
    
    return {
        dependencias,
        duracion: endTime - startTime,
        timestamp: new Date().toISOString()
    };
}

// Ejecutar diagnóstico automáticamente
diagnosticarCompleto().then(resultado => {
    console.log('🎯 Diagnóstico final:', resultado);
});

// Funciones auxiliares para debugging
window.debugPerfumeria = {
    diagnosticar: diagnosticarCompleto,
    limpiarCache: () => {
        if (typeof ProductosService !== 'undefined') {
            ProductosService.clearCache();
            console.log('🧹 Cache limpiado');
        }
    },
    recargarProductos: async () => {
        console.log('🔄 Recargando productos...');
        if (window.paraEllosManager) {
            await window.paraEllosManager.loadProducts();
            window.paraEllosManager.renderProducts();
            console.log('✅ Productos recargados');
        }
    },
    mostrarEstadisticas: () => {
        if (window.paraEllosManager) {
            const manager = window.paraEllosManager;
            console.log('📈 Estadísticas actuales:', {
                totalProductos: manager.productos.length,
                productosFiltrados: manager.filteredProducts.length,
                paginaActual: manager.currentPage,
                productosPorPagina: manager.productsPerPage,
                filtrosActivos: manager.activeFilters
            });
        }
    }
};

console.log('🛠️ Funciones de debugging disponibles en window.debugPerfumeria');
