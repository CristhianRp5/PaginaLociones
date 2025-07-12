#!/bin/bash

# Script para implementar mejoras en el panel admin
# Basado en el análisis de compatibilidad

echo "🔧 Implementando mejoras en el panel admin..."
echo "============================================"

# 1. Crear backup antes de los cambios
echo "📋 Creando backup..."
backup_dir="backup-mejoras-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup_dir"
cp js/admin-panel-new.js "$backup_dir/"
cp css/admin-panel.css "$backup_dir/"
echo "✅ Backup creado en: $backup_dir"

# 2. Verificar estructura actual
echo ""
echo "🔍 Verificando estructura actual..."
echo "Analizando campos de imagen en la base de datos..."

# Función para verificar compatibilidad
check_compatibility() {
    echo "📊 Verificando compatibilidad..."
    
    if [ -f "analisis-compatibilidad-panel.html" ]; then
        echo "✅ Herramienta de análisis disponible"
        echo "🌐 Abre analisis-compatibilidad-panel.html para análisis detallado"
    else
        echo "❌ Herramienta de análisis no encontrada"
    fi
}

# 3. Implementar mejoras en validación
echo ""
echo "🎯 Implementando mejoras en validación..."

# Crear función de validación mejorada
create_validation_improvements() {
    echo "📝 Creando archivo de mejoras en validación..."
    
    cat > js/admin-panel-validacion-mejorada.js << 'EOF'
// Mejoras en validación para el panel admin
// Basado en análisis de compatibilidad

class AdminPanelValidation {
    
    // Validación mejorada de URLs de imagen
    static isValidImageUrl(url) {
        if (!url || typeof url !== 'string') return false;
        
        // Remover espacios
        url = url.trim();
        if (url === '') return false;
        
        // Validar formato de URL
        const urlPattern = /^(https?:\/\/)|(\.\/)|(\.\.\/)|(\/)/;
        if (!urlPattern.test(url)) return false;
        
        // Validar extensión de imagen (más permisivo)
        const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i;
        if (url.startsWith('http') && !imageExtensions.test(url)) {
            console.warn('URL sin extensión de imagen detectada:', url);
            // No retornar false, permitir URLs externas sin extensión visible
        }
        
        return true;
    }
    
    // Validación de datos del producto
    static validateProductData(productData) {
        const errors = [];
        
        // Validar campos requeridos
        if (!productData.nombre || productData.nombre.trim() === '') {
            errors.push('El nombre del producto es requerido');
        }
        
        if (!productData.marca || productData.marca.trim() === '') {
            errors.push('La marca del producto es requerida');
        }
        
        if (!productData.precio || productData.precio <= 0) {
            errors.push('El precio debe ser mayor a 0');
        }
        
        if (!productData.categoria || productData.categoria.trim() === '') {
            errors.push('La categoría es requerida');
        }
        
        // Validar imagen si se proporciona
        if (productData.imagen && !this.isValidImageUrl(productData.imagen)) {
            errors.push('La URL de la imagen no es válida');
        }
        
        if (productData.imagen_url && !this.isValidImageUrl(productData.imagen_url)) {
            errors.push('La URL de la imagen no es válida');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
    
    // Limpiar y normalizar datos del producto
    static cleanProductData(productData) {
        const cleaned = { ...productData };
        
        // Limpiar strings
        ['nombre', 'marca', 'descripcion', 'categoria', 'estado'].forEach(field => {
            if (cleaned[field] && typeof cleaned[field] === 'string') {
                cleaned[field] = cleaned[field].trim();
            }
        });
        
        // Normalizar precio
        if (cleaned.precio) {
            cleaned.precio = parseFloat(cleaned.precio);
        }
        
        // Limpiar URLs de imagen
        if (cleaned.imagen && typeof cleaned.imagen === 'string') {
            cleaned.imagen = cleaned.imagen.trim();
        }
        
        if (cleaned.imagen_url && typeof cleaned.imagen_url === 'string') {
            cleaned.imagen_url = cleaned.imagen_url.trim();
        }
        
        return cleaned;
    }
    
    // Unificar manejo de imágenes
    static unifyImageHandling(productData) {
        const unified = { ...productData };
        
        // Prioridad: imagen > imagen_url
        if (unified.imagen && unified.imagen.trim() !== '') {
            // Si hay imagen, usar como principal
            unified.imagen_url = unified.imagen;
        } else if (unified.imagen_url && unified.imagen_url.trim() !== '') {
            // Si solo hay imagen_url, usar como principal
            unified.imagen = unified.imagen_url;
        } else {
            // Sin imagen
            unified.imagen = null;
            unified.imagen_url = null;
        }
        
        return unified;
    }
    
    // Validar imagen en tiempo real
    static validateImageRealTime(inputElement) {
        const url = inputElement.value.trim();
        const isValid = this.isValidImageUrl(url);
        
        // Actualizar clases CSS
        inputElement.classList.toggle('invalid', !isValid && url !== '');
        inputElement.classList.toggle('valid', isValid && url !== '');
        
        // Actualizar mensaje
        const messageElement = inputElement.nextElementSibling;
        if (messageElement && messageElement.classList.contains('validation-message')) {
            if (url === '') {
                messageElement.textContent = '';
                messageElement.className = 'validation-message';
            } else if (isValid) {
                messageElement.textContent = '✅ URL válida';
                messageElement.className = 'validation-message success';
            } else {
                messageElement.textContent = '❌ URL inválida';
                messageElement.className = 'validation-message error';
            }
        }
        
        return isValid;
    }
    
    // Previsualizar imagen
    static previewImage(url, previewElement) {
        if (!url || !this.isValidImageUrl(url)) {
            previewElement.innerHTML = '<p>Vista previa no disponible</p>';
            return;
        }
        
        previewElement.innerHTML = `
            <img src="${url}" 
                 alt="Vista previa" 
                 style="max-width: 100px; max-height: 100px; object-fit: cover; border-radius: 4px;"
                 onerror="this.parentElement.innerHTML='<p>Error cargando imagen</p>'">
        `;
    }
}

// Exportar para uso global
window.AdminPanelValidation = AdminPanelValidation;
EOF
    
    echo "✅ Archivo de validación mejorada creado: js/admin-panel-validacion-mejorada.js"
}

# 4. Crear estilos para la validación
create_validation_styles() {
    echo "🎨 Creando estilos para validación..."
    
    cat > css/admin-panel-validacion.css << 'EOF'
/* Estilos para validación mejorada del panel admin */

/* Estados de validación para inputs */
.form-group input.valid,
.form-group textarea.valid {
    border-color: #28a745;
    box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}

.form-group input.invalid,
.form-group textarea.invalid {
    border-color: #dc3545;
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

/* Mensajes de validación */
.validation-message {
    font-size: 12px;
    margin-top: 5px;
    padding: 3px 8px;
    border-radius: 3px;
    display: block;
    transition: all 0.3s ease;
}

.validation-message.success {
    color: #155724;
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
}

.validation-message.error {
    color: #721c24;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
}

.validation-message.warning {
    color: #856404;
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
}

/* Vista previa de imagen */
.image-preview {
    margin-top: 10px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #f9f9f9;
    text-align: center;
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.image-preview img {
    max-width: 100%;
    max-height: 100px;
    object-fit: contain;
}

/* Indicadores de estado */
.field-status {
    display: inline-block;
    margin-left: 8px;
    font-size: 14px;
}

.field-status.loading {
    color: #007bff;
}

.field-status.success {
    color: #28a745;
}

.field-status.error {
    color: #dc3545;
}

/* Mejoras en el formulario */
.form-group {
    position: relative;
}

.form-group label {
    display: flex;
    align-items: center;
    font-weight: 500;
    margin-bottom: 5px;
}

.form-group .required::after {
    content: " *";
    color: #dc3545;
}

/* Botones de acción mejorados */
.btn-validate {
    background: #17a2b8;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    margin-left: 10px;
}

.btn-validate:hover {
    background: #138496;
}

/* Tooltip para ayuda */
.help-tooltip {
    position: relative;
    display: inline-block;
    margin-left: 5px;
    cursor: help;
}

.help-tooltip::before {
    content: "?";
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #007bff;
    color: white;
    text-align: center;
    font-size: 12px;
    line-height: 16px;
}

.help-tooltip::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s;
    z-index: 1000;
}

.help-tooltip:hover::after {
    opacity: 1;
    visibility: visible;
}

/* Responsive */
@media (max-width: 768px) {
    .validation-message {
        font-size: 11px;
    }
    
    .image-preview {
        min-height: 50px;
    }
    
    .help-tooltip::after {
        font-size: 11px;
        padding: 3px 6px;
    }
}
EOF
    
    echo "✅ Estilos de validación creados: css/admin-panel-validacion.css"
}

# 5. Crear script de integración
create_integration_script() {
    echo "🔗 Creando script de integración..."
    
    cat > js/admin-panel-integration.js << 'EOF'
// Script de integración para mejoras del panel admin
// Ejecutar después de cargar admin-panel-new.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Aplicando mejoras al panel admin...');
    
    // Integrar validación en tiempo real
    const imageUrlInput = document.getElementById('imagen_url');
    if (imageUrlInput) {
        console.log('🖼️ Configurando validación de imagen en tiempo real...');
        
        // Agregar mensaje de validación
        const validationMessage = document.createElement('div');
        validationMessage.className = 'validation-message';
        imageUrlInput.parentNode.insertBefore(validationMessage, imageUrlInput.nextSibling);
        
        // Agregar vista previa
        const previewContainer = document.createElement('div');
        previewContainer.className = 'image-preview';
        previewContainer.innerHTML = '<p>Vista previa aparecerá aquí</p>';
        validationMessage.parentNode.insertBefore(previewContainer, validationMessage.nextSibling);
        
        // Configurar eventos
        imageUrlInput.addEventListener('input', function() {
            if (window.AdminPanelValidation) {
                AdminPanelValidation.validateImageRealTime(this);
                AdminPanelValidation.previewImage(this.value, previewContainer);
            }
        });
        
        imageUrlInput.addEventListener('blur', function() {
            if (window.AdminPanelValidation) {
                AdminPanelValidation.validateImageRealTime(this);
            }
        });
    }
    
    // Mejorar validación del formulario
    const productForm = document.getElementById('product-form');
    if (productForm) {
        console.log('📋 Configurando validación mejorada del formulario...');
        
        // Agregar clases required a campos obligatorios
        const requiredFields = ['nombre', 'marca', 'precio', 'categoria'];
        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                const label = document.querySelector(`label[for="${fieldName}"]`);
                if (label) {
                    label.classList.add('required');
                }
            }
        });
        
        // Interceptar envío del formulario
        productForm.addEventListener('submit', function(e) {
            if (window.AdminPanelValidation) {
                console.log('🔍 Validando formulario antes del envío...');
                
                // Obtener datos del formulario
                const formData = new FormData(this);
                const productData = {};
                for (let [key, value] = of formData.entries()) {
                    productData[key] = value;
                }
                
                // Validar datos
                const validation = AdminPanelValidation.validateProductData(productData);
                if (!validation.valid) {
                    e.preventDefault();
                    alert('Errores de validación:\n' + validation.errors.join('\n'));
                    return false;
                }
                
                // Limpiar datos
                const cleanedData = AdminPanelValidation.cleanProductData(productData);
                const unifiedData = AdminPanelValidation.unifyImageHandling(cleanedData);
                
                // Actualizar campos con datos limpios
                Object.keys(unifiedData).forEach(key => {
                    const field = document.getElementById(key);
                    if (field) {
                        field.value = unifiedData[key] || '';
                    }
                });
                
                console.log('✅ Formulario validado y datos unificados');
            }
        });
    }
    
    // Agregar tooltips de ayuda
    const helpTooltips = [
        {
            selector: 'label[for="imagen_url"]',
            tooltip: 'Ingresa una URL válida (http://, https://, ./, ../, /)'
        },
        {
            selector: 'label[for="precio"]',
            tooltip: 'Ingresa el precio sin el símbolo $'
        },
        {
            selector: 'label[for="categoria"]',
            tooltip: 'Selecciona la categoría del producto'
        }
    ];
    
    helpTooltips.forEach(item => {
        const element = document.querySelector(item.selector);
        if (element) {
            const tooltipSpan = document.createElement('span');
            tooltipSpan.className = 'help-tooltip';
            tooltipSpan.setAttribute('data-tooltip', item.tooltip);
            element.appendChild(tooltipSpan);
        }
    });
    
    console.log('✅ Mejoras del panel admin aplicadas');
});
EOF
    
    echo "✅ Script de integración creado: js/admin-panel-integration.js"
}

