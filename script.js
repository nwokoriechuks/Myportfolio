const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const menuBtn = document.getElementById('menuBtn');
const navMenu = document.getElementById('navMenu');
const reveals = document.querySelectorAll('.reveal');
const counters = document.querySelectorAll('[data-counter]');
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
const cursorGlow = document.querySelector('.cursor-glow');
const scrollProgress = document.getElementById('scrollProgress');
const navLinks = document.querySelectorAll('.nav a');
const sections = document.querySelectorAll('main section[id]');
const heroShowcase = document.getElementById('heroShowcase');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Theme persistence — warm cream/gold is the default visual direction.
const savedTheme = localStorage.getItem('chuksart-theme');
if (savedTheme === 'dark') body.classList.add('dark');
updateThemeButton();

themeToggle?.addEventListener('click', () => {
  body.classList.toggle('dark');
  localStorage.setItem('chuksart-theme', body.classList.contains('dark') ? 'dark' : 'light');
  updateThemeButton();
});

function updateThemeButton() {
  const dark = body.classList.contains('dark');
  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', String(dark));
    themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    themeToggle.querySelector('span').textContent = dark ? '☀' : '◐';
  }
}

menuBtn?.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

navMenu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded', 'false');
  });
});

// Scroll reveal.
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.14 });
reveals.forEach(item => revealObserver.observe(item));

// Animated metrics.
const animateCounter = (element) => {
  const target = Number(element.dataset.counter);
  if (prefersReducedMotion) {
    element.textContent = target;
    return;
  }
  const duration = 1300;
  const startTime = performance.now();
  const update = currentTime => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
};

const counterObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    animateCounter(entry.target);
    observer.unobserve(entry.target);
  });
}, { threshold: 0.8 });
counters.forEach(counter => counterObserver.observe(counter));

// Project filters with a small stagger instead of a hard display swap.
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    projectCards.forEach((card, index) => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('is-hidden', !match);
      if (match && !prefersReducedMotion) {
        card.animate([
          { opacity: 0, transform: 'translateY(18px) scale(.985)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' }
        ], { duration: 380, delay: index * 45, easing: 'cubic-bezier(.2,.75,.25,1)' });
      }
    });
  });
});

// Functional static-site contact form: opens a pre-addressed email with the form content.
contactForm?.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const name = data.get('name')?.toString().trim();
  const email = data.get('email')?.toString().trim();
  const message = data.get('message')?.toString().trim();

  if (!name || !email || !message) {
    formNote.textContent = 'Please complete all fields before sending.';
    return;
  }

  const subject = encodeURIComponent(`Project enquiry from ${name}`);
  const bodyText = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nProject details:\n${message}`);
  const mailto = `mailto:nwokoriechuma@gmail.com?subject=${subject}&body=${bodyText}`;
  window.location.href = mailto;
  formNote.textContent = 'Your email app should open with the enquiry ready to send.';
  contactForm.reset();
});

// Cursor glow on desktop.
window.addEventListener('mousemove', event => {
  if (!cursorGlow || prefersReducedMotion) return;
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
}, { passive: true });

// Subtle hero parallax and tilt — disabled for touch/reduced-motion.
if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('mousemove', event => {
    if (!heroShowcase) return;
    const x = (event.clientX / window.innerWidth - .5) * 2;
    const y = (event.clientY / window.innerHeight - .5) * 2;
    heroShowcase.style.transform = `translate3d(${x * 7}px, ${y * 5}px, 0)`;
  }, { passive: true });

  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', event => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - .5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - .5) * 2;
      const base = card.classList.contains('showcase-phone') ? 'rotate(5deg)' : 'rotate(2deg)';
      card.style.transform = `${base} rotateX(${y * -2.5}deg) rotateY(${x * 3}deg) translateY(-2px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = card.classList.contains('showcase-phone') ? 'rotate(5deg)' : 'rotate(2deg)';
    });
  });

  document.querySelectorAll('.magnetic').forEach(button => {
    button.addEventListener('mousemove', event => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * .08}px, ${y * .08}px)`;
    });
    button.addEventListener('mouseleave', () => { button.style.transform = ''; });
  });
}

// Scroll progress + active navigation state.
const updateScrollUI = () => {
  const scrollTop = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollProgress) scrollProgress.style.width = `${height > 0 ? (scrollTop / height) * 100 : 0}%`;

  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 150;
    if (scrollTop >= top) current = section.id;
  });
  navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
};
window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();
