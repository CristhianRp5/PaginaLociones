#!/bin/bash

# Script para diagnosticar y solucionar el problema de imágenes en el panel admin

echo "🔍 Diagnosticando problema de imágenes en el panel admin..."
echo "============================================================"

# 1. Verificar estructura de archivos
echo "📂 Verificando estructura de archivos..."
echo ""

if [ -d "IMAGENES" ]; then
    echo "✅ Carpeta IMAGENES existe"
    echo "📁 Contenido de IMAGENES:"
    ls -la IMAGENES/
else
    echo "❌ Carpeta IMAGENES no encontrada"
    echo "📁 Creando carpeta IMAGENES..."
    mkdir -p IMAGENES
fi

echo ""

# 2. Verificar archivo placeholder
echo "🖼️ Verificando archivo placeholder..."
if [ -f "IMAGENES/placeholder-simple.svg" ]; then
    echo "✅ Archivo placeholder-simple.svg existe"
    file_size=$(stat -c%s "IMAGENES/placeholder-simple.svg" 2>/dev/null || stat -f%z "IMAGENES/placeholder-simple.svg" 2>/dev/null)
    echo "📏 Tamaño del archivo: $file_size bytes"
    
    if [ "$file_size" -gt 0 ]; then
        echo "✅ Archivo placeholder no está vacío"
    else
        echo "❌ Archivo placeholder está vacío"
    fi
else
    echo "❌ Archivo placeholder-simple.svg no encontrado"
fi

echo ""

# 3. Verificar archivos del panel admin
echo "🔧 Verificando archivos del panel admin..."
files_to_check=("html/admin-panel.html" "js/admin-panel-new.js" "css/admin-panel.css")

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file existe"
    else
        echo "❌ $file no encontrado"
    fi
done

echo ""

# 4. Verificar configuración de rutas
echo "🔍 Verificando configuración de rutas en admin-panel-new.js..."
if grep -q "getPlaceholderImagePath" js/admin-panel-new.js; then
    echo "✅ Función getPlaceholderImagePath encontrada"
    echo "📋 Configuración actual:"
    grep -A 10 "getPlaceholderImagePath()" js/admin-panel-new.js | head -10
else
    echo "❌ Función getPlaceholderImagePath no encontrada"
fi

echo ""