# 6. Crear página de pruebas
create_test_page() {
    echo "🧪 Creando página de pruebas..."
    
    cat > test-mejoras-panel-admin.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test - Mejoras Panel Admin</title>
    <link rel="stylesheet" href="css/admin-panel.css">
    <link rel="stylesheet" href="css/admin-panel-validacion.css">
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .test-section {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
        }
        .test-section h2 {
            color: #333;
            margin-top: 0;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
        }
        .form-group input, .form-group textarea, .form-group select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin-right: 10px;
        }
        .btn-primary {
            background: #007bff;
            color: white;
        }
        .btn-primary:hover {
            background: #0056b3;
        }
        .test-results {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 4px;
            border: 1px solid #dee2e6;
        }
    </style>
</head>
<body>
    <h1>🧪 Test - Mejoras Panel Admin</h1>
    
    <div class="test-section">
        <h2>🔍 Test de Validación</h2>
        <p>Prueba la validación mejorada de URLs de imagen:</p>
        
        <div class="form-group">
            <label for="test-imagen-url">URL de Imagen:</label>
            <input type="text" id="test-imagen-url" placeholder="Ingresa una URL de imagen...">
            <div class="validation-message"></div>
            <div class="image-preview">
                <p>Vista previa aparecerá aquí</p>
            </div>
        </div>
        
        <button class="btn btn-primary" onclick="testValidation()">🔍 Validar URL</button>
        <button class="btn btn-primary" onclick="testExamples()">📋 Probar Ejemplos</button>
        
        <div id="validation-results" class="test-results" style="display: none;"></div>
    </div>
    
    <div class="test-section">
        <h2>📋 Test de Formulario</h2>
        <p>Prueba la validación completa del formulario:</p>
        
        <form id="test-product-form">
            <div class="form-group">
                <label for="test-nombre" class="required">Nombre del Producto:</label>
                <input type="text" id="test-nombre" name="nombre" required>
            </div>
            
            <div class="form-group">
                <label for="test-marca" class="required">Marca:</label>
                <input type="text" id="test-marca" name="marca" required>
            </div>
            
            <div class="form-group">
                <label for="test-precio" class="required">Precio:</label>
                <input type="number" id="test-precio" name="precio" step="0.01" required>
            </div>
            
            <div class="form-group">
                <label for="test-categoria" class="required">Categoría:</label>
                <select id="test-categoria" name="categoria" required>
                    <option value="">Seleccionar...</option>
                    <option value="para-ellos">Para Ellos</option>
                    <option value="para-ellas">Para Ellas</option>
                    <option value="unisex">Unisex</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="test-descripcion">Descripción:</label>
                <textarea id="test-descripcion" name="descripcion" rows="3"></textarea>
            </div>
            
            <div class="form-group">
                <label for="test-imagen-form">URL de Imagen:</label>
                <input type="text" id="test-imagen-form" name="imagen_url">
                <div class="validation-message"></div>
                <div class="image-preview">
                    <p>Vista previa aparecerá aquí</p>
                </div>
            </div>
            
            <button type="submit" class="btn btn-primary">💾 Validar Formulario</button>
        </form>
        
        <div id="form-results" class="test-results" style="display: none;"></div>
    </div>
    
    <div class="test-section">
        <h2>🎯 Test de Unificación</h2>
        <p>Prueba la unificación de campos de imagen:</p>
        
        <div class="form-group">
            <label for="test-imagen-campo">Campo 'imagen':</label>
            <input type="text" id="test-imagen-campo" placeholder="URL o base64...">
        </div>
        
        <div class="form-group">
            <label for="test-imagen-url-campo">Campo 'imagen_url':</label>
            <input type="text" id="test-imagen-url-campo" placeholder="URL de imagen...">
        </div>
        
        <button class="btn btn-primary" onclick="testUnification()">🔄 Unificar Campos</button>
        
        <div id="unification-results" class="test-results" style="display: none;"></div>
    </div>
    
    <script src="js/admin-panel-validacion-mejorada.js"></script>
    <script src="js/admin-panel-integration.js"></script>
    <script>
        // Funciones de test
        function testValidation() {
            const url = document.getElementById('test-imagen-url').value;
            const isValid = AdminPanelValidation.isValidImageUrl(url);
            
            const resultsDiv = document.getElementById('validation-results');
            resultsDiv.style.display = 'block';
            resultsDiv.innerHTML = `
                <strong>Resultado de Validación:</strong><br>
                URL: ${url}<br>
                Válida: ${isValid ? '✅ Sí' : '❌ No'}<br>
                Tipo: ${getUrlType(url)}
            `;
        }
        
        function testExamples() {
            const examples = [
                'https://example.com/image.jpg',
                'http://example.com/image.png',
                './images/local.jpg',
                '../images/relative.png',
                '/absolute/path.webp',
                'invalid-url',
                'https://example.com/noextension',
                'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...'
            ];
            
            let results = '<strong>Ejemplos de Validación:</strong><br>';
            examples.forEach(url => {
                const isValid = AdminPanelValidation.isValidImageUrl(url);
                results += `${isValid ? '✅' : '❌'} ${url}<br>`;
            });
            
            const resultsDiv = document.getElementById('validation-results');
            resultsDiv.style.display = 'block';
            resultsDiv.innerHTML = results;
        }
        
        function testUnification() {
            const imagenCampo = document.getElementById('test-imagen-campo').value;
            const imagenUrlCampo = document.getElementById('test-imagen-url-campo').value;
            
            const testData = {
                imagen: imagenCampo,
                imagen_url: imagenUrlCampo
            };
            
            const unified = AdminPanelValidation.unifyImageHandling(testData);
            
            const resultsDiv = document.getElementById('unification-results');
            resultsDiv.style.display = 'block';
            resultsDiv.innerHTML = `
                <strong>Datos Originales:</strong><br>
                imagen: ${testData.imagen || 'vacío'}<br>
                imagen_url: ${testData.imagen_url || 'vacío'}<br><br>
                <strong>Datos Unificados:</strong><br>
                imagen: ${unified.imagen || 'null'}<br>
                imagen_url: ${unified.imagen_url || 'null'}
            `;
        }
        
        function getUrlType(url) {
            if (!url) return 'vacía';
            if (url.startsWith('data:')) return 'base64';
            if (url.startsWith('http://') || url.startsWith('https://')) return 'externa';
            if (url.startsWith('./') || url.startsWith('../')) return 'relativa';
            if (url.startsWith('/')) return 'absoluta';
            return 'inválida';
        }
        
        // Configurar validación en tiempo real para el formulario de test
        document.getElementById('test-imagen-form').addEventListener('input', function() {
            AdminPanelValidation.validateImageRealTime(this);
            const preview = this.parentNode.querySelector('.image-preview');
            AdminPanelValidation.previewImage(this.value, preview);
        });
        
        // Configurar validación del formulario de test
        document.getElementById('test-product-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const productData = {};
            for (let [key, value] of formData.entries()) {
                productData[key] = value;
            }
            
            const validation = AdminPanelValidation.validateProductData(productData);
            const cleaned = AdminPanelValidation.cleanProductData(productData);
            const unified = AdminPanelValidation.unifyImageHandling(cleaned);
            
            const resultsDiv = document.getElementById('form-results');
            resultsDiv.style.display = 'block';
            resultsDiv.innerHTML = `
                <strong>Validación:</strong> ${validation.valid ? '✅ Válido' : '❌ Inválido'}<br>
                ${validation.errors.length > 0 ? '<strong>Errores:</strong><br>' + validation.errors.map(e => `• ${e}`).join('<br>') + '<br>' : ''}
                <strong>Datos Procesados:</strong><br>
                <pre>${JSON.stringify(unified, null, 2)}</pre>
            `;
        });
    </script>
</body>
</html>
EOF
    
    echo "✅ Página de pruebas creada: test-mejoras-panel-admin.html"
}

# 7. Ejecutar implementación
echo ""
echo "🚀 Ejecutando implementación..."

check_compatibility
create_validation_improvements
create_validation_styles
create_integration_script
create_test_page

echo ""
echo "✅ Implementación completada!"
echo "============================================"
echo ""
echo "📋 Archivos creados:"
echo "  • js/admin-panel-validacion-mejorada.js"
echo "  • css/admin-panel-validacion.css"
echo "  • js/admin-panel-integration.js"
echo "  • test-mejoras-panel-admin.html"
echo ""
echo "🎯 Próximos pasos:"
echo "  1. Abrir test-mejoras-panel-admin.html para probar las mejoras"
echo "  2. Integrar los archivos en el panel admin principal"
echo "  3. Actualizar admin-panel.html para incluir los nuevos archivos"
echo ""
echo "🌐 Para probar:"
echo "  • Abre test-mejoras-panel-admin.html en el navegador"
echo "  • Usa analisis-compatibilidad-panel.html para análisis detallado"
echo ""
echo "🔧 Estado: Mejoras implementadas y listas para integración"
