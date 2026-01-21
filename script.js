import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase Config (from mobile/src/config/firebase.ts)
const firebaseConfig = {
    apiKey: "AIzaSyCL6su_cFHvijSIuQYomXVzNvfMcsmcJTk",
    authDomain: "forma-3803d.firebaseapp.com",
    projectId: "forma-3803d",
    storageBucket: "forma-3803d.firebasestorage.app",
    messagingSenderId: "311242226872",
    appId: "1:311242226872:web:e3e40064d1471d8725884d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
document.querySelectorAll('.btn-primary, .btn-secondary, .btn-outline, .download-btn, .feedback-btn, .logo').forEach(button => {
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
            if (buttonHref && (buttonHref.includes('apple.com') || buttonHref.includes('play.google.com') || buttonHref.includes('testflight'))) {
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
// Mobile menu toggle
const initMobileMenu = () => {
    const menuButton = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');

    if (menuButton && navLinks) {
        menuButton.addEventListener('click', () => {
            menuButton.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuButton.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
};

// Email form handling (Firebase Integration)
const handleEmailSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    // Handle both input types (some browsers/extensions might interfere)
    const emailInput = form.querySelector('#email-input') || document.getElementById('email-input');
    const submitBtn = form.querySelector('.submit-btn');
    const message = form.querySelector('#form-message') || document.getElementById('form-message');

    if (!emailInput) {
        console.error('Email input not found');
        return;
    }

    const email = emailInput.value.trim();

    // Validation
    if (!isValidEmail(email)) {
        showMessage(message, 'Please enter a valid email address', 'error');
        emailInput.classList.add('error');
        return;
    }

    // Reset states
    emailInput.classList.remove('error');
    if (message) {
        message.classList.remove('success', 'error');
        message.style.display = 'none';
    }

    // Loading state
    if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
    }

    try {
        console.log('Attempting to write to Firebase...', email);

        // Write to Firestore "waitlist" collection
        const docRef = await addDoc(collection(db, "waitlist"), {
            email: email,
            timestamp: serverTimestamp(),
            source: 'landing_page_backdoor',
            status: 'early_access_granted'
        });

        console.log("Document written with ID: ", docRef.id);

        // Success! Redirect immediately
        window.location.href = 'success.html';

        // Analytics
        if (window.analytics) {
            window.analytics.trackEmailCapture(email, 'waitlist');
            window.analytics.trackFormSubmission('waitlist', true);
        }

    } catch (error) {
        console.error("Error adding document: ", error);

        if (message) {
            showMessage(message, 'Could not save email. Please try again.', 'error');
        }

        // Track error
        if (window.analytics) {
            window.analytics.trackError(error.message || 'Firebase write failed', 'waitlist_form');
            window.analytics.trackFormSubmission('waitlist', false);
        }

    } finally {
        // Reset loading state
        if (submitBtn) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }
};

// Email validation
const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Show message
const showMessage = (element, text, type) => {
    if (!element) return;
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

// Hero Visualizer Animation Sequence Removed - Using Video instead

// FAQ Accordion
const initFAQAccordion = () => {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other FAQs
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current FAQ
            item.classList.toggle('active');

            // Track analytics
            if (!isActive && window.analytics) {
                const questionText = question.querySelector('h3')?.textContent || 'Unknown';
                window.analytics.track('FAQ Clicked', {
                    question: questionText
                });
            }
        });
    });
};

// Floating CTA Visibility
const initFloatingCTA = () => {
    const floatingCta = document.getElementById('floating-cta');
    const heroSection = document.querySelector('.hero');

    if (floatingCta && heroSection) {
        window.addEventListener('scroll', () => {
            const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
            if (window.pageYOffset > heroBottom - 100) {
                floatingCta.classList.add('active');
            } else {
                floatingCta.classList.remove('active');
            }
        });
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initFAQAccordion();
    initFloatingCTA();
});

// Infinite Scroll Carousel
const initInfiniteScroll = () => {
    const scrollers = document.querySelectorAll('.carousel-scroller');

    scrollers.forEach(scroller => {
        const items = Array.from(scroller.children);
        if (items.length < 2) return;

        // Clone strategy:
        // We prepend a full set and append a full set to ensure there's always buffer.
        // [Clone A, Clone B, Clone C] [A, B, C] [Clone A, Clone B, Clone C]

        const fragmentBefore = document.createDocumentFragment();
        const fragmentAfter = document.createDocumentFragment();

        // Clear existing clones if any (e.g. if we re-init)
        items.forEach(item => {
            if (item.classList.contains('clone-before') || item.classList.contains('clone-after')) {
                item.remove();
            }
        });

        // Re-fetch items after cleanup
        const originalItems = Array.from(scroller.children);

        originalItems.forEach(item => {
            const clone = item.cloneNode(true);
            clone.classList.add('clone-before');
            clone.setAttribute('aria-hidden', 'true');
            fragmentBefore.appendChild(clone);
        });

        originalItems.forEach(item => {
            const clone = item.cloneNode(true);
            clone.classList.add('clone-after');
            clone.setAttribute('aria-hidden', 'true');
            fragmentAfter.appendChild(clone);
        });

        scroller.prepend(fragmentBefore);
        scroller.append(fragmentAfter);

        // Force a layout calculation after cloning
        const calculateDimensions = () => {
            const style = window.getComputedStyle(scroller);
            const gap = parseFloat(style.gap) || 0;

            // Sum all original items for total width in case they differ slightly
            let totalW = 0;
            originalItems.forEach(item => {
                totalW += item.getBoundingClientRect().width + gap;
            });

            return { totalOriginalWidth: totalW };
        };

        let dimensions = calculateDimensions();

        // Initial setup
        const setupScroll = () => {
            dimensions = calculateDimensions();
            scroller.scrollLeft = dimensions.totalOriginalWidth;
        };

        // Use ResizeObserver for more robust updates
        if (window.ResizeObserver) {
            const ro = new ResizeObserver(() => {
                dimensions = calculateDimensions();
            });
            ro.observe(scroller);
            originalItems.forEach(item => ro.observe(item));
        }

        // Wait for images/fonts and layout to stabilize
        window.addEventListener('load', setupScroll);
        requestAnimationFrame(setupScroll);

        let isJumping = false;

        scroller.addEventListener('scroll', () => {
            if (isJumping) return;

            const scrollLeft = scroller.scrollLeft;
            const totalW = dimensions.totalOriginalWidth;

            // Use a small buffer to prevent jitter
            const buffer = 10;

            // If we've scrolled into the left clone set
            if (scrollLeft < buffer) {
                isJumping = true;
                scroller.style.scrollBehavior = 'auto'; // Disable smooth scroll for jump
                scroller.scrollLeft = totalW + scrollLeft;
                isJumping = false;
            }
            // If we've scrolled toward the end of the middle set
            else if (scrollLeft >= totalW * 2 - buffer) {
                isJumping = true;
                scroller.style.scrollBehavior = 'auto';
                scroller.scrollLeft = scrollLeft - totalW;
                isJumping = false;
            }
        });
    });
};
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    // initHeroAnimations(); - Removed in favor of video
    initFAQAccordion();
    initInfiniteScroll();
    initFloatingCTA();



    // Add loading animation complete
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);

    // Initialize email form
    const emailForm = document.getElementById('waitlist-form');
    // Important: We need to use event delegation or direct attachment
    if (emailForm) {
        // Remove any old listeners by cloning (simple trace for single listener)
        // or just add the new one.
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
