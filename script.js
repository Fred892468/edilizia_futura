// Global object to store carousel states
const carouselStates = {}; // Oggetto per memorizzare lo stato di ciascun carosello

// Trova il contenitore del carosello più vicino all'elemento fornito
function getCarouselContainer(element) {
    return element.closest('.carousel-container');
}

// Ottiene l'ID del contenitore del carosello. Se non esiste, ne genera uno univoco.
function getCarouselId(container) {
    if (!container.id) {
        // Genera un ID univoco se non presente
        container.id = 'carousel-' + Math.random().toString(36).substr(2, 9);
    }
    return container.id;
}

// Inizializza lo stato del carosello specificato
function initializeCarouselState(carouselId, slides, indicators) {
    if (!carouselStates[carouselId]) {
        carouselStates[carouselId] = {
            currentSlideIndex: 0, // Indice della slide corrente
            slides: slides, // Array di elementi slide
            indicators: indicators // Array di elementi indicatori
        };
    }
}

// Mostra la slide specificata per l'ID del carosello dato
function showSlide(index, carouselId) {
    const state = carouselStates[carouselId];
    if (!state || !state.slides || !state.indicators) return; // Esce se lo stato non è valido
    
    // Nasconde tutte le slide e disattiva tutti gli indicatori
    state.slides.forEach(slide => slide.classList.remove('active'));
    state.indicators.forEach(indicator => indicator.classList.remove('active'));
    
    // Mostra la slide corrente e attiva l'indicatore corrispondente
    if (state.slides[index]) {
        state.slides[index].classList.add('active');
        state.indicators[index].classList.add('active');
    }
}

// Cambia la slide visualizzata in base alla direzione (avanti/indietro)
function changeSlide(direction, element) {
    const container = getCarouselContainer(element || event.target); // Ottiene il contenitore del carosello
    const carouselId = getCarouselId(container); // Ottiene l'ID del carosello
    const state = carouselStates[carouselId]; // Ottiene lo stato del carosello
    
    if (!state || !state.slides) return; // Esce se lo stato o le slide non sono validi
    
    state.currentSlideIndex += direction; // Aggiorna l'indice della slide corrente
    
    // Gestisce il loop del carosello
    if (state.currentSlideIndex >= state.slides.length) {
        state.currentSlideIndex = 0; // Torna alla prima slide
    } else if (state.currentSlideIndex < 0) {
        state.currentSlideIndex = state.slides.length - 1; // Va all'ultima slide
    }
    
    showSlide(state.currentSlideIndex, carouselId); // Mostra la nuova slide
}

// Imposta la slide corrente in base all'indice fornito
function currentSlide(index, element) {
    const container = getCarouselContainer(element || event.target); // Ottiene il contenitore del carosello
    const carouselId = getCarouselId(container); // Ottiene l'ID del carosello
    const state = carouselStates[carouselId]; // Ottiene lo stato del carosello
    
    if (!state) return; // Esce se lo stato non è valido
    
    state.currentSlideIndex = index - 1; // Imposta l'indice della slide corrente (l'indice è 0-based)
    showSlide(state.currentSlideIndex, carouselId); // Mostra la slide specificata
}

// Inizializza tutti i caroselli presenti nella pagina
function initializeCarousel() {
    const carouselContainers = document.querySelectorAll('.carousel-container'); // Seleziona tutti i contenitori di carosello
    
    carouselContainers.forEach(container => {
        const carouselId = getCarouselId(container); // Ottiene l'ID del carosello
        const slides = container.querySelectorAll('.carousel-slide'); // Seleziona tutte le slide del carosello
        const indicators = container.querySelectorAll('.indicator'); // Seleziona tutti gli indicatori del carosello
        
        initializeCarouselState(carouselId, slides, indicators); // Inizializza lo stato del carosello
        
        // Mostra la prima slide per impostazione predefinita
        if (slides.length > 0) {
            showSlide(0, carouselId);
        }
    });
    
    // Riproduzione automatica disabilitata - il carosello si muove solo al clic
 }

// Funzioni modali per l'ingrandimento dell'immagine
let currentZoom = 1; // Livello di zoom corrente
let isDragging = false; // Flag per indicare se l'immagine è in fase di trascinamento
let startX, startY, translateX = 0, translateY = 0; // Coordinate per il trascinamento
let hasDragged = false; // Flag per indicare se è avvenuto un trascinamento
let dragStartX = 0; // Posizione X iniziale del trascinamento
let dragStartY = 0; // Posizione Y iniziale del trascinamento
let carouselImages = []; // Array delle immagini del carosello corrente
let currentImageIndex = 0; // Indice dell'immagine corrente nel carosello
let currentCarousel = null; // Riferimento al carosello corrente