# 5. Crear archivo de prueba para verificar rutas
echo "🧪 Creando archivo de prueba para verificar rutas..."
cat > test-rutas-imagenes.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Rutas - Imágenes Panel Admin</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .test-item { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .test-item img { max-width: 200px; max-height: 200px; border: 1px solid #ddd; margin: 10px 0; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
    </style>
</head>
<body>
    <h1>🔍 Test de Rutas - Imágenes Panel Admin</h1>
    
    <div class="test-item">
        <h3>Test 1: Ruta desde html/ (como el panel admin)</h3>
        <p>Ruta: ../IMAGENES/placeholder-simple.svg</p>
        <img src="../IMAGENES/placeholder-simple.svg" alt="Placeholder desde html/" 
             onload="this.nextSibling.className='success'; this.nextSibling.innerHTML='✅ Imagen cargada correctamente'"
             onerror="this.nextSibling.className='error'; this.nextSibling.innerHTML='❌ Error cargando imagen'">
        <div class="warning">⏳ Cargando...</div>
    </div>
    
    <div class="test-item">
        <h3>Test 2: Ruta absoluta</h3>
        <p>Ruta: /IMAGENES/placeholder-simple.svg</p>
        <img src="/IMAGENES/placeholder-simple.svg" alt="Placeholder absoluto" 
             onload="this.nextSibling.className='success'; this.nextSibling.innerHTML='✅ Imagen cargada correctamente'"
             onerror="this.nextSibling.className='error'; this.nextSibling.innerHTML='❌ Error cargando imagen'">
        <div class="warning">⏳ Cargando...</div>
    </div>
    
    <div class="test-item">
        <h3>Test 3: Placeholder dinámico (Canvas)</h3>
        <p>Generado con JavaScript</p>
        <img id="dynamicPlaceholder" alt="Placeholder dinámico" 
             onload="this.nextSibling.className='success'; this.nextSibling.innerHTML='✅ Imagen cargada correctamente'"
             onerror="this.nextSibling.className='error'; this.nextSibling.innerHTML='❌ Error cargando imagen'">
        <div class="warning">⏳ Cargando...</div>
    </div>
    
    <div class="test-item">
        <h3>Test 4: Imagen externa</h3>
        <p>URL: https://picsum.photos/200/300</p>
        <img src="https://picsum.photos/200/300" alt="Imagen externa" 
             onload="this.nextSibling.className='success'; this.nextSibling.innerHTML='✅ Imagen cargada correctamente'"
             onerror="this.nextSibling.className='error'; this.nextSibling.innerHTML='❌ Error cargando imagen'">
        <div class="warning">⏳ Cargando...</div>
    </div>
    
    <script>
        // Generar placeholder dinámico
        function generatePlaceholder() {
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 200;
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(0, 0, 200, 200);
            
            ctx.strokeStyle = '#dee2e6';
            ctx.lineWidth = 2;
            ctx.strokeRect(1, 1, 198, 198);
            
            ctx.fillStyle = '#6c757d';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Sin imagen', 100, 100);
            
            ctx.font = '32px Arial';
            ctx.fillText('🖼️', 100, 80);
            
            return canvas.toDataURL();
        }
        
        // Configurar placeholder dinámico
        document.getElementById('dynamicPlaceholder').src = generatePlaceholder();
        
        // Log de resultados
        window.addEventListener('load', function() {
            setTimeout(function() {
                console.log('🔍 Resultados del test de rutas:');
                document.querySelectorAll('.test-item img').forEach((img, index) => {
                    const status = img.nextSibling.className;
                    const message = img.nextSibling.innerHTML;
                    console.log(`Test ${index + 1}: ${status} - ${message}`);
                });
            }, 2000);
        });
    </script>
</body>
</html>
EOF

# 6. Mover el archivo a la carpeta html para probar las rutas correctas
cp test-rutas-imagenes.html html/
echo "✅ Archivo de prueba creado en html/test-rutas-imagenes.html"

echo ""

# 7. Verificar productos en la base de datos
echo "🗄️ Verificando productos en la base de datos..."
echo "📋 Para verificar productos, abre: debug-imagenes-panel.html"

echo ""

# 8. Sugerencias de solución
echo "💡 SUGERENCIAS DE SOLUCIÓN:"
echo "=========================="
echo ""
echo "1. 🔧 Problema de rutas:"
echo "   - El panel admin está en html/ así que necesita ../IMAGENES/"
echo "   - Verificar que el archivo placeholder-simple.svg no esté vacío"
echo ""
echo "2. 🖼️ Problema de imágenes:"
echo "   - Verificar que los productos tengan URLs válidas en BD"
echo "   - Asegurarse de que el placeholder funcione como fallback"
echo ""
echo "3. 🧪 Para probar:"
echo "   - Abre html/test-rutas-imagenes.html"
echo "   - Abre debug-imagenes-panel.html"
echo "   - Verifica la consola del navegador en el panel admin"
echo ""
echo "4. 🔍 Archivos importantes:"
echo "   - js/admin-panel-new.js (línea ~493: getPlaceholderImagePath)"
echo "   - js/admin-panel-new.js (línea ~570: getImagePath)"
echo "   - IMAGENES/placeholder-simple.svg"
echo ""

# 9. Verificar que el placeholder esté bien creado
echo "🔧 Verificando contenido del placeholder..."
if [ -f "IMAGENES/placeholder-simple.svg" ]; then
    echo "📄 Primeras líneas del placeholder:"
    head -5 IMAGENES/placeholder-simple.svg
else
    echo "❌ Placeholder no encontrado"
fi

echo ""
echo "✅ Diagnóstico completado"
echo "🌐 Próximos pasos:"
echo "   1. Abre html/test-rutas-imagenes.html para probar las rutas"
echo "   2. Abre debug-imagenes-panel.html para diagnosticar la BD"
echo "   3. Verifica el panel admin en html/admin-panel.html"
echo "   4. Revisa la consola del navegador para errores"
