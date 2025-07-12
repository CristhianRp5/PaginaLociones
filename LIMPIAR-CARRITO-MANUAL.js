// COMANDO DE LIMPIEZA MANUAL
// Ejecutar este código en la consola del navegador para eliminar productos de prueba:

// Opción 1: Limpiar automáticamente usando la función
if (window.limpiarProductosPrueba) {
    window.limpiarProductosPrueba();
} else {
    console.log('Función de limpieza no disponible');
}

// Opción 2: Limpiar manualmente
if (window.shoppingCart && window.shoppingCart.items) {
    const itemsOriginales = window.shoppingCart.items.length;
    
    window.shoppingCart.items = window.shoppingCart.items.filter(item => {
        const esProductoPrueba = 
            item.id.includes('test') ||
            item.id.includes('verificacion') ||
            item.nombre.includes('Test') ||
            item.nombre.includes('Verificación') ||
            item.marca === 'Test';
        
        return !esProductoPrueba;
    });
    
    window.shoppingCart.saveToStorage();
    window.shoppingCart.updateCartUI();
    
    const eliminados = itemsOriginales - window.shoppingCart.items.length;
    console.log(`Eliminados ${eliminados} productos de prueba`);
}

// Opción 3: Vaciar completamente el carrito
// window.shoppingCart.clearCart();
