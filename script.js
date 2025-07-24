// DOM Elements
const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const mobileToggle = document.getElementById('mobileToggle');
const mobileMenu = document.getElementById('mobileMenu');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section');
const navbar = document.getElementById('navbar');

// Theme Toggle
themeToggle.addEventListener('click', () => {
  body.classList.toggle('light-mode');
  body.classList.toggle('dark-mode');
  const icon = themeToggle.querySelector('i');
  if (body.classList.contains('light-mode')) {
    icon.classList.replace('fa-sun', 'fa-moon');
  } else {
    icon.classList.replace('fa-moon', 'fa-sun');
  }
});

// Mobile Menu Toggle
mobileToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('active');
});

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
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.style.background = 'rgba(17, 24, 39, 0.95)';
  } else {
    navbar.style.background = 'rgba(17, 24, 39, 0.8)';
  }
});