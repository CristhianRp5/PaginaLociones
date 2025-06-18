// Esperar a que el contenido de la navbar se cargue
// Función para inicializar la navegación
function initNavbar() {
    console.log('Inicializando navbar');
    
    function setupNavigation() {
        const menuToggle = document.querySelector('.navbar-menu-toggle');
        const sidebarMenu = document.querySelector('#sidebar-menu');
        const overlay = document.querySelector('.overlay');
        const closeButton = document.querySelector('.sidebar-close');
        const submenuToggles = document.querySelectorAll('.submenu-toggle');

        // Verificar que los elementos existen
        if (!menuToggle || !sidebarMenu || !overlay || !closeButton) {
            console.error('Elementos del menú no encontrados, reintentando...');
            setTimeout(setupNavigation, 100); // Reintentar si los elementos no están listos
            return;
        }

        console.log('Elementos del menú encontrados, configurando eventos');

        // Función para abrir el menú
        function openMenu() {
            console.log('Abriendo menú');
            sidebarMenu.classList.add('active');
            overlay.classList.add('active');
            menuToggle.classList.add('active');
            menuToggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        }

        // Función para cerrar el menú
        function closeMenu() {
            console.log('Cerrando menú');
            sidebarMenu.classList.remove('active');
            overlay.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }

        // Event listeners
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Click en menú toggle');
            if (sidebarMenu.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        closeButton.addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu);

        // Manejar submenús
        submenuToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const submenu = this.nextElementSibling;
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', !isExpanded);
                submenu.classList.toggle('active');
            });
        });

        // Cerrar con Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && sidebarMenu.classList.contains('active')) {
                closeMenu();
            }
        });

        console.log('Navegación inicializada correctamente');
    }

    // Iniciar la configuración
    setupNavigation();
}
