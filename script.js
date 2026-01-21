import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase Config
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
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 50) {
        nav.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
    } else {
        nav.style.boxShadow = 'none';
    }
});

// Mobile menu toggle
const initMobileMenu = () => {
    const menuButton = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');

    if (menuButton && navLinks) {
        menuButton.addEventListener('click', () => {
            menuButton.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuButton.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
};

// FAQ Accordion
const initFAQAccordion = () => {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            faqItems.forEach(otherItem => {
                if (otherItem !== item) otherItem.classList.remove('active');
            });
            item.classList.toggle('active');
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

// Infinite Scroll Carousel
const initInfiniteScroll = () => {
    const scrollers = document.querySelectorAll('.carousel-scroller');

    scrollers.forEach(scroller => {
        const originalItems = Array.from(scroller.children);
        if (originalItems.length < 2) return;

        // Clone items for infinite effect
        originalItems.forEach(item => {
            const clone = item.cloneNode(true);
            clone.classList.add('clone-after');
            scroller.appendChild(clone);
        });

        originalItems.forEach(item => {
            const clone = item.cloneNode(true);
            clone.classList.add('clone-before');
            scroller.prepend(clone);
        });

        const getItemWidth = () => {
            const item = originalItems[0];
            const style = window.getComputedStyle(scroller);
            const gap = parseFloat(style.gap) || 0;
            return item.offsetWidth + gap;
        };

        const totalOriginalWidth = getItemWidth() * originalItems.length;

        // Initial position
        scroller.scrollLeft = totalOriginalWidth;

        let isJumping = false;
        scroller.addEventListener('scroll', () => {
            if (isJumping) return;

            const scrollLeft = scroller.scrollLeft;

            if (scrollLeft <= 0) {
                isJumping = true;
                scroller.scrollLeft = totalOriginalWidth;
                isJumping = false;
            } else if (scrollLeft >= totalOriginalWidth * 2) {
                isJumping = true;
                scroller.scrollLeft = totalOriginalWidth;
                isJumping = false;
            }
        });
    });
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initFAQAccordion();
    initFloatingCTA();
    initInfiniteScroll();

    // Fade in body
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});
