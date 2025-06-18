// Archivo JavaScript para la página de productos
document.addEventListener('DOMContentLoaded', function() {
    // Función para manejar el efecto parallax en las imágenes
    function handleParallax() {
        const categoryItems = document.querySelectorAll('.category-item');
        
        categoryItems.forEach(item => {
            const image = item.querySelector('.image-placeholder');
            const content = item.querySelector('.category-content');
            
            item.addEventListener('mousemove', (e) => {
                const rect = item.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const xPercent = (x / rect.width - 0.5) * 20;
                const yPercent = (y / rect.height - 0.5) * 20;
                
                image.style.transform = `translate(${xPercent}px, ${yPercent}px) scale(1.1)`;
                content.style.transform = `translate(${-xPercent/2}px, ${-yPercent/2}px)`;
            });
            
            item.addEventListener('mouseleave', () => {
                image.style.transform = '';
                content.style.transform = '';
            });
        });
    }

    // Inicializar efectos
    handleParallax();

    // Función para manejar la carga suave de imágenes
    function handleImageLoad() {
        const images = document.querySelectorAll('.image-placeholder');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        images.forEach(image => observer.observe(image));
    }

    // Inicializar observador de imágenes
    handleImageLoad();
});
