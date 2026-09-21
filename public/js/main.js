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
        window.location.reload();
      }
    });
  });

  // -------------------------------------------------------
  // 11. Enterprise Glassmorphic Custom Dropdown Engine
  // -------------------------------------------------------
  function initCustomSelects() {
    const selects = document.querySelectorAll('select.form-input, select.form-control, select.filter-select, select[data-custom-select]');
    
    selects.forEach((select) => {
      // Prevent duplicate wrapping
      if (select.closest('.custom-select-wrapper')) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'custom-select-wrapper';
      if (select.classList.contains('filter-select')) {
        wrapper.classList.add('filter-select-wrapper');
      }

      // Preserve existing inline width / flex if set
      if (select.style.width && select.style.width !== '100%') {
        wrapper.style.width = select.style.width;
      }

      // Insert wrapper before select, then move select inside
      select.parentNode.insertBefore(wrapper, select);
      wrapper.appendChild(select);
      select.classList.add('custom-select-native');

      // Create Custom Trigger
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'custom-select-trigger';
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');

      const triggerText = document.createElement('span');
      triggerText.className = 'custom-select-trigger-text';
      
      const arrowIcon = document.createElement('span');
      arrowIcon.className = 'custom-select-arrow';
      arrowIcon.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

      trigger.appendChild(triggerText);
      trigger.appendChild(arrowIcon);
      wrapper.appendChild(trigger);

      // Handle HTML5 validation states
      select.addEventListener('invalid', () => {
        trigger.classList.add('is-invalid');
        trigger.focus();
      });

      // Create Custom Dropdown Menu
      const dropdown = document.createElement('div');
      dropdown.className = 'custom-select-dropdown';
      dropdown.setAttribute('role', 'listbox');

      // Search wrap for long lists
      let searchInput = null;
      if (select.options.length > 5) {
        const searchWrap = document.createElement('div');
        searchWrap.className = 'custom-select-search-wrap';
        searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'custom-select-search-input';
        searchInput.placeholder = select.getAttribute('data-search-placeholder') || 'Filter options...';
        searchWrap.appendChild(searchInput);
        dropdown.appendChild(searchWrap);

        searchInput.addEventListener('input', (e) => {
          const term = e.target.value.toLowerCase().trim();
          dropdown.querySelectorAll('.custom-select-item').forEach(item => {
            const txt = item.textContent.toLowerCase();
            item.style.display = txt.includes(term) ? 'flex' : 'none';
          });
        });

        searchWrap.addEventListener('click', (e) => e.stopPropagation());
      }

      const optionsList = document.createElement('div');
      optionsList.className = 'custom-select-options-list';
      dropdown.appendChild(optionsList);
      wrapper.appendChild(dropdown);

      function renderOptions() {
        optionsList.innerHTML = '';
        const options = Array.from(select.options);
        const selectedIndex = select.selectedIndex >= 0 ? select.selectedIndex : 0;
        const currentOption = options[selectedIndex];

        triggerText.textContent = currentOption ? currentOption.text.trim() : (select.getAttribute('placeholder') || 'Select...');
        if (currentOption && currentOption.disabled && !currentOption.value) {
          trigger.classList.add('placeholder-active');
        } else {
          trigger.classList.remove('placeholder-active');
        }

        options.forEach((opt, idx) => {
          if (opt.disabled && !opt.value) {
            // Skip disabled empty placeholder from dropdown list
            return;
          }
          const item = document.createElement('div');
          item.className = 'custom-select-item';
          if (idx === select.selectedIndex) {
            item.classList.add('selected');
          }

          const labelBox = document.createElement('div');
          labelBox.className = 'item-label-group';

          const mainLabel = document.createElement('div');
          mainLabel.className = 'item-main-label';
          mainLabel.textContent = opt.text.trim();
          labelBox.appendChild(mainLabel);

          const subtext = opt.getAttribute('data-subtext') || opt.getAttribute('data-address');
          if (subtext) {
            const subLabel = document.createElement('div');
            subLabel.className = 'item-sub-label';
            subLabel.textContent = subtext;
            labelBox.appendChild(subLabel);
          }

          const checkmark = document.createElement('span');
          checkmark.className = 'item-check';
          checkmark.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

          item.appendChild(labelBox);
          item.appendChild(checkmark);

          item.addEventListener('click', (e) => {
            e.stopPropagation();
            select.selectedIndex = idx;
            select.value = opt.value;
            trigger.classList.remove('is-invalid');
            if (typeof select.onchange === 'function') {
              try { select.onchange(); } catch (err) { console.error(err); }
            }
            select.dispatchEvent(new Event('change', { bubbles: true }));
            renderOptions();
            closeDropdown();
          });

          optionsList.appendChild(item);
        });
      }

      function openDropdown() {
        // Close all other open custom dropdowns first
        document.querySelectorAll('.custom-select-wrapper.open').forEach(w => {
          if (w !== wrapper) {
            w.classList.remove('open');
            const tr = w.querySelector('.custom-select-trigger');
            if (tr) tr.setAttribute('aria-expanded', 'false');
          }
        });

        wrapper.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        trigger.classList.remove('is-invalid');
        if (searchInput) {
          searchInput.value = '';
          dropdown.querySelectorAll('.custom-select-item').forEach(i => i.style.display = 'flex');
          setTimeout(() => searchInput.focus(), 50);
        }
      }

      function closeDropdown() {
        wrapper.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      }

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (wrapper.classList.contains('open')) {
          closeDropdown();
        } else {
          openDropdown();
        }
      });

      select.addEventListener('change', () => {
        renderOptions();
      });

      renderOptions();
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.custom-select-wrapper')) {
        document.querySelectorAll('.custom-select-wrapper.open').forEach(w => {
          w.classList.remove('open');
          const tr = w.querySelector('.custom-select-trigger');
          if (tr) tr.setAttribute('aria-expanded', 'false');
        });
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.custom-select-wrapper.open').forEach(w => {
          w.classList.remove('open');
          const tr = w.querySelector('.custom-select-trigger');
          if (tr) tr.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }

  window.initCustomSelects = initCustomSelects;
  initCustomSelects();

});

