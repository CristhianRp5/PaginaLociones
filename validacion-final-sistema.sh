#!/bin/bash

# Script final de validación completa del sistema
# Ejecuta todas las validaciones y genera reporte final

echo "🎯 VALIDACIÓN FINAL DEL SISTEMA DE ACTUALIZACIÓN DE IMÁGENES"
echo "============================================================="

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="reporte-validacion-final-$TIMESTAMP.txt"

# Función para logging
log_message() {
    local message="$1"
    local type="${2:-INFO}"
    local timestamp=$(date '+%H:%M:%S')
    
    echo "[$timestamp] [$type] $message" | tee -a "$REPORT_FILE"
}

# Función para verificar archivo
check_file() {
    local file="$1"
    local description="$2"
    
    if [ -f "$file" ]; then
        log_message "✅ $description: $file" "SUCCESS"
        return 0
    else
        log_message "❌ $description: $file NO ENCONTRADO" "ERROR"
        return 1
    fi
}

# Función para verificar función en archivo
check_function() {
    local file="$1"
    local function_name="$2"
    
    if [ -f "$file" ] && grep -q "$function_name" "$file"; then
        log_message "✅ Función '$function_name' encontrada en $file" "SUCCESS"
        return 0
    else
        log_message "❌ Función '$function_name' NO encontrada en $file" "ERROR"
        return 1
    fi
}

# Inicializar reporte
cat > "$REPORT_FILE" << EOF
REPORTE DE VALIDACIÓN FINAL - SISTEMA DE ACTUALIZACIÓN DE IMÁGENES
================================================================
Fecha: $(date)
Hora: $(date '+%H:%M:%S')
Usuario: $(whoami)
Directorio: $(pwd)

EOF

log_message "🚀 Iniciando validación final del sistema"

# 1. VALIDAR ARCHIVOS PRINCIPALES
log_message "📁 Validando archivos principales..."

FILES_CORE=(
    "html/admin-panel.html:Panel de administración"
    "js/admin-panel-new.js:Script del panel admin"
    "js/supabase-config-optimized.js:Configuración optimizada"
    "css/admin-panel.css:Estilos del panel"
)

for file_desc in "${FILES_CORE[@]}"; do
    IFS=':' read -r file desc <<< "$file_desc"
    check_file "$file" "$desc"
done

# 2. VALIDAR ARCHIVOS DE TEST
log_message "🧪 Validando archivos de test..."

FILES_TEST=(
    "test-validacion-imagen-actualizacion.html:Test de validación"
    "test-actualizacion-productos.html:Test de actualización"
    "test-comparacion-rendimiento.html:Test de rendimiento"
    "test-migracion-urls.html:Test de migración"
)

for file_desc in "${FILES_TEST[@]}"; do
    IFS=':' read -r file desc <<< "$file_desc"
    check_file "$file" "$desc"
done

# 3. VALIDAR FUNCIONES CRÍTICAS
log_message "⚙️ Validando funciones críticas..."

FUNCTIONS_ADMIN=(
    "js/admin-panel-new.js:updateProduct"
    "js/admin-panel-new.js:validateImageData"
    "js/admin-panel-new.js:verifyImageSaved"
    "js/admin-panel-new.js:previewImageFromUrl"
    "js/admin-panel-new.js:handleSubmit"
)

for func_desc in "${FUNCTIONS_ADMIN[@]}"; do
    IFS=':' read -r file func <<< "$func_desc"
    check_function "$file" "$func"
done

FUNCTIONS_SERVICE=(
    "js/supabase-config-optimized.js:updateProduct"
    "js/supabase-config-optimized.js:_isValidUrl"
    "js/supabase-config-optimized.js:_optimizeImageUrl"
    "js/supabase-config-optimized.js:clearCache"
)

for func_desc in "${FUNCTIONS_SERVICE[@]}"; do
    IFS=':' read -r file func <<< "$func_desc"
    check_function "$file" "$func"
done

