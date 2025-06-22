document.addEventListener('DOMContentLoaded', function() {
    // Variables para el carrito femenino y filtros
    let carritoMujeres = JSON.parse(localStorage.getItem('carritoMujeres')) || [];
    let filtrosActivos = {
        precioMin: 0,
        precioMax: 200,
        notas: []
    };
    
    // Elementos del DOM
    const productosGrid = document.querySelector('.productos-grid');
    const modal = document.getElementById('modal-vista-rapida');
    const cerrarModal = document.querySelector('.cerrar-modal');    // Datos de los productos
    const productos = [
        {            id: 'chanel-no5',
            nombre: 'Chanel N°5',
            imagen: '../IMAGENES/LOCIONES_PARA_ELLAS/CHANEL_N5.png',
            descripcion: 'El icónico perfume con notas de jazmín y rosa de mayo.',
            precio: 165.00,
            notas: {
                salida: 'Aldeídos, Neroli, Ylang-ylang',
                corazon: 'Rosa de Mayo, Jazmín, Lirio del Valle',
                fondo: 'Vainilla, Sándalo, Almizcle',
                categorias: ['florales', 'orientales']
            }
        },
        {            id: 'jadore-dior',
            nombre: "J'adore Dior",
            imagen: '../IMAGENES/LOCIONES_PARA_ELLAS/JADORE_DIOR.png',
            descripcion: 'Una fragancia floral luminosa y elegante.',
            precio: 155.00,
            notas: {
                salida: 'Pera, Melón, Magnolia',
                corazon: 'Rosa de Damasco, Jazmín, Orquídea',
                fondo: 'Almizcle Blanco, Vainilla, Madera de Amaranto',
                categorias: ['florales', 'dulces']
            }
        },
        {            id: 'la-vie-belle',
            nombre: 'La Vie Est Belle',
            imagen: '../IMAGENES/PARA_ELLAS.png', // Imagen temporal
            descripcion: 'La felicidad embotellada en una fragancia dulce y sofisticada.',
            precio: 145.00,
            notas: {
                salida: 'Grosella Negra, Pera',
                corazon: 'Iris, Jazmín, Flor de Azahar',
                fondo: 'Praliné, Vainilla, Pachulí',
                categorias: ['dulces', 'florales', 'orientales']
            }
        },
        {            id: 'good-girl',
            nombre: 'Good Girl',
            imagen: '../IMAGENES/LOCIONES_PARA_ELLAS/GOOD_GIRL_CH.png',
            descripcion: 'Una fragancia audaz que representa la dualidad femenina.',
            precio: 150.00,
            notas: {
                salida: 'Almendra, Café',
                corazon: 'Jazmín Sambac, Tuberosa',
                fondo: 'Cacao, Haba Tonka',
                categorias: ['orientales', 'dulces']
            }
        },
        {            id: 'miss-dior',
            nombre: 'Miss Dior',
            imagen: '../IMAGENES/LOCIONES_PARA_ELLAS/MISS_DIOR.png',
            descripcion: 'Una composición floral moderna y romántica.',
            precio: 160.00,
            notas: {
                salida: 'Bergamota de Calabria, Mandarina',
                corazon: 'Rosa de Grasse, Rosa de Damasco',
                fondo: 'Pachulí, Almizcle',
                categorias: ['florales', 'citricos']
            }
        }
    ];

    // Función para crear tarjeta de producto
    function crearTarjetaProducto(producto) {
        const article = document.createElement('article');
        article.className = 'producto-card';
        article.dataset.productoId = producto.id;
        
        article.innerHTML = `
            <div class="producto-imagen">
                <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy" style="opacity: 0; transition: opacity 0.3s ease;">
                <div class="producto-overlay">
                    <button class="btn-vista-rapida">
                        <i class="fas fa-search"></i> Vista Rápida
                    </button>
                </div>
            </div>
            <div class="producto-info">
                <h3>${producto.nombre}</h3>
                <p class="producto-descripcion">${producto.descripcion}</p>
                <p class="producto-precio">$${producto.precio.toFixed(2)}</p>
                <button class="btn-agregar">
                    <i class="fas fa-shopping-cart"></i> Añadir al Carrito
                </button>
            </div>
        `;

        // Manejar carga de imagen
        const img = article.querySelector('img');
        manejarCargaImagen(img);

        // Configurar eventos de la tarjeta
        article.querySelector('.btn-vista-rapida').addEventListener('click', () => mostrarModal(producto));
        article.querySelector('.btn-agregar').addEventListener('click', () => agregarAlCarrito(producto));

        return article;
    }

    function manejarCargaImagen(img) {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        img.addEventListener('error', function() {
            this.src = '../IMAGENES/PARA_ELLAS.png'; // Imagen de respaldo
        });
    }

    // Función para mostrar el modal
    function mostrarModal(producto) {
        const modalInfo = document.querySelector('.modal-producto-info');
        modalInfo.innerHTML = `
            <div class="modal-producto-detalle">
                <div class="modal-imagen">
                    <img src="${producto.imagen}" alt="${producto.nombre}" style="opacity: 0; transition: opacity 0.3s ease;">
                </div>
                <div class="modal-texto">
                    <h2>${producto.nombre}</h2>
                    <p class="modal-descripcion">${producto.descripcion}</p>
                    <p class="modal-precio">$${producto.precio.toFixed(2)}</p>
                    <div class="modal-notas">
                        <h4>Notas de Fragancia</h4>
                        <ul>
                            <li><strong>Salida:</strong> ${producto.notas.salida}</li>
                            <li><strong>Corazón:</strong> ${producto.notas.corazon}</li>
                            <li><strong>Fondo:</strong> ${producto.notas.fondo}</li>
                        </ul>
                    </div>
                    <button class="btn-agregar-modal">
                        <i class="fas fa-shopping-cart"></i> Añadir al Carrito
                    </button>
                </div>
            </div>
        `;

        // Manejar carga de imagen en el modal
        const modalImg = modalInfo.querySelector('img');
        manejarCargaImagen(modalImg);

        const btnAgregarModal = modalInfo.querySelector('.btn-agregar-modal');
        btnAgregarModal.addEventListener('click', () => {
            agregarAlCarrito(producto);
            cerrarModalVista();
        });

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevenir scroll
    }

    // Función para cerrar el modal
    function cerrarModalVista() {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restaurar scroll
    }

    // Función para agregar al carrito
    function agregarAlCarrito(producto) {
        const productoCarrito = {
            ...producto,
            cantidad: 1,
            fecha: new Date().toISOString()
        };

        carritoMujeres.push(productoCarrito);
        localStorage.setItem('carritoMujeres', JSON.stringify(carritoMujeres));
        mostrarNotificacion(`${producto.nombre} añadido al carrito`);
        actualizarContadorCarrito();
    }

    // Función para actualizar el contador del carrito
    function actualizarContadorCarrito() {
        const contador = document.getElementById('carrito-contador');
        if (contador) {
            contador.textContent = carritoMujeres.length;
        }
    }

    // Función para mostrar notificaciones con estilo femenino
    function mostrarNotificacion(mensaje) {
        const notificacion = document.createElement('div');
        notificacion.className = 'notificacion';
        notificacion.innerHTML = `
            <i class="fas fa-heart"></i>
            <span>${mensaje}</span>
        `;
        
        Object.assign(notificacion.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#d53f8c',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '5px',
            zIndex: '1000',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 12px rgba(213,63,140,0.2)',
            animation: 'slideIn 0.5s ease-out'
        });
        
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.style.animation = 'slideOut 0.5s ease-out';
            setTimeout(() => {
                notificacion.remove();
            }, 500);
        }, 3000);
    }

    // Funciones de filtrado
    function initFiltros() {
        const filtrosToggle = document.querySelector('.filtros-toggle');
        const filtrosPanel = document.querySelector('.filtros-panel');
        const precioMin = document.getElementById('precio-min');
        const precioMax = document.getElementById('precio-max');
        const precioMinValor = document.getElementById('precio-min-valor');
        const precioMaxValor = document.getElementById('precio-max-valor');
        const notasCheckboxes = document.querySelectorAll('.notas-filtro input');
        const limpiarFiltros = document.querySelector('.limpiar-filtros');

        // Toggle panel de filtros
        filtrosToggle.addEventListener('click', () => {
            filtrosPanel.classList.toggle('active');
        });

        // Eventos de rango de precio
        precioMin.addEventListener('input', (e) => {
            const valor = e.target.value;
            precioMinValor.textContent = valor;
            filtrosActivos.precioMin = parseInt(valor);
            aplicarFiltros();
        });

        precioMax.addEventListener('input', (e) => {
            const valor = e.target.value;
            precioMaxValor.textContent = valor;
            filtrosActivos.precioMax = parseInt(valor);
            aplicarFiltros();
        });

        // Eventos de notas de fragancia
        notasCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    filtrosActivos.notas.push(e.target.value);
                } else {
                    filtrosActivos.notas = filtrosActivos.notas.filter(nota => nota !== e.target.value);
                }
                aplicarFiltros();
            });
        });

        // Limpiar filtros
        limpiarFiltros.addEventListener('click', () => {
            precioMin.value = 0;
            precioMax.value = 200;
            precioMinValor.textContent = '0';
            precioMaxValor.textContent = '200';
            notasCheckboxes.forEach(checkbox => checkbox.checked = false);
            
            filtrosActivos = {
                precioMin: 0,
                precioMax: 200,
                notas: []
            };
            
            aplicarFiltros();
        });
    }

    function aplicarFiltros() {
        const cards = document.querySelectorAll('.producto-card');
        
        cards.forEach(card => {
            const producto = productos.find(p => p.id === card.dataset.productoId);
            const cumplePrecio = producto.precio >= filtrosActivos.precioMin && 
                               producto.precio <= filtrosActivos.precioMax;
            
            const cumpleNotas = filtrosActivos.notas.length === 0 || 
                               filtrosActivos.notas.some(nota => 
                                   producto.notas.categorias.includes(nota)
                               );
            
            if (cumplePrecio && cumpleNotas) {
                card.style.display = '';
                card.style.animation = 'fadeIn 0.3s ease forwards';
            } else {
                card.style.display = 'none';
                card.style.animation = 'fadeOut 0.3s ease forwards';
            }
        });
    }    // Event Listeners
    if (cerrarModal) {
        cerrarModal.addEventListener('click', cerrarModalVista);
    }
    
    if (modal) {
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                cerrarModalVista();
            }
        });
        
        // Cerrar con la tecla ESC
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                cerrarModalVista();
            }
        });
    }

    // Inicialización
    productos.forEach(producto => {
        productosGrid.appendChild(crearTarjetaProducto(producto));
    });
    actualizarContadorCarrito();
    initFiltros();

    // Estilos para animaciones
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});
