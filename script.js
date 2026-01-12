// DOM Elements
const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const mobileToggle = document.getElementById('mobileToggle');
const mobileMenu = document.getElementById('mobileMenu');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section');
const navbar = document.getElementById('navbar');

// Theme Toggle (Dark Default)
if (themeToggle) {
  const icon = themeToggle.querySelector('i');

  // Load saved theme (does NOT depend on device)
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'light') {
    body.classList.add('light-mode');
    icon.classList.replace('fa-moon', 'fa-sun');
  } else {
    icon.classList.replace('fa-sun', 'fa-moon');
  }

  // Toggle theme on click
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');

    if (body.classList.contains('light-mode')) {
      localStorage.setItem('theme', 'light');
      icon.classList.replace('fa-moon', 'fa-sun');
    } else {
      localStorage.setItem('theme', 'dark');
      icon.classList.replace('fa-sun', 'fa-moon');
    }
  });
}

// Mobile Menu Toggle
if (mobileToggle && mobileMenu) {
  mobileToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
  });
}


// Close mobile menu when clicking a link
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
  });
});

// Smooth Scroll & Highlight Active Section
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);
    targetSection.scrollIntoView({ behavior: 'smooth' });
  });
});

// Intersection Observer for Scroll Animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.remove('hidden');
      entry.target.classList.add('visible');
      // Update active nav link
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}, { threshold: 0.1 });

sections.forEach(section => {
  observer.observe(section);
});

// Navbar background on scroll
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.background = body.classList.contains('light-mode')
        ? 'rgba(255, 255, 255, 0.95)'
        : 'rgba(17, 24, 39, 0.95)';
    } else {
      navbar.style.background = body.classList.contains('light-mode')
        ? 'rgba(255, 255, 255, 0.8)'
        : 'rgba(17, 24, 39, 0.8)';
    }
  });
}