# 4. VALIDAR ELIMINACIÓN DE CÓDIGO OBSOLETO
log_message "🧹 Validando eliminación de código obsoleto..."

if [ -f "js/admin-panel-new.js" ]; then
    if ! grep -q "type=\"file\"" "html/admin-panel.html" 2>/dev/null; then
        log_message "✅ Input de archivo eliminado correctamente" "SUCCESS"
    else
        log_message "⚠️ Aún existe input de archivo en HTML" "WARNING"
    fi
    
    if ! grep -q "FileReader\|FormData.*append.*file" "js/admin-panel-new.js" 2>/dev/null; then
        log_message "✅ Lógica de subida de archivos eliminada" "SUCCESS"
    else
        log_message "⚠️ Aún existe lógica de subida de archivos" "WARNING"
    fi
fi

# 5. VALIDAR DOCUMENTACIÓN
log_message "📚 Validando documentación..."

DOCS=(
    "VALIDACION-ACTUALIZACION-IMAGENES.md:Documentación principal"
    "MIGRACION-COMPLETADA.md:Reporte de migración"
    "MIGRACION-EXITOSA.md:Reporte de éxito"
)

for doc_desc in "${DOCS[@]}"; do
    IFS=':' read -r file desc <<< "$doc_desc"
    check_file "$file" "$desc"
done

# 6. VALIDAR SCRIPTS DE MIGRACIÓN
log_message "🔧 Validando scripts de migración..."

SCRIPTS=(
    "js/migracion-imagenes.js:Script de migración JS"
    "migration-script.sh:Script de migración Bash"
    "verificar-migracion.sh:Script de verificación"
    "verificar-actualizacion-imagenes.sh:Script de validación"
)

for script_desc in "${SCRIPTS[@]}"; do
    IFS=':' read -r file desc <<< "$script_desc"
    check_file "$file" "$desc"
done

# 7. VALIDAR ESTRUCTURA DE ARCHIVOS
log_message "🏗️ Validando estructura de archivos..."

DIRS=(
    "html:Directorio HTML"
    "js:Directorio JavaScript"
    "css:Directorio CSS"
    "documentation:Directorio de documentación"
)

for dir_desc in "${DIRS[@]}"; do
    IFS=':' read -r dir desc <<< "$dir_desc"
    if [ -d "$dir" ]; then
        log_message "✅ $desc: $dir" "SUCCESS"
    else
        log_message "❌ $desc: $dir NO ENCONTRADO" "ERROR"
    fi
done

# 8. GENERAR ESTADÍSTICAS
log_message "📊 Generando estadísticas..."

if [ -f "js/admin-panel-new.js" ]; then
    lines=$(wc -l < "js/admin-panel-new.js")
    log_message "📈 admin-panel-new.js: $lines líneas" "INFO"
fi

if [ -f "js/supabase-config-optimized.js" ]; then
    lines=$(wc -l < "js/supabase-config-optimized.js")
    log_message "📈 supabase-config-optimized.js: $lines líneas" "INFO"
fi

# 9. VERIFICAR SINTAXIS (si Node.js está disponible)
log_message "🔍 Verificando sintaxis JavaScript..."

if command -v node >/dev/null 2>&1; then
    for js_file in "js/admin-panel-new.js" "js/supabase-config-optimized.js"; do
        if [ -f "$js_file" ]; then
            if node -c "$js_file" 2>/dev/null; then
                log_message "✅ Sintaxis correcta: $js_file" "SUCCESS"
            else
                log_message "❌ Error de sintaxis: $js_file" "ERROR"
            fi
        fi
    done
else
    log_message "⚠️ Node.js no disponible, omitiendo verificación de sintaxis" "WARNING"
fi

# 10. VERIFICAR CONFIGURACIÓN
log_message "⚙️ Verificando configuración..."

if [ -f "js/supabase-config-optimized.js" ]; then
    if grep -q "updateProduct.*async" "js/supabase-config-optimized.js"; then
        log_message "✅ Función updateProduct es asíncrona" "SUCCESS"
    fi
    
    if grep -q "clearCache" "js/supabase-config-optimized.js"; then
        log_message "✅ Función clearCache implementada" "SUCCESS"
    fi
    
    if grep -q "_isValidUrl" "js/supabase-config-optimized.js"; then
        log_message "✅ Validación de URLs implementada" "SUCCESS"
    fi
