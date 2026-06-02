// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {

    // Prevent browser from restoring scroll position on reload
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // Page Transition Setup
    const pageTransition = document.querySelector('.page-transition');

    // Custom Swiss Editorial Loader Logic
    const loaderContainer = document.getElementById('loader');
    if (loaderContainer) {
        if (window.skipLoaderFlag) {
            // If skipLoader is true, skip loader
            loaderContainer.style.display = 'none';
            if (pageTransition) {
                requestAnimationFrame(() => setTimeout(() => pageTransition.classList.add('loaded'), 100));
            }
            initAnimations();
        } else {
            // Show loader
            if (pageTransition) {
                pageTransition.style.display = 'none'; // Loader takes over
            }
            
            // Ön yükleme sırasında elementleri gizleyelim ki, loader bitince ikinci kez yüklenmiş gibi bir flash yapmasınlar.
            gsap.set(".gsap-reveal", { y: 50, opacity: 0 });
            gsap.set(".gsap-fade-up", { y: 100, opacity: 0 });

            const percentageEl = document.querySelector('.loader-percentage');
            let loaderState = { val: 0 };
            
            // Prevent scrolling while loading
            document.body.style.overflow = 'hidden';

            const tl = gsap.timeline({
                onComplete: () => {
                    loaderContainer.style.display = 'none';
                    document.body.style.overflow = '';
                    ScrollTrigger.refresh();
                    initAnimations();
                }
            });

            tl.to(loaderState, {
                val: 100,
                duration: 2.5,
                ease: "power2.inOut",
                onUpdate: function() {
                    percentageEl.innerText = Math.round(loaderState.val) + "%";
                }
            })
            .to(".loader-top-left span, .loader-top-right span, .loader-bottom-left span, .loader-percentage", {
                yPercent: 100,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.in"
            }, "+=0.2")
            .to(loaderContainer, {
                yPercent: -100,
                duration: 1.2,
                ease: "power4.inOut"
            }, "-=0.4");
        }
    } else {
        // If no loader exists (like on sub-pages), initialize animations immediately
        if (pageTransition) {
            requestAnimationFrame(() => setTimeout(() => pageTransition.classList.add('loaded'), 100));
        }
        initAnimations();
    }

    // Page Transition Link Interception
    document.querySelectorAll('a[href]').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && this.target !== '_blank') {
                e.preventDefault();
                if (pageTransition) {
                    pageTransition.style.display = 'block';
                    requestAnimationFrame(() => {
                        pageTransition.classList.remove('loaded');
                    });
                    setTimeout(() => {
                        window.location.href = href;
                    }, 550); // Slightly longer than 500ms CSS transition
                } else {
                    window.location.href = href;
                }
            }
        });
    });

    // Handle BFCache
    window.addEventListener('pageshow', (event) => {
        if (event.persisted && pageTransition) {
            pageTransition.classList.add('loaded');
        }
    });

    // Custom Cursor Logic optimized with GSAP quickTo
    const cursor = document.querySelector('.custom-cursor');
    
    if (cursor) {
        gsap.set(cursor, {xPercent: -50, yPercent: -50});
        
        let xTo = gsap.quickTo(cursor, "x", {duration: 0.3, ease: "power3"});
        let yTo = gsap.quickTo(cursor, "y", {duration: 0.3, ease: "power3"});
        let cursorVisible = false;

        window.addEventListener("mousemove", e => {
            if (!cursorVisible) {
                gsap.set(cursor, {x: e.clientX, y: e.clientY, opacity: 1});
                cursorVisible = true;
            }
            xTo(e.clientX);
            yTo(e.clientY);
        });

        const interactables = document.querySelectorAll('a, button, .picture-frame');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
    }

    function initAnimations() {
        // 1. Hero Section Animations
        const reveals = document.querySelectorAll(".gsap-reveal");
    
    reveals.forEach((elem) => {
        let delay = 0;
        if(elem.classList.contains('delay-1')) delay = 0.2;
        if(elem.classList.contains('delay-2')) delay = 0.4;
        if(elem.classList.contains('delay-3')) delay = 0.6;

        gsap.fromTo(elem, 
            { y: 50, opacity: 0 }, 
            { 
                y: 0, 
                opacity: 1, 
                duration: 1, 
                ease: "power3.out",
                delay: delay,
                scrollTrigger: {
                    trigger: elem,
                    start: "top 90%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // 2. Work Items Fade Up
    const fadeUps = document.querySelectorAll(".gsap-fade-up");

    fadeUps.forEach((elem) => {
        let delay = 0;
        if(elem.classList.contains('delay-1')) delay = 0.2;
        if(elem.classList.contains('delay-2')) delay = 0.4;

        gsap.fromTo(elem,
            { y: 100, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1.2,
                ease: "power3.out",
                delay: delay,
                scrollTrigger: {
                    trigger: elem,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // Smooth scroll for nav links (only hash links)
    document.querySelectorAll('.nav-links a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if(targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Scroll to Top Logic
    const scrollTopBtn = document.getElementById('scroll-to-top');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > window.innerHeight) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });

        scrollTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    } // End of initAnimations

}); // End of DOMContentLoaded
