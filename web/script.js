// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background on scroll
const nav = document.querySelector('.nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        nav.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
    } else {
        nav.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// Intersection Observer for fade-in animations
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

// Observe elements
document.querySelectorAll('.feature-card, .testimonial-card, .pricing-card, .step').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Track CTA clicks (for analytics)
document.querySelectorAll('.btn-primary, .btn-secondary, .btn-outline, .download-btn').forEach(button => {
    button.addEventListener('click', function () {
        const buttonText = this.textContent.trim();
        const buttonHref = this.getAttribute('href');

        // Determine location
        let location = 'unknown';
        if (this.closest('.hero')) location = 'hero';
        else if (this.closest('.pricing')) location = 'pricing';
        else if (this.closest('.download')) location = 'download';
        else if (this.closest('.waitlist')) location = 'waitlist';
        else if (this.closest('.nav')) location = 'navigation';

        // Track with analytics
        if (window.analytics) {
            window.analytics.trackCTAClick(buttonText, location);

            // Track as conversion if it's a download button
            if (buttonHref && (buttonHref.includes('apps.apple.com') || buttonHref.includes('play.google.com'))) {
                window.analytics.track('App Download Started', {
                    platform: buttonHref.includes('apple') ? 'iOS' : 'Android',
                    location: location,
                });
            }
        }

        console.log('CTA clicked:', buttonText, 'Location:', location);
    });
});

// Mobile menu toggle (if implementing mobile menu)
const initMobileMenu = () => {
    const menuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });
    }
};

// Email form handling
const handleEmailSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const emailInput = form.querySelector('#email-input');
    const submitBtn = form.querySelector('.submit-btn');
    const message = form.querySelector('#form-message');
    const email = emailInput.value.trim();

    // Validation
    if (!isValidEmail(email)) {
        showMessage(message, 'Please enter a valid email address', 'error');
        emailInput.classList.add('error');
        return;
    }

    // Reset states
    emailInput.classList.remove('error');
    message.classList.remove('success', 'error');
    message.style.display = 'none';

    // Loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
        // Submit to backend
        const apiUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:3001/api/subscribe'
            : '/api/subscribe';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(message, '🎉 Success! Check your email for confirmation.', 'success');
            emailInput.classList.add('success');
            emailInput.value = '';

            // Update subscriber count
            updateSubscriberCount();

            // Track email capture with analytics
            if (window.analytics) {
                window.analytics.trackEmailCapture(email, 'waitlist');
                window.analytics.trackFormSubmission('waitlist', true);
            }

            console.log('Email captured:', email);
        } else {
            showMessage(message, data.error || 'Something went wrong. Please try again.', 'error');

            // Track error
            if (window.analytics) {
                window.analytics.trackError(data.error || 'Form submission failed', 'waitlist_form');
                window.analytics.trackFormSubmission('waitlist', false);
            }
        }

    } finally {
        // Reset loading state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        // Clear success state after 3 seconds
        setTimeout(() => {
            emailInput.classList.remove('success', 'error');
        }, 3000);
    }
};

// Email validation
const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Show message
const showMessage = (element, text, type) => {
    element.textContent = text;
    element.className = `form-message ${type}`;
    element.style.display = 'block';
};

// Update subscriber count animation
const updateSubscriberCount = () => {
    const countElement = document.getElementById('subscriber-count');
    if (countElement) {
        const currentCount = parseInt(countElement.textContent.replace(/,/g, ''));
        const newCount = currentCount + 1;
        animateCount(countElement, currentCount, newCount);
    }
};

// Animate number counter
const animateCount = (element, start, end) => {
    const duration = 1000;
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, 16);
};

// Hero Visualizer Animation Sequence
const initHeroAnimation = () => {
    const preview = document.getElementById('app-preview');
    if (!preview) return;

    const states = ['camera', 'scan', 'dashboard'];
    const timings = {
        camera: 2000,
        scan: 3000,
        dashboard: 4000
    };

    let currentStateIndex = 0;

    const nextState = () => {
        const state = states[currentStateIndex];
        preview.setAttribute('data-state', state);

        // Remove old classes if they exist (for backward compatibility)
        if (state === 'dashboard') {
            preview.classList.add('active-stats');
        } else {
            preview.classList.remove('active-stats');
        }

        setTimeout(() => {
            currentStateIndex = (currentStateIndex + 1) % states.length;
            nextState();
        }, timings[state]);
    };

    // Start the loop
    nextState();
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initHeroAnimation();

    // Add loading animation complete
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);

    // Initialize email form
    const emailForm = document.getElementById('waitlist-form');
    if (emailForm) {
        emailForm.addEventListener('submit', handleEmailSubmit);
    }

    // Real-time email validation
    const emailInput = document.getElementById('email-input');
    if (emailInput) {
        emailInput.addEventListener('input', (e) => {
            e.target.classList.remove('error', 'success');
        });
    }
});

// Pricing card highlight on hover
document.querySelectorAll('.pricing-card').forEach(card => {
    card.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-8px) scale(1.02)';

        // Track pricing card view
        const planName = this.querySelector('.pricing-title')?.textContent || 'Unknown';
        if (window.analytics) {
            window.analytics.track('Pricing Plan Viewed', {
                plan: planName,
                action: 'hover',
            });
        }
    });

    card.addEventListener('mouseleave', function () {
        if (!this.classList.contains('pricing-featured')) {
            this.style.transform = 'translateY(0) scale(1)';
        } else {
            this.style.transform = 'translateY(0) scale(1.05)';
        }
    });

    // Track clicks on pricing cards
    card.addEventListener('click', function (e) {
        const planName = this.querySelector('.pricing-title')?.textContent || 'Unknown';
        const priceAmount = this.querySelector('.price-amount')?.textContent || '0';

        if (window.analytics && !e.target.closest('a')) {
            window.analytics.track('Pricing Plan Clicked', {
                plan: planName,
                price: priceAmount,
            });
        }
    });
});

