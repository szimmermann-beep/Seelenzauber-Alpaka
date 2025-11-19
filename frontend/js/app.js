// ============================================
// Seelenzauber Alpaka - Airbnb-Style Frontend
// ============================================

const API_URL = 'https://seelenzauber-alpaka.de/api.php';

// State
let currentGuests = 2;
let selectedDate = null;
let selectedTime = null;
let galleryImages = [];
let currentImageIndex = 0;
let allReviews = [];
let termine = [];

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initSmoothScroll();
    loadAlpakas();
    loadTermine();
    loadReviews();
    initContactForm();
});

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const menu = document.getElementById('nav-menu');
    
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('active');
            });
        });
    }
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// ALPAKAS LADEN
// ============================================
async function loadAlpakas() {
    try {
        const response = await fetch(`${API_URL}?action=alpakas`);
        const data = await response.json();
        
        const container = document.getElementById('alpakas-container');
        
        if (data.success && data.data.length > 0) {
            container.innerHTML = data.data.map(alpaka => {
                const rating = alpaka.durchschnittliche_bewertung || 0;
                const reviewCount = alpaka.anzahl_bewertungen || 0;
                
                return `
                    <div class="alpaka-card" onclick="showAlpakaDetail(${alpaka.id})">
                        <div class="alpaka-image"></div>
                        <div class="alpaka-info">
                            <h3 class="alpaka-name">${alpaka.name}</h3>
                            <p class="alpaka-details">${alpaka.farbe} · ${alpaka.geschlecht}</p>
                            <p class="alpaka-details">${alpaka.charakter}</p>
                            ${rating > 0 ? `
                                <div class="alpaka-rating">
                                    <svg viewBox="0 0 16 16" style="height:14px;width:14px;fill:currentColor">
                                        <path d="M8 .5l2.385 4.835 5.338.777-3.861 3.762.911 5.311L8 13.257l-4.773 2.928.911-5.311L.277 6.112l5.338-.777L8 .5z"></path>
                                    </svg>
                                    ${rating.toFixed(2)} ${reviewCount > 0 ? `(${reviewCount})` : ''}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            container.innerHTML = '<p class="loading">Keine Alpakas gefunden.</p>';
        }
    } catch (error) {
        console.error('Fehler beim Laden der Alpakas:', error);
        document.getElementById('alpakas-container').innerHTML = 
            '<p class="loading">Fehler beim Laden der Alpakas.</p>';
    }
}

// ============================================
// TERMINE LADEN
// ============================================
async function loadTermine() {
    try {
        const response = await fetch(`${API_URL}?action=termine`);
        const data = await response.json();
        
        const container = document.getElementById('termine-container');
        
        if (data.success && data.data.length > 0) {
            termine = data.data;
            
            // Update booking price with first termin
            if (termine.length > 0) {
                updateBookingPrice(termine[0].preis);
            }
            
            container.innerHTML = termine.map(termin => `
                <div class="termin-card">
                    <div class="termin-image"></div>
                    <div class="termin-content">
                        <h3 class="termin-title">${termin.titel}</h3>
                        <div class="termin-meta">
                            <span>📅 ${formatDate(termin.datum)}</span>
                            <span>🕐 ${termin.uhrzeit_von.substring(0,5)} Uhr</span>
                        </div>
                        <p class="termin-description">${termin.beschreibung}</p>
                        <div class="termin-footer">
                            <div class="termin-price-tag">
                                ${termin.preis} €
                                <span>pro Person</span>
                            </div>
                            <button class="btn-book" onclick="quickBook(${termin.id}, '${termin.titel}', ${termin.preis})">
                                Buchen
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="loading">Keine Termine verfügbar.</p>';
        }
    } catch (error) {
        console.error('Fehler beim Laden der Termine:', error);
        document.getElementById('termine-container').innerHTML = 
            '<p class="loading">Fehler beim Laden der Termine.</p>';
    }
}

// ============================================
// BEWERTUNGEN LADEN
// ============================================
async function loadReviews() {
    try {
        const response = await fetch(`${API_URL}?action=bewertungen`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            allReviews = data.data;
            
            // Calculate average
            const avgRating = (allReviews.reduce((sum, r) => sum + parseInt(r.bewertung), 0) / allReviews.length).toFixed(2);
            
            // Update header
            document.getElementById('average-rating').textContent = avgRating;
            document.getElementById('review-count').textContent = `${allReviews.length} Bewertungen`;
            document.getElementById('total-reviews').textContent = `(${allReviews.length} Bewertungen)`;
            
            // Update rating in booking card
            document.querySelector('.booking-rating span').textContent = `(${allReviews.length})`;
            
            // Show stats
            displayReviewStats(allReviews);
            
            // Show first 6 reviews
            displayReviews(allReviews.slice(0, 6));
        }
    } catch (error) {
        console.error('Fehler beim Laden der Bewertungen:', error);
    }
}

function displayReviewStats(reviews) {
    const stats = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
    reviews.forEach(r => stats[r.bewertung]++);
    
    const total = reviews.length;
    const container = document.getElementById('reviews-stats');
    
    container.innerHTML = Object.keys(stats).reverse().map(rating => {
        const count = stats[rating];
        const percentage = (count / total * 100).toFixed(0);
        
        return `
            <div class="stat-bar">
                <span class="stat-label">${rating} Sterne</span>
                <div class="stat-progress">
                    <div class="stat-fill" style="width: ${percentage}%"></div>
                </div>
                <span>${count}</span>
            </div>
        `;
    }).join('');
}

function displayReviews(reviews) {
    const container = document.getElementById('reviews-container');
    
    container.innerHTML = reviews.map(review => {
        const initials = review.name.split(' ').map(n => n[0]).join('');
        const stars = Array(parseInt(review.bewertung)).fill('⭐').join('');
        
        return `
            <div class="review-card">
                <div class="review-header">
                    <div class="review-avatar">${initials}</div>
                    <div class="review-author">
                        <div class="review-name">${review.name}</div>
                        <div class="review-date">${formatDate(review.datum)}</div>
                    </div>
                </div>
                <div class="review-rating">
                    ${Array(parseInt(review.bewertung)).fill('').map(() => `
                        <svg viewBox="0 0 16 16">
                            <path d="M8 .5l2.385 4.835 5.338.777-3.861 3.762.911 5.311L8 13.257l-4.773 2.928.911-5.311L.277 6.112l5.338-.777L8 .5z"></path>
                        </svg>
                    `).join('')}
                </div>
                <p class="review-text">${review.kommentar}</p>
            </div>
        `;
    }).join('');
}

// Show more reviews
document.getElementById('show-more-reviews')?.addEventListener('click', () => {
    displayReviews(allReviews);
    document.getElementById('show-more-reviews').style.display = 'none';
});

// ============================================
// BOOKING WIDGET
// ============================================
function updateBookingPrice(price) {
    document.getElementById('booking-price').textContent = `${price} €`;
    document.getElementById('detail-price').textContent = `${price} €`;
    updatePriceCalculation();
}

function changeGuests(delta) {
    currentGuests = Math.max(1, Math.min(8, currentGuests + delta));
    document.getElementById('guests-count').textContent = currentGuests;
    updatePriceCalculation();
}

function updatePriceCalculation() {
    const priceText = document.getElementById('booking-price').textContent;
    const price = parseInt(priceText);
    const subtotal = price * currentGuests;
    
    document.getElementById('detail-guests').textContent = currentGuests;
    document.getElementById('detail-subtotal').textContent = `${subtotal} €`;
    document.getElementById('detail-total').textContent = `${subtotal} €`;
    
    if (selectedDate) {
        document.getElementById('price-details').style.display = 'block';
    }
}

function showDatePicker() {
    const modal = document.getElementById('date-picker-modal');
    modal.classList.add('active');
    
    // Generate calendar with available dates
    const container = document.getElementById('calendar-container');
    container.innerHTML = '<h4>Verfügbare Termine:</h4>';
    
    termine.forEach(termin => {
        const dateDiv = document.createElement('div');
        dateDiv.className = 'time-slot';
        dateDiv.textContent = `${formatDate(termin.datum)} - ${termin.uhrzeit_von.substring(0,5)} Uhr`;
        dateDiv.onclick = () => selectDate(termin);
        container.appendChild(dateDiv);
    });
}

function selectDate(termin) {
    selectedDate = termin.datum;
    selectedTime = termin;
    document.getElementById('selected-date').value = `${formatDate(termin.datum)} - ${termin.uhrzeit_von.substring(0,5)} Uhr`;
    closeDatePicker();
    updatePriceCalculation();
    updateBookingPrice(termin.preis);
}

function closeDatePicker() {
    document.getElementById('date-picker-modal').classList.remove('active');
}

function reserveExperience() {
    if (!selectedDate) {
        alert('Bitte wähle zuerst ein Datum aus!');
        showDatePicker();
        return;
    }
    
    // Scroll to contact form
    document.getElementById('kontakt').scrollIntoView({ behavior: 'smooth' });
    
    // Pre-fill booking info
    const betreff = document.querySelector('input[name="betreff"]');
    if (betreff) {
        betreff.value = `Buchungsanfrage: ${selectedTime.titel} am ${formatDate(selectedDate)} für ${currentGuests} Person(en)`;
    }
}

function quickBook(terminId, titel, preis) {
    // Find the termin
    const termin = termine.find(t => t.id === terminId);
    if (termin) {
        selectDate(termin);
        updateBookingPrice(preis);
    }
    
    // Scroll to booking widget
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ============================================
// GALLERY
// ============================================
function openGallery() {
    // Collect all images from hero
    galleryImages = [
        'https://images.unsplash.com/photo-1591608971362-f08b2a75731a?w=1600&q=80',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80',
        'https://images.unsplash.com/photo-1584811645-06b84e8a3b3c?w=1600&q=80',
        'https://images.unsplash.com/photo-1586190823809-46710d0c04e7?w=1600&q=80',
        'https://images.unsplash.com/photo-1611604548018-d56bbd85d681?w=1600&q=80'
    ];
    
    currentImageIndex = 0;
    showLightboxImage();
    document.getElementById('lightbox').classList.add('active');
}

function showLightboxImage() {
    document.getElementById('lightbox-img').src = galleryImages[currentImageIndex];
    document.getElementById('lightbox-current').textContent = currentImageIndex + 1;
    document.getElementById('lightbox-total').textContent = galleryImages.length;
}

function changeLightboxImage(delta) {
    currentImageIndex = (currentImageIndex + delta + galleryImages.length) % galleryImages.length;
    showLightboxImage();
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
}

// Keyboard navigation for lightbox
document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (lightbox.classList.contains('active')) {
        if (e.key === 'ArrowLeft') changeLightboxImage(-1);
        if (e.key === 'ArrowRight') changeLightboxImage(1);
        if (e.key === 'Escape') closeLightbox();
    }
});

// ============================================
// ALPAKA DETAIL (Placeholder)
// ============================================
function showAlpakaDetail(alpakaId) {
    alert('Alpaka-Detailseite wird in Kürze verfügbar sein! 🦙');
}

// ============================================
// CONTACT FORM
// ============================================
function initContactForm() {
    const form = document.getElementById('kontakt-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        // Disable submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sende...';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch(`${API_URL}?action=kontakt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            const messageDiv = document.getElementById('kontakt-message');
            
            if (result.success) {
                messageDiv.className = 'message success';
                messageDiv.textContent = '✅ Vielen Dank! Wir haben deine Nachricht erhalten und melden uns bald bei dir.';
                e.target.reset();
                
                // Clear booking info
                selectedDate = null;
                selectedTime = null;
                document.getElementById('selected-date').value = '';
                document.getElementById('price-details').style.display = 'none';
            } else {
                messageDiv.className = 'message error';
                messageDiv.textContent = '❌ Fehler beim Senden der Nachricht. Bitte versuche es später erneut.';
            }
            
            // Scroll to message
            messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (error) {
            console.error('Fehler:', error);
            const messageDiv = document.getElementById('kontakt-message');
            messageDiv.className = 'message error';
            messageDiv.textContent = '❌ Fehler beim Senden der Nachricht. Bitte versuche es später erneut.';
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Smooth reveal on scroll (optional enhancement)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe cards for animation
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.querySelectorAll('.alpaka-card, .termin-card, .review-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s, transform 0.5s';
            observer.observe(card);
        });
    }, 100);
});
