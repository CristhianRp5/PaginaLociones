#!/bin/bash

# Script para diagnosticar problemas de estructura entre BD y Panel Admin

echo "🔍 DIAGNÓSTICO: ESTRUCTURA BD vs PANEL ADMIN"
echo "==========================================="
echo ""

echo "❓ PROBLEMA REPORTADO:"
echo "- Error: 'Verificación de imagen falló: No se encontró imagen en el producto guardado'"
echo "- Posible causa: Diferencias en estructura de tabla vs campos esperados"
echo ""

echo "📋 CAMPOS ESPERADOS POR EL PANEL ADMIN:"
echo ""

echo "🔧 CAMPOS PRINCIPALES (del formulario):"
echo "- nombre (text, required)"
echo "- marca (text, required)"
echo "- precio (number, required)"
echo "- ml (number, required, default: 100)"
echo "- categoria (text, required)"
echo "- subcategoria (text, optional)"
echo "- descripcion (text, optional)"
echo "- notas (text, optional)"
echo "- estado (text, default: 'disponible')"
echo "- descuento (number, optional)"
echo "- luxury (boolean, optional)"
echo "- activo (boolean, optional)"
echo ""

echo "🖼️ CAMPOS DE IMAGEN:"
echo "- imagen (text, optional) - Campo legacy/fallback"
echo "- imagen_url (text, optional) - Campo principal"
echo ""

echo "🔄 CAMPOS AUTOMÁTICOS:"
echo "- id (number, auto)"
echo "- created_at (timestamp, auto)"
echo "- updated_at (timestamp, auto)"
echo ""

echo "🎯 VERIFICACIONES NECESARIAS:"
echo ""

echo "1. 📊 ESTRUCTURA DE LA TABLA:"
echo "   - Verificar que todos los campos del formulario existan"
echo "   - Confirmar tipos de datos correctos"
echo "   - Validar campos nullable vs required"
echo ""

echo "2. 🖼️ CAMPOS DE IMAGEN:"
echo "   - Confirmar que 'imagen' existe (fallback)"
echo "   - Confirmar que 'imagen_url' existe (principal)"
echo "   - Verificar que la lógica de prioridad funcione"
echo ""

echo "3. 🔧 COMPATIBILIDAD:"
echo "   - Panel envía datos que BD puede recibir"
echo "   - BD retorna datos que panel puede leer"
echo "   - Función verifyImageSaved() encuentra la imagen"
echo ""

echo "📁 HERRAMIENTAS DISPONIBLES:"
echo ""

echo "🔍 1. VERIFICACIÓN AUTOMÁTICA:"
echo "   - Archivo: verificar-estructura-bd-panel.html"
echo "   - Función: Comparar estructuras automáticamente"
echo "   - Uso: start verificar-estructura-bd-panel.html"
echo ""

echo "📊 2. CONSULTA RÁPIDA:"
echo "   - Archivo: consulta-rapida-estructura.html"
echo "   - Función: Analizar estructura de BD"
echo "   - Uso: start consulta-rapida-estructura.html"
echo ""

echo "🧪 3. TEST DE CREACIÓN:"
echo "   - Archivo: test-crear-producto.html"
echo "   - Función: Probar crear producto"
echo "   - Uso: start test-crear-producto.html"
echo ""

echo "🎯 PASOS PARA DIAGNOSTICAR:"
echo ""

echo "PASO 1: Verificar estructura"
echo "start verificar-estructura-bd-panel.html"
echo "- Hacer clic en 'Comparar Estructuras'"
echo "- Revisar campos faltantes o tipos incorrectos"
echo ""

echo "PASO 2: Analizar diferencias"
echo "- Si hay campos faltantes en BD: agregar a tabla"
echo "- Si hay tipos incorrectos: ajustar panel o BD"
echo "- Si hay campos extra en BD: documentar"
echo ""

echo "PASO 3: Probar creación"
echo "start test-crear-producto.html"
echo "- Crear producto con URL de imagen"
echo "- Verificar que no hay errores"
echo "- Confirmar que imagen se guarda/lee correctamente"
echo ""

echo "🔧 POSIBLES SOLUCIONES:"
echo ""

echo "💡 SI FALTA CAMPO EN BD:"
echo "ALTER TABLE productos ADD COLUMN campo_faltante tipo_dato;"
echo ""

echo "💡 SI TIPO INCORRECTO:"
echo "ALTER TABLE productos ALTER COLUMN campo TYPE nuevo_tipo;"
echo ""

echo "💡 SI PROBLEMA DE IMAGEN:"
echo "- Verificar que 'imagen' e 'imagen_url' existan"
echo "- Confirmar que obtenerImagenProducto() funcione"
echo "- Validar que verifyImageSaved() use lógica correcta"
echo ""

echo "🎯 DIAGNÓSTICO ESPECÍFICO PARA IMÁGENES:"
echo ""

echo "1. 🖼️ VERIFICAR CAMPOS DE IMAGEN:"
echo "   SELECT column_name, data_type, is_nullable"
echo "   FROM information_schema.columns"
echo "   WHERE table_name = 'productos'"
echo "   AND column_name IN ('imagen', 'imagen_url');"
echo ""

echo "2. 📊 VERIFICAR PRODUCTOS EXISTENTES:"
echo "   SELECT id, nombre, "
echo "   CASE WHEN imagen IS NOT NULL THEN 'SI' ELSE 'NO' END as tiene_imagen,"
echo "   CASE WHEN imagen_url IS NOT NULL THEN 'SI' ELSE 'NO' END as tiene_imagen_url"
echo "   FROM productos LIMIT 5;"
echo ""

echo "3. 🔧 VERIFICAR LÓGICA DE PRIORIDAD:"
echo "   - Panel debe leer imagen_url primero"
echo "   - Si imagen_url vacía, leer imagen"
echo "   - Si ambas vacías, usar placeholder"
echo ""

echo "🚀 EJECUTAR DIAGNÓSTICO:"
echo ""

echo "📊 Abrir herramienta principal:"
echo "start verificar-estructura-bd-panel.html"
echo ""

echo "🧪 Probar creación directa:"
echo "start test-crear-producto.html"
echo ""

echo "📋 Análisis rápido de BD:"
echo "start consulta-rapida-estructura.html"
echo ""

echo "✅ RESULTADO ESPERADO:"
echo "- Estructuras compatibles sin diferencias críticas"
echo "- Campos imagen e imagen_url presentes"
echo "- Creación de productos sin errores"
echo "- Verificación de imagen exitosa"
echo ""

echo "🎯 Si encuentras diferencias, documenta y corrige según sea necesario."
echo "💡 El problema probablemente está en campos faltantes o tipos incorrectos."