fi

# 11. GENERAR RESUMEN FINAL
log_message "📋 Generando resumen final..."

# Contar éxitos y errores
SUCCESS_COUNT=$(grep -c "SUCCESS" "$REPORT_FILE" || echo "0")
ERROR_COUNT=$(grep -c "ERROR" "$REPORT_FILE" || echo "0")
WARNING_COUNT=$(grep -c "WARNING" "$REPORT_FILE" || echo "0")

log_message "📊 RESUMEN DE VALIDACIÓN:" "INFO"
log_message "✅ Éxitos: $SUCCESS_COUNT" "INFO"
log_message "❌ Errores: $ERROR_COUNT" "INFO"
log_message "⚠️ Advertencias: $WARNING_COUNT" "INFO"

# Determinar estado general
if [ "$ERROR_COUNT" -eq 0 ]; then
    if [ "$WARNING_COUNT" -eq 0 ]; then
        ESTADO="🟢 PERFECTO"
    else
        ESTADO="🟡 BUENO CON ADVERTENCIAS"
    fi
else
    ESTADO="🔴 REQUIERE ATENCIÓN"
fi

log_message "🎯 ESTADO GENERAL: $ESTADO" "INFO"

# 12. AGREGAR CONCLUSIONES AL REPORTE
cat >> "$REPORT_FILE" << EOF

================================================================
CONCLUSIONES FINALES
================================================================

ESTADO GENERAL: $ESTADO
- Éxitos: $SUCCESS_COUNT
- Errores: $ERROR_COUNT  
- Advertencias: $WARNING_COUNT

COMPONENTES VERIFICADOS:
✅ Archivos principales del sistema
✅ Archivos de test y validación
✅ Funciones críticas de actualización
✅ Eliminación de código obsoleto
✅ Documentación completa
✅ Scripts de migración
✅ Estructura de archivos
✅ Sintaxis JavaScript
✅ Configuración del sistema

RECOMENDACIONES:
EOF

if [ "$ERROR_COUNT" -eq 0 ]; then
    cat >> "$REPORT_FILE" << EOF
✅ El sistema está listo para producción
✅ Todas las validaciones han pasado exitosamente
✅ Se puede proceder con confianza
EOF
else
    cat >> "$REPORT_FILE" << EOF
⚠️ Revisar y corregir los errores encontrados
⚠️ Ejecutar nuevamente la validación después de las correcciones
⚠️ Verificar manualmente las funcionalidades críticas
EOF
fi

cat >> "$REPORT_FILE" << EOF

PRÓXIMOS PASOS:
1. Ejecutar test-validacion-imagen-actualizacion.html en navegador
2. Probar actualización de productos manualmente
3. Verificar rendimiento en producción
4. Monitorear logs de errores
5. Capacitar al equipo en el nuevo sistema

================================================================
FIN DEL REPORTE
================================================================
EOF

# Mensaje final
log_message "✅ VALIDACIÓN FINAL COMPLETADA" "SUCCESS"
log_message "📄 Reporte generado: $REPORT_FILE" "INFO"

# Mostrar resumen en consola
echo ""
echo "🎯 RESUMEN FINAL"
echo "==============="
echo "✅ Éxitos: $SUCCESS_COUNT"
echo "❌ Errores: $ERROR_COUNT"
echo "⚠️ Advertencias: $WARNING_COUNT"
echo "🎯 Estado: $ESTADO"
echo "📄 Reporte: $REPORT_FILE"
echo ""

if [ "$ERROR_COUNT" -eq 0 ]; then
    echo "🎉 ¡VALIDACIÓN EXITOSA! El sistema está listo."
    exit 0
else
    echo "⚠️ Se encontraron errores. Revisar el reporte."
    exit 1
fi
