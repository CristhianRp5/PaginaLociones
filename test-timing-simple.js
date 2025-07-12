// Test rápido de tiempos de carga de productos
// Ejecutar con: node test-timing-simple.js

import fetch from 'node-fetch';

const SUPABASE_URL = 'https://xelobsbzytdxrrxgmlta.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbG9ic2J6eXRkeHJyeGdtbHRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzODUzNTksImV4cCI6MjA2NTk2MTM1OX0.bJL5DsL4pxlQ_FV3jX0ieiW3bYLA-Zf3M2HlNmdMMy4';

async function medirConsulta(nombre, url) {
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
        const productos = Array.isArray(data) ? data.length : (data.length || 0);
        
        let estado = '';
        if (tiempo < 200) estado = '✅';
        else if (tiempo < 500) estado = '⚠️';
        else if (tiempo < 2000) estado = '❌';
        else estado = '🔴';
        
        console.log(`${estado} ${nombre}: ${tiempo}ms (${productos} productos)`);
        return { tiempo, productos, exito: true };
        
    } catch (error) {
        const tiempo = Date.now() - inicio;
        console.log(`❌ ${nombre}: ERROR - ${tiempo}ms - ${error.message}`);
        return { tiempo, productos: 0, exito: false, error };
    }
}

async function ejecutarPruebas() {
    console.log('🚀 INICIANDO TEST DE TIEMPOS DE PRODUCTOS');
    console.log('==========================================');
    
    const baseUrl = `${SUPABASE_URL}/rest/v1/productos`;
    
    const pruebas = [
        {
            nombre: 'Todos los productos',
            url: `${baseUrl}?select=*&order=id.asc`
        },
        {
            nombre: 'Productos para Hombres',
            url: `${baseUrl}?select=*&categoria=eq.Hombre&order=nombre.asc`
        },
        {
            nombre: 'Productos para Mujeres', 
            url: `${baseUrl}?select=*&categoria=eq.Mujer&order=nombre.asc`
        },
        {
            nombre: 'Productos Hugo Boss',
            url: `${baseUrl}?select=*&marca=eq.Hugo Boss&order=precio.desc`
        },
        {
            nombre: 'Productos hasta $50',
            url: `${baseUrl}?select=*&precio=lt.50&order=precio.asc`
        }
    ];
    
    const resultados = [];
    
    for (const prueba of pruebas) {
        const resultado = await medirConsulta(prueba.nombre, prueba.url);
        resultados.push(resultado);
        
        // Pausa entre consultas
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Resumen
    console.log('\n📊 RESUMEN:');
    console.log('============');
    
    const tiemposExitosos = resultados.filter(r => r.exito).map(r => r.tiempo);
    const totalProductos = resultados.reduce((sum, r) => sum + r.productos, 0);
    
    if (tiemposExitosos.length > 0) {
        const promedio = Math.round(tiemposExitosos.reduce((a, b) => a + b, 0) / tiemposExitosos.length);
        const minimo = Math.min(...tiemposExitosos);
        const maximo = Math.max(...tiemposExitosos);
        
        console.log(`• Consultas exitosas: ${tiemposExitosos.length}/${resultados.length}`);
        console.log(`• Tiempo promedio: ${promedio}ms`);
        console.log(`• Tiempo mínimo: ${minimo}ms`);
        console.log(`• Tiempo máximo: ${maximo}ms`);
        console.log(`• Total productos: ${totalProductos}`);
        
        console.log('\n🎯 EVALUACIÓN:');
        if (promedio < 200) {
            console.log('✅ Excelente rendimiento');
        } else if (promedio < 500) {
            console.log('⚠️ Buen rendimiento');
        } else if (promedio < 2000) {
            console.log('❌ Rendimiento lento');
        } else {
            console.log('🔴 Rendimiento muy lento');
        }
    } else {
        console.log('❌ No se pudo completar ninguna consulta exitosamente');
    }
}

// Verificar dependencias
if (typeof fetch === 'undefined') {
    console.log('❌ Error: node-fetch no está disponible');
    console.log('💡 Instala con: npm install node-fetch');
    process.exit(1);
}

// Ejecutar pruebas
ejecutarPruebas().catch(error => {
    console.error('❌ Error ejecutando pruebas:', error);
    process.exit(1);
});
