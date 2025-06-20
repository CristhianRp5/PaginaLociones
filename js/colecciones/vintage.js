// Datos de los productos vintage
const vintageProducts = [
    {
        name: "Chanel N°5 (1921)",
        description: "El legendario perfume que revolucionó la industria de la perfumería.",
        image: "../../IMAGENES/vintage/chanel-5.jpg",
        year: 1921,
        notes: ["Aldeídos", "Rosa de Mayo", "Jazmín", "Sándalo"]
    },
    {
        name: "Shalimar Guerlain (1925)",
        description: "Una obra maestra oriental que cuenta una historia de amor eterno.",
        image: "../../IMAGENES/vintage/shalimar.jpg",
        year: 1925,
        notes: ["Bergamota", "Iris", "Vainilla", "Opoponax"]
    },
    {
        name: "Joy Jean Patou (1930)",
        description: "Conocido como 'el perfume más caro del mundo' en su época.",
        image: "../../IMAGENES/vintage/joy.jpg",
        year: 1930,
        notes: ["Rosa", "Jazmín", "Ylang-ylang", "Almizcle"]
    }
];

// Datos de la línea de tiempo
const timelineEvents = [
    {
        year: 1921,
        title: "La Revolución de los Aldeídos",
        description: "Chanel N°5 marca el inicio de la perfumería moderna."
    },
    {
        year: 1925,
        title: "El Nacimiento del Oriental",
        description: "Shalimar establece las bases de la familia oriental en perfumería."
    },
    {
        year: 1930,
        title: "La Era del Lujo",
        description: "Joy demuestra que el lujo puede sobrevivir incluso en tiempos de crisis."
    }
];

document.addEventListener('DOMContentLoaded', function() {
    // Cargar productos
    const productsContainer = document.querySelector('.vintage-products');
    
    if (productsContainer) {
        vintageProducts.forEach(product => {
            const productElement = createProductElement(product);
            productsContainer.appendChild(productElement);
        });
    }

    // Cargar línea de tiempo
    const timelineContainer = document.querySelector('.timeline');
    
    if (timelineContainer) {
        timelineEvents.forEach(event => {
            const timelineItem = createTimelineElement(event);
            timelineContainer.appendChild(timelineItem);
        });
    }

    // Añadir efectos de scroll
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        
        // Efecto parallax en el hero
        const vintageHero = document.querySelector('.vintage-hero');
        if (vintageHero) {
            vintageHero.style.backgroundPositionY = scrollPosition * 0.5 + 'px';
        }

        // Animación de elementos al hacer scroll
        const animateElements = document.querySelectorAll('.vintage-product, .timeline-item');
        animateElements.forEach(element => {
            if (isElementInViewport(element)) {
                element.classList.add('animate');
            }
        });
    });
});

// Función para crear elemento de producto
function createProductElement(product) {
    const div = document.createElement('div');
    div.className = 'vintage-product';
    
    div.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p class="product-year">Año: ${product.year}</p>
            <div class="product-notes">
                <p>Notas principales: ${product.notes.join(', ')}</p>
            </div>
        </div>
    `;

    return div;
}

// Función para crear elemento de línea de tiempo
function createTimelineElement(event) {
    const div = document.createElement('div');
    div.className = 'timeline-item';
    
    div.innerHTML = `
        <div class="timeline-content">
            <h3>${event.year}</h3>
            <h4>${event.title}</h4>
            <p>${event.description}</p>
        </div>
    `;

    return div;
}

// Función para verificar si un elemento está en el viewport
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
