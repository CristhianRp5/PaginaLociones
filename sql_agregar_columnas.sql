-- Script SQL para agregar columnas faltantes en la tabla productos
-- Ejecutar este script en el panel de Supabase > SQL Editor

-- Agregar columna estado si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='estado') THEN
        ALTER TABLE productos ADD COLUMN estado TEXT DEFAULT 'disponible';
    END IF;
END $$;

-- Agregar columna descuento si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='descuento') THEN
        ALTER TABLE productos ADD COLUMN descuento INTEGER DEFAULT 0;
    END IF;
END $$;

-- Agregar columna luxury si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='luxury') THEN
        ALTER TABLE productos ADD COLUMN luxury BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Agregar columna ml (mililitros) si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='ml') THEN
        ALTER TABLE productos ADD COLUMN ml INTEGER DEFAULT 100;
    END IF;
END $$;

-- Verificar que las columnas se han creado correctamente
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'productos' 
AND column_name IN ('estado', 'descuento', 'luxury', 'ml')
ORDER BY column_name;