// Inizializza l'array delle immagini del carosello
function initializeCarouselImages(clickedImage) {
    // Trova il contenitore del carosello che contiene l'immagine cliccata
    currentCarousel = clickedImage.closest('.carousel-container');
    if (currentCarousel) {
        const images = currentCarousel.querySelectorAll('img[onclick*="openModal"]'); // Seleziona tutte le immagini del carosello che aprono il modale
        carouselImages = Array.from(images).map(img => ({ // Crea un array di oggetti immagine
            src: img.src,
            alt: img.alt
        }));
    } else {
        // Fallback: se non è in un carosello, usa solo l'immagine singola
        carouselImages = [{
            src: clickedImage.src,
            alt: clickedImage.alt
        }];
    }
}

// Apre il modale con l'immagine specificata
function openModal(imageSrc, imageAlt) {
    const modal = document.getElementById('imageModal'); // Ottiene l'elemento modale
    const modalImage = document.getElementById('modalImage'); // Ottiene l'elemento immagine del modale
    const modalCaption = document.getElementById('modalCaption'); // Ottiene l'elemento didascalia del modale
    
    // Trova l'elemento immagine cliccato
    const clickedImage = document.querySelector(`img[src="${imageSrc}"]`);
    
    // Inizializza l'array delle immagini per il carosello corrente
    initializeCarouselImages(clickedImage);
    
    // Trova l'indice dell'immagine corrente all'interno del carosello
    currentImageIndex = carouselImages.findIndex(img => img.src === imageSrc);
    
    modal.style.display = 'block'; // Mostra il modale
    modalImage.src = imageSrc; // Imposta la sorgente dell'immagine del modale
    modalImage.alt = imageAlt; // Imposta il testo alternativo dell'immagine del modale
    modalCaption.textContent = imageAlt; // Imposta la didascalia del modale
    
    // Resetta zoom e posizione
    currentZoom = 1;
    translateX = 0;
    translateY = 0;
    updateImageTransform(); // Aggiorna la trasformazione dell'immagine
    updateZoomInfo(); // Aggiorna le informazioni sullo zoom
    
    // Aggiorna la visibilità dei pulsanti di navigazione
    updateNavigationButtons();
    
    // Impedisce lo scorrimento del corpo quando il modale è aperto
    document.body.style.overflow = 'hidden';
}

// Mostra l'immagine successiva nel carosello del modale
function nextImage() {
    if (currentImageIndex < carouselImages.length - 1) {
        currentImageIndex++;
        loadCurrentImage(); // Carica l'immagine corrente
    }
}

// Mostra l'immagine precedente nel carosello del modale
function prevImage() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        loadCurrentImage(); // Carica l'immagine corrente
    }
}

// Carica l'immagine corrente nel modale
function loadCurrentImage() {
    const modalImage = document.getElementById('modalImage'); // Ottiene l'elemento immagine del modale
    const modalCaption = document.getElementById('modalCaption'); // Ottiene l'elemento didascalia del modale
    const currentImage = carouselImages[currentImageIndex]; // Ottiene l'immagine corrente dall'array
    
    modalImage.src = currentImage.src; // Imposta la sorgente dell'immagine
    modalImage.alt = currentImage.alt; // Imposta il testo alternativo
    modalCaption.textContent = currentImage.alt; // Imposta la didascalia
    
    // Resetta zoom e posizione
    currentZoom = 1;
    translateX = 0;
    translateY = 0;
    updateImageTransform(); // Aggiorna la trasformazione dell'immagine
    updateZoomInfo(); // Aggiorna le informazioni sullo zoom
    
    // Aggiorna i pulsanti di navigazione
    updateNavigationButtons();
}

// Aggiorna la visibilità dei pulsanti di navigazione del modale (precedente/successivo)
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn'); // Ottiene il pulsante precedente
    const nextBtn = document.getElementById('nextBtn'); // Ottiene il pulsante successivo
    
    if (prevBtn) {
        prevBtn.style.display = currentImageIndex > 0 ? 'block' : 'none'; // Mostra/nasconde il pulsante precedente
    }
    if (nextBtn) {
        nextBtn.style.display = currentImageIndex < carouselImages.length - 1 ? 'block' : 'none'; // Mostra/nasconde il pulsante successivo
    }
}

// Chiude il modale dell'immagine
function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
    
    // Reset zoom and position
    currentZoom = 1;
    translateX = 0;
    translateY = 0;
    
    // Restore body scrolling
    document.body.style.overflow = 'auto';
}

function zoomIn() {
    currentZoom = Math.min(currentZoom * 1.2, 5);
    updateImageTransform();
    updateZoomInfo();
}

function zoomOut() {
    currentZoom = Math.max(currentZoom / 1.2, 0.5);
    updateImageTransform();
    updateZoomInfo();
}

