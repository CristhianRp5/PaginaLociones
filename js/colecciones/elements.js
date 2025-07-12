document.addEventListener('DOMContentLoaded', function() {
    // Datos de las fragancias
    const fragranceDetails = {
        desert: {
            title: "BLEU DESIERTO",
            subtitle: "La esencia del desierto dorado",
            description: `Una fragancia que captura la misteriosa esencia del desierto al atardecer, 
                        donde las dunas doradas se encuentran con el cielo infinito. 
                        Un perfume que evoca la libertad y el misterio del desierto.`,
            notes: {
                top: ["Arena cálida", "Cardamomo", "Azafrán"],
                heart: ["Rosa del desierto", "Ámbar dorado", "Incienso"],
                base: ["Madera de oud", "Vainilla del desierto", "Almizcle"]
            }
        },
        ice: {
            title: "SILENCIO BLANCO",
            subtitle: "El lujo contenido en la quietud del hielo",
            description: `Una interpretación moderna de la pureza glacial, 
                        donde el frío se encuentra con la elegancia. 
                        Un aroma que evoca la majestuosidad de los glaciares eternos.`,
            notes: {
                top: ["Hielo cristalino", "Bergamota helada", "Enebro"],
                heart: ["Iris ártico", "Violeta nevada", "Cedro blanco"],
                base: ["Ámbar blanco", "Almizcle helado", "Musgo glacial"]
            }
        },
        ocean: {
            title: "SEDUCTOR COMO EL MAR",
            subtitle: "La fuerza de las profundidades",
            description: `Un viaje a las profundidades del océano, 
                        donde los misterios marinos se transforman en una fragancia seductora. 
                        La esencia pura del poder del mar.`,
            notes: {
                top: ["Brisa marina", "Sal de mar", "Cítricos acuáticos"],
                heart: ["Algas marinas", "Neroli", "Jazmin marino"],
                base: ["Ámbar marino", "Musgo de mar", "Madera a la deriva"]
            }
        }
    };

    // Manejador para los botones de explorar
    const exploreButtons = document.querySelectorAll('.explore-btn');
    const modal = document.getElementById('fragranceModal');
    const closeModal = document.querySelector('.close-modal');

    // Función para crear el contenido del modal
    function createModalContent(fragrance) {
        const data = fragranceDetails[fragrance];
        const modalHeader = document.querySelector('.modal-header');
        const modalBody = document.querySelector('.modal-body');

        modalHeader.innerHTML = `
            <h2>${data.title}</h2>
            <p>${data.subtitle}</p>
        `;

        modalBody.innerHTML = `
            <div class="fragrance-description">
                <p>${data.description}</p>
            </div>
            <div class="fragrance-notes">
                <div class="note-section">
                    <h3>Notas de Salida</h3>
                    <ul>${data.notes.top.map(note => `<li>${note}</li>`).join('')}</ul>
                </div>
                <div class="note-section">
                    <h3>Notas de Corazón</h3>
                    <ul>${data.notes.heart.map(note => `<li>${note}</li>`).join('')}</ul>
                </div>
                <div class="note-section">
                    <h3>Notas de Fondo</h3>
                    <ul>${data.notes.base.map(note => `<li>${note}</li>`).join('')}</ul>
                </div>
            </div>
        `;
    }

    // Event listeners para los botones
    exploreButtons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.getAttribute('data-section');
            createModalContent(section);
            modal.style.display = 'flex';
            modal.classList.add('fade-in');
        });
    });

    // Cerrar modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Efecto de parallax en scroll
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        document.querySelectorAll('.fragrance-media video').forEach(video => {
            const speed = 0.5;
            const yPos = -(scrolled * speed);
            video.style.transform = `translateY(${yPos}px)`;
        });
    });

    // Reproducción de videos al entrar en viewport
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target.querySelector('video');
            if (entry.isIntersecting) {
                video.play();
            } else {
                video.pause();
            }
        });
    }, options);

    document.querySelectorAll('.hero-section, .fragrance-section').forEach(section => {
        observer.observe(section);
    });
});
