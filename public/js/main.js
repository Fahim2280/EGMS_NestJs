document.addEventListener('DOMContentLoaded', () => {

  // -------------------------------------------------------
  // 1. Sidebar & Mobile Drawer Toggle
  // -------------------------------------------------------
  const sidebar = document.getElementById('appSidebar');
  const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');

  const openSidebar = () => {
    if (sidebar) sidebar.classList.add('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
  };

  const closeSidebar = () => {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
  };

  const mobileBottomMenuBtn = document.getElementById('mobileBottomMenuBtn');

  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (sidebar && sidebar.classList.contains('open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (mobileBottomMenuBtn) {
    mobileBottomMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (sidebar && sidebar.classList.contains('open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener('click', closeSidebar);
  }

  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', closeSidebar);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });

  // Legacy mobileDrawer fallback (for standalone layout)
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileMenuClose = document.getElementById('mobileMenuClose');

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileDrawer.classList.toggle('open');
    });
    if (mobileMenuClose) {
      mobileMenuClose.addEventListener('click', () => mobileDrawer.classList.remove('open'));
    }
    document.addEventListener('click', (e) => {
      if (
        mobileDrawer.classList.contains('open') &&
        !mobileDrawer.contains(e.target) &&
        e.target !== mobileMenuBtn
      ) {
        mobileDrawer.classList.remove('open');
      }
    });
  }

  // -------------------------------------------------------
  // 2. Quick Fill Demo Credentials (login screen)
  // -------------------------------------------------------
  const quickFillBtns = document.querySelectorAll('.quick-fill-btn');
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');

  quickFillBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const email = btn.getAttribute('data-email');
      const pass = btn.getAttribute('data-pass');
      if (emailInput && passwordInput) {
        emailInput.value = email;
        passwordInput.value = pass;
        emailInput.style.borderColor = 'rgba(99, 102, 241, 0.6)';
        passwordInput.style.borderColor = 'rgba(99, 102, 241, 0.6)';
        setTimeout(() => {
          emailInput.style.borderColor = '';
          passwordInput.style.borderColor = '';
        }, 700);
      }
    });
  });

  // -------------------------------------------------------
  // 3. Auto-dismiss ALL Toast Notifications
  // -------------------------------------------------------
  document.querySelectorAll('.toast').forEach((toast, i) => {
    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(30px)';
      setTimeout(() => toast.remove(), 400);
    }, 4000 + i * 500);
  });

  // -------------------------------------------------------
  // 4. Query-string Flash Banner (?success=... or ?error=...)
  // -------------------------------------------------------
  const urlParams = new URLSearchParams(window.location.search);
  const successMsg = urlParams.get('success');
  const errorMsg = urlParams.get('error');

  if (successMsg || errorMsg) {
    const banner = document.createElement('div');
    banner.className = `page-flash ${successMsg ? 'success' : 'error'}`;
    banner.innerHTML = `${successMsg ? '✅' : '⚠️'} <span>${decodeURIComponent(successMsg || errorMsg).replace(/\+/g, ' ')}</span>`;
    const mainContent = document.querySelector('.main-content .container');
    if (mainContent) {
      mainContent.insertBefore(banner, mainContent.firstChild);
      setTimeout(() => {
        banner.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(-8px)';
        setTimeout(() => banner.remove(), 500);
      }, 4000);
    }
    // Remove query params from URL without reload
    const cleanUrl = window.location.pathname + (urlParams.size > 2 ? '?' + urlParams.toString() : '');
    history.replaceState(null, '', cleanUrl);
  }

  // -------------------------------------------------------
  // 5. Animated Number Count-up for Stat Cards
  // -------------------------------------------------------
  const countUp = (el, target, duration = 1000) => {
    const isFloat = target % 1 !== 0;
    const decimals = isFloat ? String(target).split('.')[1]?.length || 0 : 0;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = ease * target;
      el.textContent = decimals > 0
        ? current.toFixed(decimals)
        : Math.floor(current).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Observe stat values entering viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const raw = el.dataset.value || el.textContent.replace(/[^0-9.]/g, '');
        const num = parseFloat(raw);
        if (!isNaN(num) && num > 0) {
          countUp(el, num, 900);
        }
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.stat-value[data-value], .stat-value').forEach(el => {
    // Store original value so count-up can parse it
    if (!el.dataset.value) {
      el.dataset.value = el.textContent.replace(/[^0-9.]/g, '');
    }
    observer.observe(el);
  });

  // -------------------------------------------------------
  // 6. Auto-submit Filter & Sort Selects
  // -------------------------------------------------------
  document.querySelectorAll('.select-filter').forEach((select) => {
    select.addEventListener('change', () => {
      const form = select.closest('form');
      if (form) form.submit();
    });
  });

  // -------------------------------------------------------
  // 7. Confirm Dangerous Actions
  // -------------------------------------------------------
  document.querySelectorAll('[data-confirm]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (!confirm(btn.dataset.confirm)) {
        e.preventDefault();
      }
    });
  });

  // -------------------------------------------------------
  // 8. Smooth table row click navigation
  // -------------------------------------------------------
  document.querySelectorAll('tr[data-href]').forEach(row => {
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => {
      window.location.href = row.dataset.href;
    });
  });

  // -------------------------------------------------------
  // 9. Theme Switcher (Dark Mode / Light Mode)
  // -------------------------------------------------------
  const updateThemeUI = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      const sun = btn.querySelector('.theme-icon-sun');
      const moon = btn.querySelector('.theme-icon-moon');
      if (theme === 'light') {
        if (sun) sun.style.display = 'none';
        if (moon) moon.style.display = 'block';
        btn.setAttribute('title', 'Switch to Dark Mode');
      } else {
        if (sun) sun.style.display = 'block';
        if (moon) moon.style.display = 'none';
        btn.setAttribute('title', 'Switch to Light Mode');
      }
    });
  };

  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      localStorage.setItem('egms_theme', next);
      document.cookie = 'theme=' + next + '; path=/; max-age=31536000; SameSite=Lax';
      updateThemeUI(next);
    });
  });

  // -------------------------------------------------------
  // 10. Language Switcher Sync
  // -------------------------------------------------------
  document.querySelectorAll('.lang-switch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetLang = btn.getAttribute('data-lang');
      if (targetLang) {
        localStorage.setItem('egms_lang', targetLang);
        document.cookie = 'lang=' + targetLang + '; path=/; max-age=31536000; SameSite=Lax';
      }
    });
  });

});