function resetZoom() {
    currentZoom = 1;
    translateX = 0;
    translateY = 0;
    updateImageTransform();
    updateZoomInfo();
}

function toggleZoom(event) {
    // Prevent zoom toggle if user just finished dragging
    if (hasDragged) {
        hasDragged = false;
        return;
    }
    
    if (currentZoom === 1) {
        currentZoom = 2;
    } else {
        currentZoom = 1;
        translateX = 0;
        translateY = 0;
    }
    updateImageTransform();
    updateZoomInfo();
}

function updateImageTransform() {
    const modalImage = document.getElementById('modalImage');
    modalImage.style.transform = `scale(${currentZoom}) translate(${translateX}px, ${translateY}px)`;
    
    // Update cursor
    if (currentZoom > 1) {
        modalImage.classList.add('zoomed');
        modalImage.style.cursor = isDragging ? 'grabbing' : 'grab';
    } else {
        modalImage.classList.remove('zoomed');
        modalImage.style.cursor = 'zoom-in';
    }
}

function updateZoomInfo() {
    const zoomInfo = document.getElementById('zoomInfo');
    zoomInfo.textContent = Math.round(currentZoom * 100) + '%';
}

// Close modal when clicking outside the image
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Close modal with Escape key and navigate with arrow keys
    document.addEventListener('keydown', function(event) {
        if (modal.style.display === 'block') {
            switch(event.key) {
                case 'ArrowLeft':
                    prevImage();
                    break;
                case 'ArrowRight':
                    nextImage();
                    break;
                case 'Escape':
                    closeModal();
                    break;
            }
        }
    });
    
    // Original keydown event for other functionality
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
    
    // Zoom with mouse wheel
    modalImage.addEventListener('wheel', function(event) {
        event.preventDefault();
        
        if (event.deltaY < 0) {
            zoomIn();
        } else {
            zoomOut();
        }
    });
    
    // Drag functionality for zoomed images
    modalImage.addEventListener('mousedown', function(event) {
        if (currentZoom > 1) {
            isDragging = true;
            hasDragged = false;
            startX = event.clientX - translateX;
            startY = event.clientY - translateY;
            dragStartX = event.clientX;
            dragStartY = event.clientY;
            modalImage.style.cursor = 'grabbing';
            event.preventDefault();
        }
    });
    
    document.addEventListener('mousemove', function(event) {
        if (isDragging && currentZoom > 1) {
            const deltaX = Math.abs(event.clientX - dragStartX);
            const deltaY = Math.abs(event.clientY - dragStartY);
            
            // Consider it a drag if mouse moved more than 5 pixels
            if (deltaX > 5 || deltaY > 5) {
                hasDragged = true;
            }
            
            translateX = event.clientX - startX;
            translateY = event.clientY - startY;
            updateImageTransform();
        }
    });
    
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            const modalImage = document.getElementById('modalImage');
            if (currentZoom > 1) {
                modalImage.style.cursor = 'grab';
            } else {
                modalImage.style.cursor = 'zoom-in';
            }
            
            // Reset hasDragged flag after a short delay to allow click event to process
            if (hasDragged) {
                setTimeout(() => {
                    hasDragged = false;
                }, 10);
            }
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    // Enhanced Hamburger menu toggle with improved mobile experience
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const body = document.body;

