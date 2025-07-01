// ==========================================
// CARRITO DE COMPRAS - SISTEMA INDEPENDIENTE
// ==========================================

class ShoppingCart {
    constructor() {
        this.items = [];
        this.isInitialized = false;
        this.init();
    }

    async init() {
        if (this.isInitialized) return;
        
        console.log('🛒 Inicializando carrito de compras...');
        
        try {
            // Cargar items del localStorage
            this.loadFromStorage();
            
            // Insertar HTML del carrito
            await this.insertCartHTML();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Actualizar UI
            this.updateCartUI();
            
            this.isInitialized = true;
            console.log('✅ Carrito inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando carrito:', error);
        }
    }

    async insertCartHTML() {
        try {
            // Cargar template del carrito
            const response = await fetch('../html/cart-template.html');
            if (!response.ok) {
                throw new Error('No se pudo cargar el template del carrito');
            }
            
            const cartHTML = await response.text();
            
            // Insertar al final del body
            document.body.insertAdjacentHTML('beforeend', cartHTML);
            
        } catch (error) {
            console.warn('⚠️ No se pudo cargar template externo, usando HTML inline');
            
            // Fallback: HTML inline
            const cartHTML = `
                <div class="cart-overlay" id="cartOverlay"></div>
                <div class="cart-slide" id="cartSlide">
                    <div class="cart-header">
                        <h2 class="cart-title">Mi Carrito</h2>
                        <button class="cart-close" id="cartClose" aria-label="Cerrar carrito">&times;</button>
                    </div>
                    
                    <div class="cart-content" id="cartContent">
                        <div class="cart-empty" id="cartEmpty">
                            <svg class="cart-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="m1 1 4 4 0 0 9.09-.09L15 14H6"></path>
                                <path d="M5.5 7h7.09l.9 5H6.5L5.5 7z"></path>
                            </svg>
                            <h3>Tu carrito está vacío</h3>
                            <p>Agrega algunos productos para comenzar tu compra</p>
                        </div>
                        
                        <div class="cart-items" id="cartItems" style="display: none;"></div>
                    </div>
                    
                    <div class="cart-footer" id="cartFooter" style="display: none;">
                        <div class="cart-total">
                            <span class="cart-total-label">Total:</span>
                            <span class="cart-total-amount" id="cartTotalAmount">$0</span>
                        </div>
                        
                        <div class="cart-actions">
                            <button class="cart-btn cart-btn-primary" id="checkoutBtn">
                                Proceder al Checkout
                            </button>
                            <button class="cart-btn cart-btn-secondary" id="continueShoppingBtn">
                                Continuar Comprando
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', cartHTML);
        }
    }

    setupEventListeners() {
        // Botón del carrito en navbar
        const cartButton = document.getElementById('cartButton');
        if (cartButton) {
            cartButton.addEventListener('click', () => this.toggleCart());
            console.log('✅ Event listener configurado para botón del carrito');
        } else {
            console.log('⚠️ Botón del carrito no encontrado durante setupEventListeners');
        }

        // Cerrar carrito
        const cartClose = document.getElementById('cartClose');
        const cartOverlay = document.getElementById('cartOverlay');
        
        if (cartClose) {
            cartClose.addEventListener('click', () => this.closeCart());
        }
        
        if (cartOverlay) {
            cartOverlay.addEventListener('click', () => this.closeCart());
        }

        // Botones del footer
        const checkoutBtn = document.getElementById('checkoutBtn');
        const continueShoppingBtn = document.getElementById('continueShoppingBtn');
        
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.proceedToCheckout());
        }
        
        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', () => this.closeCart());
        }

        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isCartOpen()) {
                this.closeCart();
            }
        });
    }    // Métodos públicos para agregar/quitar productos
    addItem(product) {
        console.log('🛒 Agregando producto al carrito:', product);
        
        // Normalizar ID como string para consistencia
        const productId = String(product.id);
        
        const existingItem = this.items.find(item => String(item.id) === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
            console.log(`✅ Cantidad incrementada. Nueva cantidad: ${existingItem.quantity}`);
        } else {
            this.items.push({
                id: productId, // Guardar como string
                nombre: product.nombre,
                marca: product.marca,
                precio: product.precio,
                imagen: product.imagen_url || product.imagen,
                quantity: 1
            });
            console.log(`✅ Nuevo producto agregado con ID: ${productId}`);
        }
        
        this.saveToStorage();
        this.updateCartUI();
        this.showAddedNotification(product.nombre);
        
        console.log(`✅ Total items en carrito: ${this.getTotalItems()}`);
    }    removeItem(productId) {
        console.log('🗑️ Eliminando producto del carrito:', productId, typeof productId);
        
        // Normalizar ID y filtrar
        const normalizedId = String(productId);
        const initialLength = this.items.length;
        this.items = this.items.filter(item => String(item.id) !== normalizedId);
        
        if (this.items.length < initialLength) {
            console.log('✅ Producto eliminado del carrito');
        } else {
            console.warn('⚠️ No se encontró producto para eliminar:', productId);
        }
        
        this.saveToStorage();
        this.updateCartUI();
    }

    updateQuantity(productId, newQuantity) {
        console.log(`🔢 Actualizando cantidad para producto ${productId} (${typeof productId}): ${newQuantity}`);
        
        // Validar cantidad
        if (newQuantity < 0) {
            console.warn('⚠️ Cantidad no puede ser negativa');
            return;
        }
        
        if (newQuantity === 0) {
            // Buscar con comparación flexible
            const item = this.items.find(item => item.id == productId || item.id === String(productId) || String(item.id) === String(productId));
            if (item) {
                const confirmRemove = confirm(`¿Eliminar "${item.nombre}" del carrito?`);
                if (confirmRemove) {
                    this.removeItem(productId);
                }
            }
            return;
        }
        
        // Buscar con comparación flexible
        const item = this.items.find(item => item.id == productId || item.id === String(productId) || String(item.id) === String(productId));
        if (item) {
            const oldQuantity = item.quantity;
            item.quantity = Math.max(1, Math.floor(newQuantity)); // Asegurar que sea al menos 1 y entero
            
            this.saveToStorage();
            this.updateCartUI();
            
            console.log(`✅ Cantidad actualizada de ${oldQuantity} a ${item.quantity}`);
        } else {
            console.error('❌ Producto no encontrado en carrito:', productId);
            console.log('🔍 IDs disponibles:', this.items.map(item => ({ id: item.id, tipo: typeof item.id })));
        }
    }

    clearCart() {
        console.log('🧹 Limpiando carrito');
        this.items = [];
        this.saveToStorage();
        this.updateCartUI();
    }

    // Métodos de UI
    toggleCart() {
        if (this.isCartOpen()) {
            this.closeCart();
        } else {
            this.openCart();
        }
    }

    openCart() {
        console.log('📂 Abriendo carrito');
        const cartSlide = document.getElementById('cartSlide');
        const cartOverlay = document.getElementById('cartOverlay');
        
        if (cartSlide && cartOverlay) {
            cartSlide.classList.add('active');
            cartOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeCart() {
        console.log('📁 Cerrando carrito');
        const cartSlide = document.getElementById('cartSlide');
        const cartOverlay = document.getElementById('cartOverlay');
        
        if (cartSlide && cartOverlay) {
            cartSlide.classList.remove('active');
            cartOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }    isCartOpen() {
        const cartSlide = document.getElementById('cartSlide');
        return cartSlide && cartSlide.classList.contains('active');
    }
    
    updateCartUI() {
        // Validar carrito antes de actualizar UI
        this.validateCart();
        
        this.updateCartCount();
        this.updateCartContent();
        
        // Debug info
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('🛒 Estado del carrito:', this.getCartStatus());
        }
    }

    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        const totalItems = this.getTotalItems();
        
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.classList.toggle('hidden', totalItems === 0);
            
            // Animación del contador
            if (totalItems > 0) {
                cartCount.style.animation = 'none';
                setTimeout(() => {
                    cartCount.style.animation = 'cartBounce 0.3s ease-out';
                }, 10);
            }
        }
    }

    updateCartContent() {
        const cartEmpty = document.getElementById('cartEmpty');
        const cartItems = document.getElementById('cartItems');
        const cartFooter = document.getElementById('cartFooter');
        
        if (this.items.length === 0) {
            // Mostrar estado vacío
            if (cartEmpty) cartEmpty.style.display = 'flex';
            if (cartItems) cartItems.style.display = 'none';
            if (cartFooter) cartFooter.style.display = 'none';
        } else {
            // Mostrar items
            if (cartEmpty) cartEmpty.style.display = 'none';
            if (cartItems) cartItems.style.display = 'block';
            if (cartFooter) cartFooter.style.display = 'block';
            
            this.renderCartItems();
            this.updateCartTotal();
        }
    }    renderCartItems() {
        const cartItems = document.getElementById('cartItems');
        if (!cartItems) return;
        
        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.imagen || '../images/placeholder.jpg'}" 
                         alt="${item.nombre}"
                         onerror="this.src='../images/placeholder.jpg'">
                </div>
                
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.nombre}</h4>
                    <p class="cart-item-brand">${item.marca || 'Sin marca'}</p>
                    
                    <div class="cart-item-controls">
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="window.shoppingCart.decreaseQuantity('${item.id}')" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn" onclick="window.shoppingCart.increaseQuantity('${item.id}')">+</button>
                        </div>
                        
                        <span class="cart-item-price">$${this.formatPrice(item.precio * item.quantity)}</span>
                        
                        <button class="cart-item-remove" onclick="window.shoppingCart.removeItem('${item.id}')" title="Eliminar producto">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateCartTotal() {
        const cartTotalAmount = document.getElementById('cartTotalAmount');
        const total = this.getTotal();
        
        if (cartTotalAmount) {
            cartTotalAmount.textContent = `$${this.formatPrice(total)}`;
        }
    }

    // Métodos de cálculo
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.precio * item.quantity), 0);
    }

    formatPrice(price) {
        return new Intl.NumberFormat('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    }

    // Persistencia
    saveToStorage() {
        try {
            localStorage.setItem('shopping_cart', JSON.stringify(this.items));
        } catch (error) {
            console.warn('⚠️ No se pudo guardar el carrito en localStorage:', error);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('shopping_cart');
            if (saved) {
                this.items = JSON.parse(saved);
                console.log(`📦 Carrito cargado: ${this.items.length} items`);
            }
        } catch (error) {
            console.warn('⚠️ No se pudo cargar el carrito desde localStorage:', error);
            this.items = [];
        }
    }

    // Notificaciones
    showAddedNotification(productName) {
        // Crear notification temporal
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #2c2c2c;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-family: 'Montserrat', sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        notification.innerHTML = `
            <div>✅ <strong>${productName}</strong> agregado al carrito</div>
        `;
        
        document.body.appendChild(notification);
        
        // Mostrar notification
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Ocultar y remover notification
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Checkout
    proceedToCheckout() {
        console.log('💳 Procediendo al checkout');
        
        if (this.items.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }
        
        // Aquí puedes integrar con tu sistema de checkout
        // Por ahora, mostrar resumen
        const total = this.getTotal();
        const itemCount = this.getTotalItems();
        
        const confirmed = confirm(
            `¿Proceder con la compra?\n\n` +
            `Items: ${itemCount}\n` +
            `Total: $${this.formatPrice(total)}\n\n` +
            `Se abrirá WhatsApp para completar la compra.`
        );
        
        if (confirmed) {
            this.sendWhatsAppOrder();
        }
    }

    sendWhatsAppOrder() {
        const phoneNumber = '573001234567'; // Cambiar por tu número
        let message = `🛒 *Nueva Orden - Aromes De Dieu*\n\n`;
        
        this.items.forEach((item, index) => {
            message += `${index + 1}. *${item.nombre}*\n`;
            message += `   Marca: ${item.marca || 'N/A'}\n`;
            message += `   Cantidad: ${item.quantity}\n`;
            message += `   Precio: $${this.formatPrice(item.precio * item.quantity)}\n\n`;
        });
        
        message += `💰 *Total: $${this.formatPrice(this.getTotal())}*\n\n`;
        message += `¡Gracias por tu compra! 🌟`;
        
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        
        // Opcional: limpiar carrito después del checkout
        // this.clearCart();
    }

    // Método de validación y depuración
    validateCart() {
        console.log('🔍 Validando carrito...');
        
        let hasChanges = false;
        
        // Eliminar items con cantidad 0 o inválida
        const validItems = this.items.filter(item => {
            if (!item.id || item.quantity <= 0 || !item.nombre || !item.precio) {
                console.warn('⚠️ Eliminando item inválido:', item);
                hasChanges = true;
                return false;
            }
            return true;
        });
        
        // Corregir cantidades no enteras
        validItems.forEach(item => {
            const newQuantity = Math.max(1, Math.floor(item.quantity));
            if (newQuantity !== item.quantity) {
                console.warn(`⚠️ Corrigiendo cantidad de ${item.quantity} a ${newQuantity} para ${item.nombre}`);
                item.quantity = newQuantity;
                hasChanges = true;
            }
        });
        
        if (hasChanges) {
            this.items = validItems;
            this.saveToStorage();
            this.updateCartUI();
            console.log('✅ Carrito validado y corregido');
        } else {
            console.log('✅ Carrito válido');
        }
        
        return this.items.length;
    }

    // Método para obtener información detallada del carrito
    getCartStatus() {
        return {
            totalItems: this.getTotalItems(),
            totalValue: this.getTotal(),
            itemCount: this.items.length,
            items: this.items.map(item => ({
                id: item.id,
                nombre: item.nombre,
                quantity: item.quantity,
                precio: item.precio,
                subtotal: item.precio * item.quantity
            })),
            isValid: this.items.every(item => 
                item.id && item.quantity > 0 && item.nombre && item.precio
            )
        };
    }

    // Método de emergencia para reinicializar el carrito
    resetCart() {
        console.log('🔄 Reinicializando carrito...');
        
        try {
            this.items = [];
            this.saveToStorage();
            this.updateCartUI();
            
            // Recrear elementos del DOM si es necesario
            if (!document.getElementById('cartSlide')) {
                this.insertCartHTML();
                this.setupEventListeners();
            }
            
            console.log('✅ Carrito reinicializado exitosamente');
            return true;
        } catch (error) {
            console.error('❌ Error reinicializando carrito:', error);
            return false;
        }
    }

    // Método para debugging avanzado
    debugCart() {
        console.group('🛒 DEBUG DEL CARRITO');
        console.log('Estado:', this.getCartStatus());
        console.log('HTML Elements:', {
            cartButton: !!document.getElementById('cartButton'),
            cartSlide: !!document.getElementById('cartSlide'),
            cartItems: !!document.getElementById('cartItems'),
            cartCount: !!document.getElementById('cartCount')
        });
        console.log('LocalStorage:', localStorage.getItem('shopping_cart'));
        console.log('Inicializado:', this.isInitialized);
        console.groupEnd();
    }    // Métodos mejorados para manejo de cantidades
    increaseQuantity(productId) {
        console.log('➕ Incrementando cantidad para producto:', productId, typeof productId);
        
        // Normalizar ID para búsqueda
        const normalizedId = String(productId);
        const item = this.items.find(item => String(item.id) === normalizedId);
        
        if (item) {
            item.quantity += 1;
            this.saveToStorage();
            this.updateCartUI();
            console.log(`✅ Nueva cantidad: ${item.quantity}`);
        } else {
            console.error('❌ Producto no encontrado en carrito:', productId);
            console.log('🔍 IDs en carrito:', this.items.map(item => ({ id: item.id, nombre: item.nombre })));
        }
    }

    decreaseQuantity(productId) {
        console.log('➖ Decrementando cantidad para producto:', productId, typeof productId);
        
        // Normalizar ID para búsqueda
        const normalizedId = String(productId);
        const item = this.items.find(item => String(item.id) === normalizedId);
        
        if (item) {
            if (item.quantity > 1) {
                item.quantity -= 1;
                this.saveToStorage();
                this.updateCartUI();
                console.log(`✅ Nueva cantidad: ${item.quantity}`);
            } else {
                // Si cantidad es 1, preguntar si quiere eliminar
                const confirmRemove = confirm(`¿Eliminar "${item.nombre}" del carrito?`);
                if (confirmRemove) {
                    this.removeItem(productId);
                }
            }
        } else {
            console.error('❌ Producto no encontrado en carrito:', productId);
            console.log('🔍 IDs en carrito:', this.items.map(item => ({ id: item.id, nombre: item.nombre })));
        }
    }

    // Método para reconfigurar event listeners (especialmente útil para el botón del carrito)
    reconfigureEventListeners() {
        console.log('🔄 Reconfigurando event listeners del carrito...');
        
        // Reconfigurar botón del carrito
        const cartButton = document.getElementById('cartButton');
        if (cartButton) {
            try {
                // Remover event listener existente si lo hay
                const newCartButton = cartButton.cloneNode(true);
                cartButton.parentNode.replaceChild(newCartButton, cartButton);
                
                // Asegurar que el nuevo botón tenga el event listener
                const refreshedButton = document.getElementById('cartButton');
                if (refreshedButton) {
                    refreshedButton.addEventListener('click', () => this.toggleCart());
                    console.log('✅ Event listener del botón del carrito reconfigurado');
                } else {
                    console.log('⚠️ No se pudo reconfigurar el botón del carrito');
                }
            } catch (error) {
                console.log('⚠️ Error reconfigurando botón del carrito:', error.message);
                // Fallback: simplemente agregar el event listener
                cartButton.addEventListener('click', () => this.toggleCart());
            }
        } else {
            console.log('⚠️ Botón del carrito no encontrado durante reconfiguración');
        }
    }
}

// Función global para verificar el estado del carrito
window.checkCartStatus = function() {
    console.group('🔍 DIAGNÓSTICO DEL CARRITO');
    
    console.log('¿Existe window.shoppingCart?', !!window.shoppingCart);
    
    if (window.shoppingCart) {
        console.log('Tipo:', typeof window.shoppingCart);
        console.log('¿Es instancia de ShoppingCart?', window.shoppingCart instanceof ShoppingCart);
        console.log('¿Está inicializado?', window.shoppingCart.isInitialized);
        
        // Verificar funciones clave
        const functions = ['addItem', 'removeItem', 'increaseQuantity', 'decreaseQuantity', 'updateQuantity'];
        functions.forEach(funcName => {
            console.log(`¿Existe ${funcName}?`, typeof window.shoppingCart[funcName] === 'function');
        });
        
        // Estado actual
        if (typeof window.shoppingCart.getCartStatus === 'function') {
            console.log('Estado actual:', window.shoppingCart.getCartStatus());
        }
    } else {
        console.error('❌ window.shoppingCart no existe');
        console.log('Intentando crear nueva instancia...');
        try {
            window.shoppingCart = new ShoppingCart();
            console.log('✅ Nueva instancia creada');
        } catch (error) {
            console.error('❌ Error creando instancia:', error);
        }
    }
    
    console.groupEnd();
};

// Función para forzar reinicialización
window.forceInitCart = function() {
    console.log('🔄 Forzando reinicialización del carrito...');
    try {
        window.shoppingCart = new ShoppingCart();
        console.log('✅ Carrito reinicializado');
        return true;
    } catch (error) {
        console.error('❌ Error reinicializando:', error);
        return false;
    }
};

// Inicializar carrito cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado, inicializando carrito...');
    
    // Inicialización inmediata
    if (!window.shoppingCart) {
        window.shoppingCart = new ShoppingCart();
        console.log('🛒 Carrito creado inmediatamente');
    }
    
    // Verificación adicional después de un delay
    setTimeout(() => {
        if (!window.shoppingCart || typeof window.shoppingCart.increaseQuantity !== 'function') {
            console.warn('⚠️ Carrito no inicializado correctamente, reintentando...');
            window.shoppingCart = new ShoppingCart();
        }
        
        // Verificación final
        if (window.shoppingCart && typeof window.shoppingCart.increaseQuantity === 'function') {
            console.log('✅ Carrito inicializado correctamente con todas las funciones');
            console.log('🔧 Funciones disponibles:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.shoppingCart)).filter(name => typeof window.shoppingCart[name] === 'function'));
        } else {
            console.error('❌ Error crítico: carrito no se inicializó correctamente');
        }
    }, 1000);
});

// También inicializar cuando la ventana se carga completamente
window.addEventListener('load', function() {
    if (!window.shoppingCart) {
        console.log('🔄 Inicializando carrito en window.load...');
        window.shoppingCart = new ShoppingCart();
    }
});

// Hacer disponible globalmente
window.ShoppingCart = ShoppingCart;
