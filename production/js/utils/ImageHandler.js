// Manejador de Imágenes - Clase utilitaria
class ImageHandler {
    constructor() {
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        this.placeholderSvg = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmOGY5ZmEiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZjNzU3ZCIgZm9udC1zaXplPSIxNCI+U2luIGltYWdlbjwvdGV4dD48L3N2Zz4=';
    }

    /**
     * Valida un archivo de imagen
     * @param {File} file - Archivo a validar
     * @returns {Object} - {valid: boolean, error: string}
     */
    validateImageFile(file) {
        if (!file) {
            return { valid: false, error: 'No se seleccionó ningún archivo' };
        }

        if (!this.allowedTypes.includes(file.type)) {
            return { 
                valid: false, 
                error: `Tipo de archivo no válido. Permitidos: ${this.allowedTypes.join(', ')}` 
            };
        }

        if (file.size > this.maxFileSize) {
            const maxSizeMB = this.maxFileSize / (1024 * 1024);
            return { 
                valid: false, 
                error: `El archivo es muy grande. Máximo ${maxSizeMB}MB` 
            };
        }

        return { valid: true, error: null };
    }

    /**
     * Valida una URL de imagen
     * @param {string} url - URL a validar
     * @returns {Object} - {valid: boolean, error: string}
     */
    validateImageUrl(url) {
        if (!url || !url.trim()) {
            return { valid: false, error: 'URL vacía' };
        }

        const trimmedUrl = url.trim();
        
        // Verificar si es una URL válida o ruta relativa
        const isValidUrl = trimmedUrl.startsWith('http://') || 
                          trimmedUrl.startsWith('https://') ||
                          trimmedUrl.startsWith('./') ||
                          trimmedUrl.startsWith('../') ||
                          trimmedUrl.startsWith('/');

        if (!isValidUrl) {
            return { 
                valid: false, 
                error: 'URL debe comenzar con http://, https://, ./, ../ o /' 
            };
        }

        return { valid: true, error: null };
    }

    /**
     * Convierte un archivo a Base64
     * @param {File} file - Archivo a convertir
     * @returns {Promise<string>} - Promesa que resuelve con el Base64
     */
    async convertFileToBase64(file) {
        const validation = this.validateImageFile(file);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Error leyendo el archivo'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Obtiene la ruta correcta para mostrar una imagen
     * @param {string} imagePath - Ruta de la imagen
     * @returns {string} - Ruta corregida
     */
    getImagePath(imagePath) {
        if (!imagePath) return this.placeholderSvg;
        
        // Si es data URI o URL completa, devolverla tal como está
        if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
            return imagePath;
        }
        
        // Ajustar ruta relativa basada en la ubicación actual
        const currentPath = window.location.pathname;
        const isInHtmlFolder = currentPath.includes('/html/');
        
        return isInHtmlFolder && !imagePath.startsWith('../') 
            ? `../${imagePath}` 
            : imagePath;
    }

    /**
     * Crea un elemento de vista previa de imagen
     * @param {string} src - Fuente de la imagen
     * @param {Object} options - Opciones de configuración
     * @returns {HTMLImageElement} - Elemento img configurado
     */
    createPreviewImage(src, options = {}) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = options.alt || 'Vista previa';
        img.style.maxWidth = options.maxWidth || '200px';
        img.style.maxHeight = options.maxHeight || '200px';
        img.style.objectFit = options.objectFit || 'cover';
        img.style.borderRadius = options.borderRadius || '8px';
        
        return img;
    }

    /**
     * Actualiza la vista previa de imagen desde URL
     * @param {string} url - URL de la imagen
     * @param {HTMLElement} container - Contenedor de la vista previa
     * @param {Function} onSuccess - Callback cuando la imagen carga exitosamente
     * @param {Function} onError - Callback cuando hay error
     */
    previewImageFromUrl(url, container, onSuccess = null, onError = null) {
        if (!container) return;

        const validation = this.validateImageUrl(url);
        if (!validation.valid) {
            container.innerHTML = `<p style="color: #e74c3c;">${validation.error}</p>`;
            if (onError) onError(validation.error);
            return;
        }

        const img = this.createPreviewImage(url);

        img.onload = () => {
            container.innerHTML = '';
            container.appendChild(img);
            if (onSuccess) onSuccess(img);
        };

        img.onerror = () => {
            const errorMsg = 'Error cargando imagen desde URL';
            container.innerHTML = `<p style="color: #e74c3c;">${errorMsg}</p>`;
            if (onError) onError(errorMsg);
        };
    }

    /**
     * Actualiza la vista previa de imagen desde archivo
     * @param {File} file - Archivo de imagen
     * @param {HTMLElement} container - Contenedor de la vista previa
     * @param {Function} onSuccess - Callback cuando la imagen carga exitosamente
     * @param {Function} onError - Callback cuando hay error
     */
    async previewImageFromFile(file, container, onSuccess = null, onError = null) {
        if (!container) return;

        try {
            const base64 = await this.convertFileToBase64(file);
            const img = this.createPreviewImage(base64);

            container.innerHTML = '';
            container.appendChild(img);
            
            if (onSuccess) onSuccess(img, base64);
        } catch (error) {
            container.innerHTML = `<p style="color: #e74c3c;">${error.message}</p>`;
            if (onError) onError(error.message);
        }
    }

    /**
     * Limpia la vista previa de imagen
     * @param {HTMLElement} container - Contenedor de la vista previa
     */
    clearPreview(container) {
        if (container) {
            container.innerHTML = '<p>Vista previa de imagen</p>';
        }
    }

    /**
     * Procesa imagen para producto (archivo o URL)
     * @param {HTMLInputElement} fileInput - Input de archivo
     * @param {HTMLInputElement} urlInput - Input de URL
     * @returns {Promise<Object>} - {imagen: string, imagen_url: string}
     */
    async processProductImage(fileInput, urlInput) {
        // Priorizar archivo sobre URL
        if (fileInput?.files?.length > 0) {
            const file = fileInput.files[0];
            const imageData = await this.convertFileToBase64(file);
            return {
                imagen: imageData,
                imagen_url: imageData
            };
        } 
        
        if (urlInput?.value?.trim()) {
            const validation = this.validateImageUrl(urlInput.value.trim());
            if (!validation.valid) {
                throw new Error(validation.error);
            }
            
            const imageUrl = urlInput.value.trim();
            return {
                imagen: imageUrl,
                imagen_url: imageUrl
            };
        }
        
        return {
            imagen: null,
            imagen_url: null
        };
    }

    /**
     * Obtiene el placeholder por defecto
     * @returns {string} - URL del placeholder
     */
    getPlaceholder() {
        return this.placeholderSvg;
    }
}

// Exportar para uso global
window.ImageHandler = ImageHandler;