if (hamburger && navMenu) {
    // Add index to nav items for staggered animation
    const navItems = navMenu.querySelectorAll('li');
    navItems.forEach((item, index) => {
        item.style.setProperty('--i', index);
    });
    
    hamburger.addEventListener('click', () => {
        const isActive = hamburger.classList.contains('active');
        
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (!isActive) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            body.style.overflow = '';
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            body.style.overflow = '';
        }
    });
    
    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            body.style.overflow = '';
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            body.style.overflow = '';
        }
    });
}

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Initialize carousel when DOM is loaded
    initializeCarousel();

    // Active link highlighting on scroll (se presente nel CSS)
    const sections = document.querySelectorAll('section[id]');
    const navLi = document.querySelectorAll('.nav-menu li a'); // Assumendo che i link attivi abbiano una classe specifica

    if (sections.length > 0 && navLi.length > 0) {
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (pageYOffset >= sectionTop - 70) { // 70 è un'altezza approssimativa dell'header
                    current = section.getAttribute('id');
                }
            });

            navLi.forEach(li => {
                li.classList.remove('active-link'); // Rimuovi la classe da tutti i link
                if (li.getAttribute('href').includes(current)) {
                    li.classList.add('active-link'); // Aggiungi la classe al link corrente
                }
            });
        });
    }

    // Mappa OpenStreetMap - Non richiede configurazione JavaScript
    // L'interattività è gestita completamente da CSS

    // Funzione per validare l'email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Funzione per validare il nome (solo lettere e spazi)
    function isValidName(name) {
        const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
        return nameRegex.test(name) && name.trim().length >= 2;
    }
    
    // Funzione per validare il telefono (numeri, spazi, +, -, ())
    function isValidPhone(phone) {
        if (!phone || phone.trim() === '') return true; // Campo opzionale
        const phoneRegex = /^[\d\s\+\-\(\)]+$/;
        return phoneRegex.test(phone) && phone.replace(/[^\d]/g, '').length >= 8;
    }
    
    // Gestione form di contatto
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Raccogli i dati del form
            const formData = new FormData(contactForm);
            const name = formData.get('name').trim();
            const phone = formData.get('phone').trim();
            const service = formData.get('service');
            const message = formData.get('message').trim();
            
            // Validazione dei campi
            if (!isValidName(name)) {
                alert('Per favore inserisci un nome valido (almeno 2 caratteri, solo lettere).');
                return;
            }
            
            if (!isValidPhone(phone)) {
                alert('Per favore inserisci un numero di telefono valido (almeno 8 cifre).');
                return;
            }
            
            if (!service) {
                alert('Per favore seleziona un servizio.');
                return;
            }
            
            if (message.length < 10) {
                alert('Per favore inserisci una descrizione più dettagliata del progetto (almeno 10 caratteri).');
                return;
            }
            
            // Crea il corpo dell'email
            const emailBody = `
Nuova richiesta di preventivo da ${name}

Telefono: ${phone || 'Non fornito'}
Servizio richiesto: ${service}

Messaggio:
${message}
            `;
            
            // Crea il link per Gmail
            const recipientEmail = 'cartaalexa03@gmail.com';
            const emailSubject = `Richiesta Preventivo - ${service}`;
            const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
            
            // Apri Gmail in una nuova scheda
            window.open(gmailLink, '_blank');
            
            // Mostra messaggio di conferma
            alert('Si aprirà una nuova scheda del browser per inviare la richiesta tramite Gmail. Grazie!');
            
            // Reset del form
            contactForm.reset();
        });
    }

    // Portfolio Pagination
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const itemsPerPage = 6;
    let currentlyVisible = itemsPerPage;

    // Initially hide all items except the first 6
    function initializePortfolio() {
        portfolioItems.forEach((item, index) => {
            if (index >= itemsPerPage) {
                item.style.display = 'none';
            }
        });
        
        // Hide button if there are 6 or fewer items
        if (portfolioItems.length <= itemsPerPage) {
            loadMoreBtn.style.display = 'none';
        }
    }

    // Update button visibility and text
    function updateButtons() {
        const btnText = loadMoreBtn.querySelector('span');
        const btnIcon = loadMoreBtn.querySelector('i');
        
        // Check if there are more items to show
        const hasMoreItems = currentlyVisible < portfolioItems.length;
        const canShowLess = currentlyVisible > itemsPerPage;
        
        if (hasMoreItems) {
            // Show "Mostra altri lavori" button
            btnText.textContent = 'Mostra altri lavori';
            btnIcon.className = 'fas fa-chevron-down';
            loadMoreBtn.style.display = 'inline-flex';
            loadMoreBtn.onclick = loadMoreItems;
        } else if (canShowLess) {
            // Show "Mostra meno" button
            btnText.textContent = 'Mostra meno';
            btnIcon.className = 'fas fa-chevron-up';
            loadMoreBtn.style.display = 'inline-flex';
            loadMoreBtn.onclick = showLessItems;
        } else {
            // Hide button if showing exactly 6 items and no more available
            loadMoreBtn.style.display = 'none';
        }
    }

    // Load more items function - shows next group of 6
    function loadMoreItems() {
        const nextVisible = Math.min(currentlyVisible + itemsPerPage, portfolioItems.length);
        
        // Show items up to nextVisible
        portfolioItems.forEach((item, index) => {
            if (index < nextVisible) {
                item.style.display = 'block';
            }
        });
        
        currentlyVisible = nextVisible;
        updateButtons();
    }

    // Show less items function - goes back to showing only first 6
    function showLessItems() {
        // Hide all items except first 6
        portfolioItems.forEach((item, index) => {
            if (index >= itemsPerPage) {
                item.style.display = 'none';
            }
        });
        
        currentlyVisible = itemsPerPage;
        
        // Scroll to portfolio section when showing less
        const portfolioSection = document.getElementById('portfolio');
        if (portfolioSection) {
            portfolioSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        updateButtons();
    }

    // Initialize portfolio pagination
    if (portfolioItems.length > 0 && loadMoreBtn) {
        initializePortfolio();
        updateButtons();
    }

});