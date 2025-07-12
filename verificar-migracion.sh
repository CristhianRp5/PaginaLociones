#!/bin/bash

echo "🔍 Verificando estado de la migración..."

# Verificar archivos optimizados
echo "📁 Archivos optimizados:"
ls -la js/supabase-config-optimized.js 2>/dev/null && echo "✅ Configuración optimizada" || echo "❌ Configuración optimizada falta"
ls -la js/migracion-imagenes.js 2>/dev/null && echo "✅ Script de migración" || echo "❌ Script de migración falta"
ls -la test-migracion-urls.html 2>/dev/null && echo "✅ Página de test" || echo "❌ Página de test falta"

echo ""
echo "🔗 Verificando referencias en HTML:"
grep -l "supabase-config-optimized.js" html/*.html | while read file; do
    echo "✅ $file - Usando configuración optimizada"
done

echo ""
echo "📝 Para ejecutar tests:"
echo "  1. Abrir test-migracion-urls.html en el navegador"
echo "  2. Ejecutar verificarImagenes() en la consola"
echo "  3. Ejecutar migrarImagenes() si es necesario"
echo "  4. Ejecutar los tests de rendimiento"

echo ""
echo "🎯 Estado del sistema:"
if [ -f "js/supabase-config-optimized.js" ] && [ -f "js/migracion-imagenes.js" ]; then
    echo "✅ Sistema listo para migración"
else
    echo "❌ Sistema no está listo"
fi
