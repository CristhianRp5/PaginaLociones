# 🚨 SOLUCIÓN AL ERROR DE TIMEOUT

## Problema Identificado
El error `statement timeout` ocurre porque el campo `luxury` (y posiblemente `estado` y `descuento`) no existen en la tabla `productos` de Supabase.

## ✅ SOLUCIÓN RÁPIDA

### Opción 1: Ejecutar Script SQL (RECOMENDADO)
1. Ve a tu proyecto de Supabase
2. Ve a "SQL Editor" 
3. Copia y pega el contenido del archivo `sql_agregar_columnas.sql`
4. Ejecuta el script
5. Recarga la página de productos

### Opción 2: Agregar Columnas Manualmente
En el SQL Editor de Supabase, ejecuta estos comandos uno por uno:

```sql
-- Agregar columna estado
ALTER TABLE productos ADD COLUMN estado TEXT DEFAULT 'disponible';

-- Agregar columna descuento  
ALTER TABLE productos ADD COLUMN descuento INTEGER DEFAULT 0;

-- Agregar columna luxury
ALTER TABLE productos ADD COLUMN luxury BOOLEAN DEFAULT false;
```

## 🔧 VERIFICACIÓN
Después de ejecutar el script, verifica que las columnas se crearon ejecutando:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'productos' 
AND column_name IN ('estado', 'descuento', 'luxury')
ORDER BY column_name;
```

Deberías ver:
- `descuento | integer | 0`
- `estado | text | 'disponible'::text`
- `luxury | boolean | false`

## 🎯 DESPUÉS DE LA CORRECCIÓN
Una vez agregadas las columnas:
1. Los productos se cargarán normalmente
2. El campo "luxury" funcionará en el panel admin
3. Las etiquetas LUXURY aparecerán en las tarjetas
4. Los descuentos y estados funcionarán correctamente

## 💡 NOTA TÉCNICA
El código ya incluye manejo de errores que usa consultas de respaldo si las columnas no existen, pero es mejor agregar las columnas para funcionalidad completa.
