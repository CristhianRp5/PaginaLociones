// Test de carga de productos por secciones - Terminal
// Ejecutar con: node test-secciones-simple.js

import fetch from 'node-fetch';

const SUPABASE_URL = 'https://xelobsbzytdxrrxgmlta.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbG9ic2J6eXRkeHJyeGdtbHRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzODUzNTksImV4cCI6MjA2NTk2MTM1OX0.bJL5DsL4pxlQ_FV3jX0ieiW3bYLA-Zf3M2HlNmdMMy4';

async function medirSeccion(nombre, url) {
    console.log(`⏱️ Midiendo: ${nombre}...`);
    
    const inicio = Date.now();
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        const tiempo = Date.now() - inicio;
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const productos = Array.isArray(data) ? data.length : 0;
        
        // Evaluar rendimiento
        let estado = '';
        if (tiempo < 300) estado = '✅ Excelente';
        else if (tiempo < 800) estado = '⚠️ Bueno';
        else estado = '❌ Lento';
        
        console.log(`${estado} - ${nombre}: ${tiempo}ms (${productos} productos)`);
        return { nombre, tiempo, productos, exito: true };
        
    } catch (error) {
        const tiempo = Date.now() - inicio;
        console.log(`❌ ${nombre}: ERROR - ${tiempo}ms - ${error.message}`);
        return { nombre, tiempo, productos: 0, exito: false, error };
    }
}

async function ejecutarPruebasSecciones() {
    console.log('🚀 TEST DE CARGA DE PRODUCTOS POR SECCIÓN');
    console.log('==========================================');
    
    const baseUrl = `${SUPABASE_URL}/rest/v1/productos`;
    
    const secciones = [
        {
            nombre: '👨 Para Ellos',
            url: `${baseUrl}?select=*&categoria=eq.Hombre&order=nombre.asc`
        },
        {
            nombre: '👩 Para Ellas',
            url: `${baseUrl}?select=*&categoria=eq.Mujer&order=nombre.asc`
        },
        {
            nombre: '⚙️ Admin Panel',
            url: `${baseUrl}?select=*&order=id.asc`
        }
    ];
    
    const resultados = [];
    
    // Ejecutar pruebas
    for (const seccion of secciones) {
        const resultado = await medirSeccion(seccion.nombre, seccion.url);
        resultados.push(resultado);
        
        // Pausa entre consultas
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Análisis de resultados
    console.log('\n📊 ANÁLISIS DE RESULTADOS:');
    console.log('===========================');
    
    const exitosos = resultados.filter(r => r.exito);
    
    if (exitosos.length > 0) {
        // Calcular estadísticas
        const tiempos = exitosos.map(r => r.tiempo);
        const promedio = Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length);
        const minimo = Math.min(...tiempos);
        const maximo = Math.max(...tiempos);
        const totalProductos = exitosos.reduce((sum, r) => sum + r.productos, 0);
        
        // Mostrar resumen por sección
        console.log('\n📋 RESUMEN POR SECCIÓN:');
        exitosos.forEach(resultado => {
            const estado = resultado.tiempo < 300 ? '✅' : resultado.tiempo < 800 ? '⚠️' : '❌';
            console.log(`${estado} ${resultado.nombre}: ${resultado.tiempo}ms (${resultado.productos} productos)`);
        });
        
        // Estadísticas generales
        console.log('\n📈 ESTADÍSTICAS GENERALES:');
        console.log(`• Secciones probadas: ${exitosos.length}/${resultados.length}`);
        console.log(`• Tiempo promedio: ${promedio}ms`);
        console.log(`• Tiempo mínimo: ${minimo}ms`);
        console.log(`• Tiempo máximo: ${maximo}ms`);
        console.log(`• Total productos: ${totalProductos}`);
        
        // Evaluación general
        console.log('\n🎯 EVALUACIÓN GENERAL:');
        if (promedio < 300) {
            console.log('✅ EXCELENTE - Todas las secciones cargan muy rápido');
            console.log('💡 El rendimiento actual es óptimo para la experiencia del usuario');
        } else if (promedio < 800) {
            console.log('⚠️ BUENO - Rendimiento aceptable para aplicación web');
            console.log('💡 Se puede mejorar con optimizaciones menores');
        } else {
            console.log('❌ LENTO - Requiere optimización urgente');
            console.log('💡 Los usuarios pueden experimentar demoras perceptibles');
        }
        
        // Recomendaciones específicas por sección
        console.log('\n💡 RECOMENDACIONES POR SECCIÓN:');
        
        const seccionMasLenta = exitosos.reduce((prev, curr) => 
            curr.tiempo > prev.tiempo ? curr : prev
        );
        
        const seccionMasRapida = exitosos.reduce((prev, curr) => 
            curr.tiempo < prev.tiempo ? curr : prev
        );
        
        console.log(`🔴 Sección más lenta: ${seccionMasLenta.nombre} (${seccionMasLenta.tiempo}ms)`);
        console.log(`🟢 Sección más rápida: ${seccionMasRapida.nombre} (${seccionMasRapida.tiempo}ms)`);
        
        // Recomendaciones específicas
        if (seccionMasLenta.tiempo > 800) {
            if (seccionMasLenta.nombre.includes('Admin')) {
                console.log('   → Admin Panel: Implementar paginación, cargar solo campos necesarios');
            } else if (seccionMasLenta.nombre.includes('Ellos')) {
                console.log('   → Para Ellos: Añadir índice en categoria="Hombre", limitar resultados iniciales');
            } else if (seccionMasLenta.nombre.includes('Ellas')) {
                console.log('   → Para Ellas: Añadir índice en categoria="Mujer", limitar resultados iniciales');
            }
        }
        
    } else {
        console.log('❌ No se pudo completar ninguna consulta exitosamente');
        console.log('\n🔧 VERIFICAR:');
        console.log('• Conexión a internet');
        console.log('• Configuración de Supabase');
        console.log('• Existencia de la tabla "productos"');
        console.log('• Permisos de lectura en la base de datos');
    }
    
    console.log('\n' + '='.repeat(50));
}

// Ejecutar pruebas
try {
    await ejecutarPruebasSecciones();
} catch (error) {
    console.error('❌ Error ejecutando pruebas:', error.message);
    process.exit(1);
}
