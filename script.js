// Intersection Observer for scroll animations
const observers = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => {
    observers.observe(el);
});

// Parallax Effect for Hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    parallaxElements.forEach(el => {
        const speed = el.getAttribute('data-parallax');
        el.style.backgroundPositionY = `${(scrolled * speed)}px`;
    });
});

// Lightbox Functionality
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');

// Persistent state
let isLightboxActive = false;

// Robust scroll suppression (prevents scroll without changing body styles)
function preventDefault(e) {
    if (isLightboxActive) {
        e.preventDefault();
        e.stopPropagation();
    }
}

function disableScroll() {
    isLightboxActive = true;
    window.addEventListener('wheel', preventDefault, { passive: false });
    window.addEventListener('touchmove', preventDefault, { passive: false });
    window.addEventListener('keydown', preventDefaultKey);
    document.body.classList.add('no-scroll'); // Keep class for visual cues if needed
}

function enableScroll() {
    isLightboxActive = false;
    window.removeEventListener('wheel', preventDefault);
    window.removeEventListener('touchmove', preventDefault);
    window.removeEventListener('keydown', preventDefaultKey);
    document.body.classList.remove('no-scroll');
    document.documentElement.classList.remove('no-scroll');
    document.body.style.overflow = '';
}

function preventDefaultKey(e) {
    const keys = ['ArrowUp', 'ArrowDown', ' ', 'PageUp', 'PageDown', 'Home', 'End'];
    if (isLightboxActive && keys.includes(e.key)) {
        e.preventDefault();
    }
}

function openLightbox(src, caption) {
    console.log("Opening Lightbox:", src);
    lightboxImg.src = src;
    if (caption) {
        lightboxCaption.textContent = caption;
        lightboxCaption.style.display = 'block';
    } else {
        lightboxCaption.style.display = 'none';
    }
    lightbox.classList.add('active');
    disableScroll();
}

function closeLightbox() {
    console.log("Closing Lightbox");
    lightbox.classList.remove('active');
    enableScroll();
}

// Global click delegation for gallery items (handles gunshot and lightbox in one go)
document.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery-item');
    if (item) {
        e.preventDefault();

        // 1. Play Gunshot
        if (typeof playGunshot === 'function') {
            playGunshot(0.4 + Math.random() * 0.2);
        }

        // 2. Create Bullet Hole
        const rect = item.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const hole = document.createElement('div');
        hole.className = 'bullet-hole';
        hole.style.left = `${x}px`;
        hole.style.top = `${y}px`;
        hole.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`;
        item.appendChild(hole);
        setTimeout(() => hole.remove(), 600);

        // 3. Open Lightbox
        const img = item.querySelector('img');
        if (img) {
            const src = img.src;
            const caption = img.alt || item.dataset.caption;
            openLightbox(src, caption);
        }
    }

    // Lightbox Close Logic
    if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
        closeLightbox();
    }
});

// Global Esc key listener
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLightbox();
    }
});

// Sepia Mode Toggle
const sepiaToggle = document.getElementById('sepia-toggle');
if (sepiaToggle) {
    sepiaToggle.addEventListener('change', () => {
        document.body.classList.toggle('sepia-mode');
    });
}

// Music Toggle
// Music functionality removed

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('open');
    });
}

// Close menu when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('open');
    });
});

// Flip Card Interaction
document.addEventListener('click', (e) => {
    const card = e.target.closest('.cast-card');
    if (card) {
        card.classList.toggle('flipped');
    }
});


// Fan Poll Logic
// Faked initial stats for demonstration
const initialVotes = {
    'Chance': 35,
    'Dude': 42,
    'Stumpy': 18,
    'Colorado': 5
};

function votePoll(choice) {
    // Prevent multiple votes in session (simple check)
    if (localStorage.getItem('voted')) {
        alert("You've already voted!");
        showResults();
        return;
    }

    // Increment selection (locally)
    initialVotes[choice]++;
    localStorage.setItem('voted', 'true');

    // Show Thank You message
    const msg = document.getElementById('poll-message');
    msg.style.opacity = '1';
    msg.textContent = `You voted for ${choice}!`;

    showResults();
}

function showResults() {
    const total = Object.values(initialVotes).reduce((a, b) => a + b, 0);
    const buttons = document.querySelectorAll('.poll-btn');

    buttons.forEach(btn => {
        // Disable click
        btn.onclick = null;
        btn.style.cursor = 'default';

        // Get character name from onclick attribute or inferred
        // This is a simple mapping for the demo
        let char = '';
        if (btn.innerText.includes('Chance')) char = 'Chance';
        if (btn.innerText.includes('Dude')) char = 'Dude';
        if (btn.innerText.includes('Stumpy')) char = 'Stumpy';
        if (btn.innerText.includes('Colorado')) char = 'Colorado';

        if (initialVotes[char]) {
            const percent = Math.round((initialVotes[char] / total) * 100);

            // Animate Bar
            const bar = btn.querySelector('.poll-bar');
            bar.style.width = `${percent}%`;

            // Update Text
            const percentSpan = btn.querySelector('.poll-percent');
            percentSpan.textContent = `${percent}%`;
        }
    });
}
// Gunshot Interaction for Gallery
const gunshotSound = new Audio('assets/gunshot.mp3');
gunshotSound.preload = 'auto';

// Pre-load gunshot sounds for variety
const gunshotPool = [];
for (let i = 0; i < 5; i++) {
    const sound = new Audio('assets/gunshot.mp3');
    sound.volume = 0.5;
    gunshotPool.push(sound);
}

let poolIndex = 0;

function playGunshot(volume = 0.5) {
    const sound = gunshotPool[poolIndex];
    sound.currentTime = 0;
    sound.volume = volume;
    sound.play().catch(e => console.warn('Sound play failed', e));
    poolIndex = (poolIndex + 1) % gunshotPool.length;
}

// Gunshot logic moved to centralized handler at top.
