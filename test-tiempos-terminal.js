// Test de tiempos de carga de productos - Script de Terminal
// Ejecutar con: node test-tiempos-terminal.cjs

const https = require('https');
const { performance } = require('perf_hooks');

// Configuración de Supabase
const SUPABASE_URL = 'https://xelobsbzytdxrrxgmlta.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbG9ic2J6eXRkeHJyeGdtbHRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzODUzNTksImV4cCI6MjA2NTk2MTM1OX0.bJL5DsL4pxlQ_FV3jX0ieiW3bYLA-Zf3M2HlNmdMMy4';

// Función para hacer request HTTP
function makeRequest(url, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = https.request(url, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    resolve(parsedData);
                } catch (error) {
                    reject(new Error(`Error parsing JSON: ${error.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.setTimeout(10000, () => {
            req.abort();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

// Test para Admin Panel (todos los productos)
async function testAdminPanel() {
    console.log('🔍 Testeando Admin Panel...');
    
    try {
        const startTime = performance.now();
        
        const url = `${SUPABASE_URL}/rest/v1/productos?select=*`;
        const productos = await makeRequest(url);
        
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        console.log(`✅ Admin Panel: ${productos.length} productos en ${duration}ms`);
        return { success: true, time: duration, products: productos.length };
        
    } catch (error) {
        console.log(`❌ Error Admin Panel: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Test para Para Ellos
async function testParaEllos() {
    console.log('🔍 Testeando Para Ellos...');
    
    try {
        const startTime = performance.now();
        
        // Primero obtener el ID de la categoría "Para Ellos"
        const categoriasUrl = `${SUPABASE_URL}/rest/v1/categorias?select=*&slug=eq.para-ellos`;
        const categorias = await makeRequest(categoriasUrl);
        
        if (categorias.length === 0) {
            throw new Error('Categoría "Para Ellos" no encontrada');
        }
        
        const categoriaId = categorias[0].id;
        
        // Obtener productos de esa categoría
        const url = `${SUPABASE_URL}/rest/v1/productos?select=*&categoria_id=eq.${categoriaId}`;
        const productos = await makeRequest(url);
        
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        console.log(`✅ Para Ellos: ${productos.length} productos en ${duration}ms`);
        return { success: true, time: duration, products: productos.length };
        
    } catch (error) {
        console.log(`❌ Error Para Ellos: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Test para Para Ellas
async function testParaEllas() {
    console.log('🔍 Testeando Para Ellas...');
    
    try {
        const startTime = performance.now();
        
        // Primero obtener el ID de la categoría "Para Ellas"
        const categoriasUrl = `${SUPABASE_URL}/rest/v1/categorias?select=*&slug=eq.para-ellas`;
        const categorias = await makeRequest(categoriasUrl);
        
        if (categorias.length === 0) {
            throw new Error('Categoría "Para Ellas" no encontrada');
        }
        
        const categoriaId = categorias[0].id;
        
        // Obtener productos de esa categoría
        const url = `${SUPABASE_URL}/rest/v1/productos?select=*&categoria_id=eq.${categoriaId}`;
        const productos = await makeRequest(url);
        
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        console.log(`✅ Para Ellas: ${productos.length} productos en ${duration}ms`);
        return { success: true, time: duration, products: productos.length };
        
    } catch (error) {
        console.log(`❌ Error Para Ellas: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Test completo
async function runCompleteTest() {
    console.log('🚀 Iniciando test completo de tiempos...\n');
    
    const results = {};
    
    // Test Admin Panel
    results.admin = await testAdminPanel();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test Para Ellos
    results.ellos = await testParaEllos();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test Para Ellas
    results.ellas = await testParaEllas();
    
    console.log('\n📊 RESUMEN DE RESULTADOS:');
    console.log('========================');
    
    const sections = [
        { name: 'Admin Panel', key: 'admin' },
        { name: 'Para Ellos', key: 'ellos' },
        { name: 'Para Ellas', key: 'ellas' }
    ];
    
    sections.forEach(section => {
        const result = results[section.key];
        if (result.success) {
            const speed = result.time < 500 ? '🟢 Excelente' : 
                         result.time < 1000 ? '🟡 Bueno' : 
                         result.time < 2000 ? '🟠 Aceptable' : '🔴 Lento';
            console.log(`${section.name}: ${result.time}ms | ${result.products} productos | ${speed}`);
        } else {
            console.log(`${section.name}: ❌ Error - ${result.error}`);
        }
    });
    
    console.log('\n💡 RECOMENDACIONES:');
    console.log('==================');
    
    if (results.admin.success && results.admin.time > 2000) {
        console.log('⚠️ Admin Panel es lento - Considerar paginación');
    }
    
    if (results.ellos.success && results.ellos.products === 0) {
        console.log('⚠️ Para Ellos no tiene productos - Verificar datos');
    }
    
    if (results.ellas.success && results.ellas.products === 0) {
        console.log('⚠️ Para Ellas no tiene productos - Verificar datos');
    }
    
    const successfulTests = Object.values(results).filter(r => r.success);
    if (successfulTests.length > 0) {
        const avgTime = successfulTests.reduce((sum, r) => sum + r.time, 0) / successfulTests.length;
        console.log(`📈 Tiempo promedio: ${Math.round(avgTime)}ms`);
    }
    
    console.log('\n✅ Test completado');
}

// Test de múltiples iteraciones
async function runMultipleIterations(iterations = 5) {
    console.log(`🔄 Iniciando test con ${iterations} iteraciones...\n`);
    
    const allResults = {
        admin: { times: [], products: 0 },
        ellos: { times: [], products: 0 },
        ellas: { times: [], products: 0 }
    };
    
    for (let i = 0; i < iterations; i++) {
        console.log(`\n--- Iteración ${i + 1} de ${iterations} ---`);
        
        const adminResult = await testAdminPanel();
        if (adminResult.success) {
            allResults.admin.times.push(adminResult.time);
            allResults.admin.products = adminResult.products;
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const ellosResult = await testParaEllos();
        if (ellosResult.success) {
            allResults.ellos.times.push(ellosResult.time);
            allResults.ellos.products = ellosResult.products;
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const ellasResult = await testParaEllas();
        if (ellasResult.success) {
            allResults.ellas.times.push(ellasResult.time);
            allResults.ellas.products = ellasResult.products;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n📈 ESTADÍSTICAS FINALES:');
    console.log('=======================');
    
    Object.entries(allResults).forEach(([key, data]) => {
        const sectionName = key === 'admin' ? 'Admin Panel' : 
                           key === 'ellos' ? 'Para Ellos' : 'Para Ellas';
        
        if (data.times.length > 0) {
            const avg = Math.round(data.times.reduce((sum, time) => sum + time, 0) / data.times.length);
            const min = Math.min(...data.times);
            const max = Math.max(...data.times);
            
            console.log(`${sectionName}:`);
            console.log(`  Promedio: ${avg}ms`);
            console.log(`  Mínimo: ${min}ms`);
            console.log(`  Máximo: ${max}ms`);
            console.log(`  Productos: ${data.products}`);
            console.log(`  Iteraciones exitosas: ${data.times.length}/${iterations}`);
        } else {
            console.log(`${sectionName}: Sin datos exitosos`);
        }
    });
}

// Ejecutar según argumentos
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--multiple') || args.includes('-m')) {
        const iterations = parseInt(args.find(arg => arg.startsWith('--iterations='))?.split('=')[1]) || 5;
        await runMultipleIterations(iterations);
    } else {
        await runCompleteTest();
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Error fatal:', error.message);
        process.exit(1);
    });
}

module.exports = {
    testAdminPanel,
    testParaEllos,
    testParaEllas,
    runCompleteTest,
    runMultipleIterations
};
