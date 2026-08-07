(() => {
  const ready = () => {
    const body = document.body;
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const desktopNav = document.getElementById('navLinks');
    const themeToggle = document.getElementById('themeToggle');

    body.classList.add('design-refresh-active');

    // Accessible labels for icon-only controls.
    if (themeToggle) themeToggle.setAttribute('aria-label', 'Toggle light and dark theme');
    if (mobileToggle) {
      mobileToggle.setAttribute('aria-label', 'Open navigation menu');
      mobileToggle.setAttribute('aria-expanded', 'false');
    }

    // Populate the existing mobile menu without changing the desktop content.
    if (mobileMenu && desktopNav && !mobileMenu.children.length) {
      [...desktopNav.querySelectorAll('a')].forEach((link) => {
        const clone = link.cloneNode(true);
        clone.addEventListener('click', () => {
          mobileMenu.classList.remove('active');
          if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
        });
        mobileMenu.appendChild(clone);
      });
    }

    if (mobileToggle && mobileMenu) {
      mobileToggle.addEventListener('click', () => {
        const expanded = mobileMenu.classList.contains('active');
        mobileToggle.setAttribute('aria-expanded', String(expanded));
        mobileToggle.setAttribute('aria-label', expanded ? 'Close navigation menu' : 'Open navigation menu');
      });
    }

    // Scroll progress line.
    const progress = document.createElement('div');
    progress.className = 'design-scroll-progress';
    progress.setAttribute('aria-hidden', 'true');
    progress.innerHTML = '<span></span>';
    body.prepend(progress);
    const progressBar = progress.firstElementChild;

    const updateScrollUi = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      progressBar.style.width = `${ratio * 100}%`;
      if (navbar) {
        navbar.classList.toggle('is-scrolled', window.scrollY > 24);
        // The legacy script writes an inline dark background. Clear it so both themes stay correct.
        navbar.style.background = 'transparent';
      }
    };
    window.addEventListener('scroll', updateScrollUi, { passive: true });
    window.addEventListener('resize', updateScrollUi, { passive: true });
    updateScrollUi();

    // Better active-section state in both desktop and cloned mobile navigation.
    const sectionLinks = () => [...document.querySelectorAll('.nav-links a[href^="#"]')];
    const observedSections = [...document.querySelectorAll('section[id]')];
    const activeObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = visible.target.id;
      sectionLinks().forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }, { rootMargin: '-20% 0px -58% 0px', threshold: [0.05, 0.25, 0.5] });
    observedSections.forEach((section) => activeObserver.observe(section));

    // Pointer-reactive highlight for cards. Content is untouched.
    const reactiveCards = document.querySelectorAll(
      '.project-card, .skill-card-pro, .cert-card-modern, .testimonial-card, .experience-area, .tech-item, .contact-item'
    );
    reactiveCards.forEach((card) => {
      card.classList.add('design-reactive');
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--pointer-x', `${x}%`);
        card.style.setProperty('--pointer-y', `${y}%`);
      });
    });

    // Subtle entrance motion on first reveal, without hiding content if JS is unavailable.
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const revealTargets = document.querySelectorAll(
        '.experience-area, .project-card, .skill-card-pro, .cert-card-modern, .testimonial-card, .contact-item, .tech-item'
      );
      const animated = new WeakSet();
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || animated.has(entry.target)) return;
          animated.add(entry.target);
          entry.target.animate(
            [
              { opacity: 0, transform: 'translateY(14px)' },
              { opacity: 1, transform: 'translateY(0)' }
            ],
            { duration: 460, easing: 'cubic-bezier(.16,.8,.24,1)', fill: 'both' }
          );
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -45px 0px' });
      revealTargets.forEach((target) => revealObserver.observe(target));
    }

    // Certificate search/filter: all existing certificate cards remain in the DOM and all PDF links remain unchanged.
    const certSection = document.getElementById('certificates');
    if (certSection && !certSection.querySelector('.cert-toolbar')) {
      const groups = [...certSection.querySelectorAll('.certificate-group')];
      const cards = [...certSection.querySelectorAll('.cert-card-modern')];
      const intro = certSection.querySelector('.cert-intro');

      const toolbar = document.createElement('div');
      toolbar.className = 'cert-toolbar';
      toolbar.innerHTML = `
        <label for="certSearch">Search certificates</label>
        <input id="certSearch" type="search" placeholder="Search certification, issuer or skill…" autocomplete="off">
        <label for="certGroupFilter">Certificate group</label>
        <select id="certGroupFilter">
          <option value="all">All certificate groups</option>
        </select>
        <span class="cert-result-count" aria-live="polite"></span>
      `;
      (intro || certSection.querySelector('h2')).insertAdjacentElement('afterend', toolbar);

      const search = toolbar.querySelector('#certSearch');
      const select = toolbar.querySelector('#certGroupFilter');
      const count = toolbar.querySelector('.cert-result-count');

      groups.forEach((group, index) => {
        const title = group.querySelector('.certificate-group-heading h3')?.textContent.trim() || `Group ${index + 1}`;
        group.dataset.certGroup = String(index);
        const option = document.createElement('option');
        option.value = String(index);
        option.textContent = title;
        select.appendChild(option);
      });

      const applyFilter = () => {
        const query = search.value.trim().toLowerCase();
        const selected = select.value;
        let shown = 0;

        groups.forEach((group, index) => {
          let groupShown = 0;
          [...group.querySelectorAll('.cert-card-modern')].forEach((card) => {
            const groupMatch = selected === 'all' || selected === String(index);
            const textMatch = !query || card.textContent.toLowerCase().includes(query);
            const match = groupMatch && textMatch;
            card.hidden = !match;
            if (match) {
              groupShown += 1;
              shown += 1;
            }
          });
          group.hidden = groupShown === 0;
        });

        count.textContent = `${shown} of ${cards.length} certificates`;
      };

      search.addEventListener('input', applyFilter);
      select.addEventListener('change', applyFilter);
      applyFilter();
    }

    // Close mobile menu when clicking outside it.
    document.addEventListener('pointerdown', (event) => {
      if (!mobileMenu || !mobileToggle || !mobileMenu.classList.contains('active')) return;
      if (mobileMenu.contains(event.target) || mobileToggle.contains(event.target)) return;
      mobileMenu.classList.remove('active');
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.setAttribute('aria-label', 'Open navigation menu');
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready, { once: true });
  } else {
    ready();
  }
})();
