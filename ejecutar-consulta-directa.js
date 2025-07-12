#!/usr/bin/env node

/**
 * Script para ejecutar consulta directa a la tabla productos
 * Analiza la estructura real de la base de datos
 */

import fs from 'fs';
import path from 'path';

// Simular el entorno de navegador para usar supabase
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase (usa las mismas credenciales que tu proyecto)
const supabaseUrl = 'https://uojdxqmfmtpfrbmlcsya.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvamR4cW1mbXRwZnJibWxjc3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MzYzMjksImV4cCI6MjA0NjQxMjMyOX0.TcDpb_kTOKfRJNJC9XPNLgL8GQCLzMT8lCOKvnGzOKA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function consultarTablaProductos() {
    console.log('🔍 CONSULTA DIRECTA A TABLA PRODUCTOS');        console.log('=' + '='.repeat(50));
    
    try {
        // 1. Consultar todos los productos
        console.log('\n📊 Consultando todos los productos...');
        const { data: productos, error } = await supabase
            .from('productos')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) {
            throw error;
        }
        
        console.log(`✅ ${productos.length} productos encontrados`);
        
        // 2. Analizar estructura
        console.log('\n🔍 ESTRUCTURA DE LA TABLA:');
        if (productos.length > 0) {
            const primeProducto = productos[0];
            const campos = Object.keys(primeProducto);
            
            console.log(`Total campos: ${campos.length}`);
            console.log('Campos encontrados:');
            
            campos.forEach((campo, index) => {
                const valor = primeProducto[campo];
                const tipo = typeof valor;
                console.log(`  ${index + 1}. ${campo} (${tipo})`);
            });
        }
        
        // 3. Análisis de imágenes
        console.log('\n🖼️ ANÁLISIS DE IMÁGENES:');
        
        let conImagen = 0;
        let conImagenUrl = 0;
        let conAmbas = 0;
        let sinImagen = 0;
        
        const tiposImagen = {};
        const tiposImagenUrl = {};
        
        productos.forEach(producto => {
            const tieneImagen = producto.imagen && producto.imagen.trim() !== '';
            const tieneImagenUrl = producto.imagen_url && producto.imagen_url.trim() !== '';
            
            if (tieneImagen) {
                conImagen++;
                
                // Analizar tipo de imagen
                if (producto.imagen.startsWith('data:')) {
                    tiposImagen.base64 = (tiposImagen.base64 || 0) + 1;
                } else if (producto.imagen.startsWith('http')) {
                    tiposImagen.url = (tiposImagen.url || 0) + 1;
                } else {
                    tiposImagen.path = (tiposImagen.path || 0) + 1;
                }
            }
            
            if (tieneImagenUrl) {
                conImagenUrl++;
                
                // Analizar tipo de imagen_url
                if (producto.imagen_url.startsWith('data:')) {
                    tiposImagenUrl.base64 = (tiposImagenUrl.base64 || 0) + 1;
                } else if (producto.imagen_url.startsWith('http')) {
                    tiposImagenUrl.url = (tiposImagenUrl.url || 0) + 1;
                } else {
                    tiposImagenUrl.path = (tiposImagenUrl.path || 0) + 1;
                }
            }
            
            if (tieneImagen && tieneImagenUrl) {
                conAmbas++;
            }
            
            if (!tieneImagen && !tieneImagenUrl) {
                sinImagen++;
            }
        });
        
        console.log(`Con campo 'imagen': ${conImagen} productos`);
        console.log(`Con campo 'imagen_url': ${conImagenUrl} productos`);
        console.log(`Con ambos campos: ${conAmbas} productos`);
        console.log(`Sin imagen: ${sinImagen} productos`);
        
        console.log('\nTipos en campo "imagen":');
        Object.entries(tiposImagen).forEach(([tipo, cantidad]) => {
            console.log(`  ${tipo}: ${cantidad}`);
        });
        
        console.log('\nTipos en campo "imagen_url":');
        Object.entries(tiposImagenUrl).forEach(([tipo, cantidad]) => {
            console.log(`  ${tipo}: ${cantidad}`);
        });
        
        // 4. Muestra de productos
        console.log('\n📋 MUESTRA DE PRODUCTOS (primeros 3):');
        productos.slice(0, 3).forEach((producto, index) => {
            console.log(`\n--- Producto ${index + 1} ---`);
            console.log(`ID: ${producto.id}`);
            console.log(`Nombre: ${producto.nombre}`);
            console.log(`Precio: ${producto.precio}`);
            console.log(`Imagen: ${producto.imagen ? (producto.imagen.substring(0, 50) + '...') : 'NULL'}`);
            console.log(`Imagen URL: ${producto.imagen_url ? (producto.imagen_url.substring(0, 50) + '...') : 'NULL'}`);
            console.log(`Activo: ${producto.activo}`);
        });
        
        // 5. Exportar datos detallados
        const exportData = {
            timestamp: new Date().toISOString(),
            totalProductos: productos.length,
            estructura: productos.length > 0 ? Object.keys(productos[0]).map(campo => {
                const allValues = productos.map(p => p[campo]);
                const nonNullValues = allValues.filter(v => v !== null);
                const nonEmptyValues = nonNullValues.filter(v => v !== '');
                
                return {
                    campo,
                    tipo: typeof productos[0][campo],
                    nullable: allValues.some(v => v === null),
                    empty: nonNullValues.some(v => v === ''),
                    totalCount: productos.length,
                    nullCount: allValues.filter(v => v === null).length,
                    emptyCount: nonNullValues.filter(v => v === '').length,
                    validCount: nonEmptyValues.length,
                    ejemplos: [...new Set(nonEmptyValues.slice(0, 3))],
                    valoresUnicos: [...new Set(allValues)].length
                };
            }) : [],
            estadisticasImagenes: {
                conImagen,
                conImagenUrl,
                conAmbas,
                sinImagen,
                tiposImagen,
                tiposImagenUrl
            },
            muestraProductos: productos.slice(0, 5)
        };
        
        // Guardar reporte
        const reportePath = path.join(process.cwd(), 'reporte-consulta-directa.json');
        fs.writeFileSync(reportePath, JSON.stringify(exportData, null, 2));
        
        console.log(`\n📊 REPORTE EXPORTADO: ${reportePath}`);
        
        // 6. Generar recomendaciones
        console.log('\n💡 RECOMENDACIONES PARA EL PANEL ADMIN:');
        
        if (conImagenUrl > conImagen) {
            console.log('✅ Mayoría de productos usa "imagen_url" - Panel admin debe priorizar este campo');
        } else {
            console.log('⚠️ Mayoría de productos usa "imagen" - Panel admin debe migrar a "imagen_url"');
        }
        
        if (tiposImagenUrl.url > 0) {
            console.log('✅ Hay productos con URLs válidas en "imagen_url"');
        }
        
        if (tiposImagen.base64 > 0) {
            console.log('⚠️ Hay productos con base64 en "imagen" - Recomendar migrar a URLs');
        }
        
        console.log('\n🎯 CONCLUSIÓN:');
        console.log('El panel admin debe:');
        console.log('1. Leer principalmente el campo "imagen_url"');
        console.log('2. Usar "imagen" como fallback si "imagen_url" está vacío');
        console.log('3. Guardar nuevas imágenes en "imagen_url"');
        console.log('4. Validar que las URLs sean accesibles');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Ejecutar consulta
consultarTablaProductos();
