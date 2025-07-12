// Test directo con curl - Tiempos de carga de productos
// Ejecutar con: node test-timing-curl.js

import { execSync } from 'child_process';

const SUPABASE_URL = 'https://xelobsbzytdxrrxgmlta.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbG9ic2J6eXRkeHJyeGdtbHRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzODUzNTksImV4cCI6MjA2NTk2MTM1OX0.bJL5DsL4pxlQ_FV3jX0ieiW3bYLA-Zf3M2HlNmdMMy4';

function medirConsultaCurl(nombre, url) {
    console.log(`⏱️ Midiendo: ${nombre}...`);
    
    const inicio = Date.now();
    
    try {
        const curlCommand = `curl -s -w "HTTPCODE:%{http_code};TIME:%{time_total}" -H "apikey: ${SUPABASE_ANON_KEY}" -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" "${url}"`;
        
        const resultado = execSync(curlCommand, { encoding: 'utf8' });
        const tiempo = Date.now() - inicio;
        
        // Extraer código HTTP y tiempo de curl
        const match = resultado.match(/HTTPCODE:(\d+);TIME:([\d.]+)$/);
        const httpCode = match ? parseInt(match[1]) : 0;
        const curlTime = match ? Math.round(parseFloat(match[2]) * 1000) : tiempo;
        
        // Extraer los datos (todo antes de HTTPCODE)
        const jsonData = resultado.replace(/HTTPCODE:.*$/, '');
        
        let productos = 0;
        try {
            const data = JSON.parse(jsonData);
            productos = Array.isArray(data) ? data.length : 0;
        } catch (e) {
            // Si no es JSON válido, asumimos 0 productos
        }
        
        let estado = '';
        if (httpCode === 200) {
            if (curlTime < 200) estado = '✅';
            else if (curlTime < 500) estado = '⚠️';
            else if (curlTime < 2000) estado = '❌';
            else estado = '🔴';
        } else {
            estado = '❌';
        }
        
        console.log(`${estado} ${nombre}: ${curlTime}ms (${productos} productos) [HTTP ${httpCode}]`);
        return { tiempo: curlTime, productos, exito: httpCode === 200, httpCode };
        
    } catch (error) {
        const tiempo = Date.now() - inicio;
        console.log(`❌ ${nombre}: ERROR - ${tiempo}ms - ${error.message}`);
        return { tiempo, productos: 0, exito: false, error };
    }
}

function ejecutarPruebas() {
    console.log('🚀 INICIANDO TEST DE TIEMPOS CON CURL');
    console.log('=====================================');
    
    const baseUrl = `${SUPABASE_URL}/rest/v1/productos`;
    
    const pruebas = [
        {
            nombre: 'Conteo total de productos',
            url: `${baseUrl}?select=count`
        },
        {
            nombre: 'Primeros 10 productos',
            url: `${baseUrl}?select=*&limit=10`
        },
        {
            nombre: 'Productos ordenados por ID',
            url: `${baseUrl}?select=id,nombre,precio&order=id.asc&limit=20`
        },
        {
            nombre: 'Productos con precio',
            url: `${baseUrl}?select=nombre,precio&order=precio.asc&limit=15`
        },
        {
            nombre: 'Solo nombres y marcas',
            url: `${baseUrl}?select=nombre,marca&limit=25`
        }
    ];
    
    const resultados = [];
    
    for (const prueba of pruebas) {
        const resultado = medirConsultaCurl(prueba.nombre, prueba.url);
        resultados.push(resultado);
        
        // Pausa entre consultas
        console.log('   Esperando...');
        execSync('timeout 1 > nul 2>&1 || sleep 1', { stdio: 'ignore' });
    }
    
    // Resumen
    console.log('\n📊 RESUMEN:');
    console.log('============');
    
    const tiemposExitosos = resultados.filter(r => r.exito).map(r => r.tiempo);
    const totalProductos = resultados.reduce((sum, r) => sum + r.productos, 0);
    const consultasExitosas = resultados.filter(r => r.exito).length;
    
    if (tiemposExitosos.length > 0) {
        const promedio = Math.round(tiemposExitosos.reduce((a, b) => a + b, 0) / tiemposExitosos.length);
        const minimo = Math.min(...tiemposExitosos);
        const maximo = Math.max(...tiemposExitosos);
        
        console.log(`• Consultas exitosas: ${consultasExitosas}/${resultados.length}`);
        console.log(`• Tiempo promedio: ${promedio}ms`);
        console.log(`• Tiempo mínimo: ${minimo}ms`);
        console.log(`• Tiempo máximo: ${maximo}ms`);
        console.log(`• Total productos encontrados: ${totalProductos}`);
        
        console.log('\n🎯 EVALUACIÓN DEL RENDIMIENTO:');
        if (promedio < 200) {
            console.log('✅ Excelente - Base de datos responde muy rápido');
        } else if (promedio < 500) {
            console.log('⚠️ Bueno - Tiempos aceptables para aplicación web');
        } else if (promedio < 2000) {
            console.log('❌ Lento - Considerar optimización de consultas');
        } else {
            console.log('🔴 Muy lento - Revisar configuración de red/BD');
        }
        
        console.log('\n💡 RECOMENDACIONES:');
        if (promedio > 500) {
            console.log('• Considerar añadir índices en las columnas más consultadas');
            console.log('• Revisar la configuración de red y ubicación del servidor');
            console.log('• Implementar caché para consultas frecuentes');
        }
        if (consultasExitosas < resultados.length) {
            console.log('• Revisar permisos y configuración de la base de datos');
            console.log('• Verificar que las tablas y columnas existan');
        }
        
    } else {
        console.log('❌ No se pudo completar ninguna consulta exitosamente');
        console.log('💡 Verificar:');
        console.log('  • Conexión a internet');
        console.log('  • URL y claves de Supabase');
        console.log('  • Existencia de la tabla "productos"');
    }
}

// Ejecutar pruebas
try {
    ejecutarPruebas();
} catch (error) {
    console.error('❌ Error ejecutando pruebas:', error.message);
    process.exit(1);
}
