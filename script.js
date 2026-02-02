// Main initialization - wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Add ripple effect CSS dynamically
    const style = document.createElement('style');
    style.textContent = `
        .btn {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                const target = document.querySelector(targetId);
                if (target) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const offsetTop = target.offsetTop - navbarHeight - 20; // Account for fixed navbar + extra spacing
                    window.scrollTo({
                        top: Math.max(0, offsetTop),
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Speedometer Animation
    const speedometer = document.querySelector('.speedometer');
    const speedValue = document.querySelector('.speed-value');
    const speedNeedle = document.querySelector('.speed-needle');

    if (speedometer && speedValue && speedNeedle) {
        let currentSpeed = 0;
        const maxSpeed = 200;
        let targetSpeed = Math.floor(Math.random() * maxSpeed) + 100;
        
        const updateSpeedometer = () => {
            if (currentSpeed < targetSpeed) {
                currentSpeed += 2;
            } else if (currentSpeed > targetSpeed) {
                currentSpeed -= 2;
            } else {
                targetSpeed = Math.floor(Math.random() * maxSpeed) + 50;
            }
            
            if (speedValue) speedValue.textContent = currentSpeed;
            if (speedNeedle) {
                const rotation = (currentSpeed / maxSpeed) * 180 - 90;
                speedNeedle.style.transform = `rotate(${rotation}deg)`;
            }
        };
        
        setInterval(updateSpeedometer, 100);
    }

    // Scroll Animations using Intersection Observer
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe all cards and sections
        document.querySelectorAll('.feature-card, .car-card, .track-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        document.querySelectorAll('.feature-card, .car-card, .track-card').forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
    }

    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset || window.scrollY;
            
            if (currentScroll > 100) {
                navbar.style.background = 'rgba(10, 10, 15, 0.98)';
                navbar.style.boxShadow = '0 5px 20px rgba(0, 240, 255, 0.2)';
            } else {
                navbar.style.background = 'rgba(10, 10, 15, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        });
    }

    // Button Click Effects
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.remove();
                }
            }, 600);
        });
    });

    // Dynamic Speed Lines
    const speedLines = document.querySelector('.speed-lines');
    if (speedLines) {
        let speed = 0;
        setInterval(() => {
            speed += 0.5;
            speedLines.style.transform = `translateX(${speed}px)`;
            if (speed > 50) speed = 0;
        }, 16);
    }

    // Car Card Hover Effects
    document.querySelectorAll('.car-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            const carImage = this.querySelector('.car-image');
            if (carImage) {
                carImage.style.transform = 'scale(1.1)';
                carImage.style.transition = 'transform 0.3s ease';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const carImage = this.querySelector('.car-image');
            if (carImage) {
                carImage.style.transform = 'scale(1)';
            }
        });
    });

    // Track Card Animation
    document.querySelectorAll('.track-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            const trackPreview = this.querySelector('.track-preview');
            if (trackPreview) {
                trackPreview.style.transform = 'scale(1.1)';
                trackPreview.style.transition = 'transform 0.3s ease';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const trackPreview = this.querySelector('.track-preview');
            if (trackPreview) {
                trackPreview.style.transform = 'scale(1)';
            }
        });
    });

    // Console log for debugging
    console.log('%cNITRO RUSH', 'font-size: 40px; font-weight: bold; color: #00f0ff; text-shadow: 0 0 20px #00f0ff;');
    console.log('%cWelcome to the ultimate racing experience!', 'font-size: 16px; color: #ff006e;');
});
