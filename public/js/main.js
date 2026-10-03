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
  // 3. Auto-dismiss & Tap-to-dismiss Toast Notifications
  // -------------------------------------------------------
  document.querySelectorAll('.toast').forEach((toast, i) => {
    // Tap or click anywhere on toast to dismiss
    toast.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
        toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        toast.style.opacity = '0';
        toast.style.transform = window.innerWidth <= 768 ? 'translateY(-20px)' : 'translateX(30px)';
        setTimeout(() => { if (toast && toast.parentNode) toast.remove(); }, 250);
      }
    });

    setTimeout(() => {
      if (toast && toast.parentNode) {
        toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        toast.style.opacity = '0';
        toast.style.transform = window.innerWidth <= 768 ? 'translateY(-20px)' : 'translateX(30px)';
        setTimeout(() => {
          if (toast && toast.parentNode) toast.remove();
        }, 400);
      }
    }, 4500 + i * 500);
  });

  // -------------------------------------------------------
  // 4. Query-string Flash Banner (?success=... or ?error=...)
  // -------------------------------------------------------
  const urlParams = new URLSearchParams(window.location.search);
  const successMsg = urlParams.get('success');
  const errorMsg = urlParams.get('error');
  const infoMsg = urlParams.get('info') || urlParams.get('message');

  const safeDecode = (val) => {
    if (!val) return '';
    try {
      return decodeURIComponent(val.replace(/\+/g, ' '));
    } catch (e) {
      return val.replace(/\+/g, ' ');
    }
  };

  if (successMsg || errorMsg || infoMsg) {
    const rawVal = successMsg || errorMsg || infoMsg;
    const isSuccess = Boolean(successMsg);
    const isError = Boolean(errorMsg);
    const banner = document.createElement('div');
    banner.className = `page-flash ${isSuccess ? 'success' : isError ? 'error' : 'info'}`;
    const icon = isSuccess ? '✅' : isError ? '⚠️' : 'ℹ️';
    const cleanText = safeDecode(rawVal);
    banner.innerHTML = `${icon} <span style="flex:1;">${cleanText}</span><button type="button" class="alert-banner-close" onclick="this.closest('.page-flash').remove()">&times;</button>`;
    
    // Check if an in-page banner already exists from server-side render
    const existingServerBanner = document.getElementById('inPageAlertBanner');
    if (!existingServerBanner) {
      const mainContent =
        document.querySelector('.main-content .app-container') ||
        document.querySelector('.main-content .container') ||
        document.querySelector('.app-container') ||
        document.querySelector('.container') ||
        document.querySelector('.main-content');
      if (mainContent) {
        mainContent.insertBefore(banner, mainContent.firstChild);
        setTimeout(() => {
          if (banner && banner.parentNode) {
            banner.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            banner.style.opacity = '0';
            banner.style.transform = 'translateY(-8px)';
            setTimeout(() => {
              if (banner && banner.parentNode) banner.remove();
            }, 500);
          }
        }, 4500);
      }
    }

    // Clean only message parameters without clearing other filters
    urlParams.delete('success');
    urlParams.delete('error');
    urlParams.delete('info');
    urlParams.delete('message');
    const qs = urlParams.toString();
    const cleanUrl = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash;
    history.replaceState(null, '', cleanUrl);
  }

  // -------------------------------------------------------
  // 5. Animated Number Count-up for Stat Cards
  // -------------------------------------------------------
  const currentLang = document.documentElement.getAttribute('lang') || 'en';
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const toBn = (num) => String(num).replace(/[0-9]/g, (d) => bnDigits[d]);
  const parseNum = (str) => {
    const bnMap = { '০':'0', '১':'1', '২':'2', '৩':'3', '৪':'4', '৫':'5', '৬':'6', '৭':'7', '৮':'8', '৯':'9' };
    return String(str || '').replace(/[০-৯]/g, (d) => bnMap[d]).replace(/[^0-9.]/g, '');
  };

  const countUp = (el, target, duration = 1000) => {
    const isFloat = target % 1 !== 0;
    const decimals = isFloat ? String(target).split('.')[1]?.length || 0 : 0;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = ease * target;
      const formatted = decimals > 0
        ? current.toFixed(decimals)
        : Math.floor(current).toLocaleString();
      el.textContent = currentLang === 'bn' ? toBn(formatted) : formatted;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const raw = el.dataset.value || parseNum(el.textContent);
        const num = parseFloat(raw);
        if (!isNaN(num) && num > 0) {
          countUp(el, num, 900);
        }
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.stat-value[data-value], .stat-value').forEach(el => {
    if (!el.dataset.value) {
      el.dataset.value = parseNum(el.textContent);
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
    const selects = document.querySelectorAll('select.form-input, select.form-control, select.filter-select, select.dfb-select, select[data-custom-select]');
    
    selects.forEach((select) => {
      // Prevent duplicate wrapping
      if (select.closest('.custom-select-wrapper')) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'custom-select-wrapper';
      if (select.classList.contains('filter-select')) {
        wrapper.classList.add('filter-select-wrapper');
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

      // Preserve existing inline width / flex / minWidth if set (now safe after trigger declaration)
      if (select.style.width && select.style.width !== '100%') {
        wrapper.style.width = select.style.width;
      }
      if (select.style.minWidth) {
        wrapper.style.minWidth = select.style.minWidth;
        trigger.style.minWidth = select.style.minWidth;
      }
      if (select.style.flex) {
        wrapper.style.flex = select.style.flex;
      }

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
          // Only auto-focus on desktop screens to avoid soft keyboard pop & unwanted page shifts
          if (window.innerWidth > 640) {
            setTimeout(() => {
              try {
                searchInput.focus({ preventScroll: true });
              } catch (e) {
                searchInput.focus();
              }
            }, 50);
          }
        }

        // ---- Viewport-overflow & Mobile Sizing Engine ----
        dropdown.style.removeProperty('width');
        dropdown.style.removeProperty('max-width');
        dropdown.style.removeProperty('min-width');
        dropdown.style.removeProperty('left');
        dropdown.style.removeProperty('right');
        dropdown.style.removeProperty('box-sizing');

        requestAnimationFrame(() => {
          const vw = document.documentElement.clientWidth || window.innerWidth;
          const isMobile = vw <= 768;
          const wrapperRect = wrapper.getBoundingClientRect();

          if (isMobile) {
            // Mobile: match the dropdown 100% to wrapper or bounded within screen so it never overflows
            if (wrapperRect.width >= vw - 80 || wrapper.classList.contains('filter-select-wrapper') || wrapper.closest('.dfb-group') || isMobile) {
              dropdown.style.setProperty('left', '0px', 'important');
              dropdown.style.setProperty('right', '0px', 'important');
              dropdown.style.setProperty('width', '100%', 'important');
              dropdown.style.setProperty('min-width', '100%', 'important');
              dropdown.style.setProperty('max-width', '100%', 'important');
              dropdown.style.setProperty('box-sizing', 'border-box', 'important');
            } else {
              // Non-full-width mobile select: clamp so it never overflows right edge
              const maxW = Math.min(vw - 20, Math.max(160, vw - wrapperRect.left - 10));
              dropdown.style.setProperty('left', '0px', 'important');
              dropdown.style.setProperty('max-width', maxW + 'px', 'important');
              dropdown.style.setProperty('box-sizing', 'border-box', 'important');
            }
          } else {
            // Desktop: if dropdown bleeds past right viewport edge, shift it left
            const dropRect = dropdown.getBoundingClientRect();
            if (dropRect.right > vw - 8) {
              const overflow = dropRect.right - (vw - 8);
              const currentLeft = parseFloat(getComputedStyle(dropdown).left) || 0;
              const newLeft = Math.max(0, currentLeft - overflow);
              dropdown.style.setProperty('left', newLeft + 'px', 'important');
            }
          }
        });
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

/* ================================================================
   DATE FILTER BAR — Global Helpers
   Exported to window so HBS onclick attributes can call them.
   ================================================================ */

/**
 * Sets fromDate and toDate inputs in the form identified by formId
 * based on the provided preset string, then submits the form.
 * @param {'today'|'thisMonth'|'lastMonth'|'last30'|'thisYear'|'all'} preset
 * @param {string} formId  — ID of the <form> element
 */
window.setDatePreset = function setDatePreset(preset, formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  const fromInput = form.querySelector('[name="fromDate"]');
  const toInput   = form.querySelector('[name="toDate"]');
  const presetInput = document.getElementById(formId + '_preset');

  const now   = new Date();
  const pad   = (n) => String(n).padStart(2, '0');
  const fmt   = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = fmt(now);

  let from = '', to = today;

  switch (preset) {
    case 'today':
      from = today;
      break;
    case 'thisMonth':
      from = fmt(new Date(now.getFullYear(), now.getMonth(), 1));
      break;
    case 'lastMonth': {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      from = fmt(lm);
      to   = fmt(new Date(now.getFullYear(), now.getMonth(), 0));
      break;
    }
    case 'last30': {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      from = fmt(d);
      break;
    }
    case 'thisYear':
      from = `${now.getFullYear()}-01-01`;
      break;
    case 'all':
      from = '';
      to   = '';
      break;
    default:
      return;
  }

  if (fromInput) fromInput.value = from;
  if (toInput)   toInput.value   = to;
  if (presetInput) presetInput.value = preset;

  form.submit();
};

/**
 * Clears the hidden preset field when the user manually changes a date input.
 * @param {string} formId  — ID of the <form> element
 */
window.clearPreset = function clearPreset(formId) {
  const presetInput = document.getElementById(formId + '_preset');
  if (presetInput) presetInput.value = '';
};

/**
 * Toggles the mobile filter drawer (adds/removes .dfb-open class).
 * Also updates the toggle button chevron and label.
 * @param {string} formId  — ID of the <form> element to toggle
 */
window.toggleFilterDrawer = function toggleFilterDrawer(formId) {
  const form   = document.getElementById(formId);
  if (!form) return;

  const wrapper  = form.closest('.card, .dfb-wrapper') || form.parentElement;
  const toggle   = wrapper ? wrapper.querySelector('.dfb-mobile-toggle') : null;

  const isOpen = form.classList.toggle('dfb-open');
  if (toggle) {
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }
};

// =======================================================
// ============================================================
// Desktop Top Horizontal Scrollbar for Responsive Data Tables
// ============================================================
function initTableTopScrollbars() {
  const wrappers = document.querySelectorAll('.table-responsive');
  if (!wrappers.length) return;

  wrappers.forEach((wrapper) => {
    if (wrapper.dataset.topScrollbarInit) return;
    wrapper.dataset.topScrollbarInit = 'true';

    const table = wrapper.querySelector('table');
    if (!table) return;

    // Create the top scrollbar container
    const topBar = document.createElement('div');
    topBar.className = 'table-scrollbar-top';
    topBar.setAttribute('aria-hidden', 'true');

    const topInner = document.createElement('div');
    topInner.className = 'table-scrollbar-top-inner';
    topBar.appendChild(topInner);

    // Insert directly before the table-responsive wrapper
    wrapper.parentNode.insertBefore(topBar, wrapper);

    let activeScroller = null;
    let scrollTimeout = null;

    topBar.addEventListener('scroll', () => {
      if (activeScroller === 'bottom') return;
      activeScroller = 'top';
      wrapper.scrollLeft = topBar.scrollLeft;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => { activeScroller = null; }, 100);
    }, { passive: true });

    wrapper.addEventListener('scroll', () => {
      if (activeScroller === 'top') return;
      activeScroller = 'bottom';
      topBar.scrollLeft = wrapper.scrollLeft;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => { activeScroller = null; }, 100);
    }, { passive: true });

    const updateWidth = () => {
      const scrollW = Math.max(table.scrollWidth, table.offsetWidth, wrapper.scrollWidth);
      const clientW = wrapper.clientWidth;

      topInner.style.width = scrollW + 'px';

      // Only show on desktop screens (> 768px) when content actually overflows
      if (window.innerWidth > 768 && scrollW > clientW + 2) {
        topBar.style.display = 'block';
        topBar.scrollLeft = wrapper.scrollLeft;
      } else {
        topBar.style.display = 'none';
      }
    };

    updateWidth();

    // ResizeObserver watches for dynamic content & window resize changes
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => updateWidth());
      ro.observe(table);
      ro.observe(wrapper);
    }

    window.addEventListener('resize', updateWidth, { passive: true });
    window.addEventListener('load', updateWidth, { passive: true });
  });
}

// =======================================================
// Password Visibility Toggle
// =======================================================
function initPasswordToggles() {
  document.querySelectorAll('.password-toggle-btn').forEach(btn => {
    if (btn.dataset.pwdInit) return;
    btn.dataset.pwdInit = 'true';

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const wrapper = this.closest('.password-input-wrapper');
      if (!wrapper) return;
      const input = wrapper.querySelector('input');
      if (!input) return;

      const eyeIcon = this.querySelector('.eye-icon');
      const eyeOffIcon = this.querySelector('.eye-off-icon');

      if (input.type === 'password') {
        input.type = 'text';
        this.setAttribute('aria-label', 'Hide password');
        if (eyeIcon) eyeIcon.style.display = 'none';
        if (eyeOffIcon) eyeOffIcon.style.display = 'block';
      } else {
        input.type = 'password';
        this.setAttribute('aria-label', 'Show password');
        if (eyeIcon) eyeIcon.style.display = 'block';
        if (eyeOffIcon) eyeOffIcon.style.display = 'none';
      }
      input.focus();
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initPasswordToggles();
    initAuditNotifications();
    initConfirmModal();
    initTableTopScrollbars();
  });
} else {
  initPasswordToggles();
  initAuditNotifications();
  initConfirmModal();
  initTableTopScrollbars();
}

// ============================================================
// Super Admin Audit Log Notification System
// ============================================================
function initAuditNotifications() {
  const notifBtn = document.getElementById('auditNotifBtn');
  const notifDropdown = document.getElementById('auditNotifDropdown');
  const notifBadge = document.getElementById('auditNotifBadge');
  const notifPulse = document.getElementById('auditNotifPulse');
  const notifPill = document.getElementById('auditNotifPill');
  const notifList = document.getElementById('auditNotifList');
  const markReadBtn = document.getElementById('auditNotifMarkReadBtn');

  if (!notifBtn || !notifDropdown) return; // Only runs if Super Admin bell is present

  const STORAGE_KEY = 'egms_audit_last_read';
  const isBn = document.documentElement.getAttribute('lang') === 'bn';

  function toBnDigits(str) {
    const digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(str).replace(/[0-9]/g, (d) => digits[parseInt(d, 10)]);
  }

  function formatTimeAgo(isoDate) {
    if (!isoDate) return '';
    const now = Date.now();
    const past = new Date(isoDate).getTime();
    const diffSec = Math.max(0, Math.floor((now - past) / 1000));

    if (diffSec < 60) {
      return isBn ? 'এইমাত্র' : 'Just now';
    }
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) {
      return isBn ? `${toBnDigits(diffMin)} মিনিট আগে` : `${diffMin}m ago`;
    }
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) {
      return isBn ? `${toBnDigits(diffHours)} ঘণ্টা আগে` : `${diffHours}h ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return isBn ? `${toBnDigits(diffDays)} দিন আগে` : `${diffDays}d ago`;
  }

  function getActionBadge(action) {
    const badges = {
      CREATE: { label: isBn ? 'তৈরি' : 'CREATE', icon: '➕', color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)' },
      UPDATE: { label: isBn ? 'আপডেট' : 'UPDATE', icon: '✏️', color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)' },
      DELETE: { label: isBn ? 'মুছে ফেলা' : 'DELETE', icon: '🗑️', color: '#fb7185', bg: 'rgba(244, 63, 94, 0.15)' },
      LOGIN: { label: isBn ? 'লগইন' : 'LOGIN', icon: '🔑', color: '#c084fc', bg: 'rgba(168, 85, 247, 0.15)' },
      LOGOUT: { label: isBn ? 'লগআউট' : 'LOGOUT', icon: '🚪', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' },
      PERMISSIONS_UPDATE: { label: isBn ? 'পারমিশন' : 'PERMISSION', icon: '🛡️', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)' },
      PASSWORD_RESET: { label: isBn ? 'রিসেট' : 'RESET', icon: '🔒', color: '#f472b6', bg: 'rgba(236, 72, 153, 0.15)' },
    };
    const b = badges[action] || { label: action, icon: '⚡', color: '#818cf8', bg: 'rgba(99, 102, 241, 0.15)' };
    return `<span style="display:inline-flex;align-items:center;gap:3px;font-size:0.68rem;font-weight:700;padding:1px 6px;border-radius:4px;background:${b.bg};color:${b.color};">${b.icon} ${b.label}</span>`;
  }

  function getEntityBadge(entityType) {
    const entities = {
      CUSTOMER: isBn ? 'গ্রাহক' : 'Customer',
      ELECTRIC_BILL: isBn ? 'বিদ্যুৎ বিল' : 'Bill',
      GARAGE: isBn ? 'গ্যারেজ' : 'Garage',
      EMPLOYEE: isBn ? 'কর্মী' : 'Employee',
      AUTH: isBn ? 'নিরাপত্তা' : 'Auth',
      COMPANY: isBn ? 'কোম্পানি' : 'Company',
    };
    const label = entities[entityType] || entityType;
    return `<span style="display:inline-flex;align-items:center;font-size:0.66rem;font-weight:600;padding:1px 5px;border-radius:3px;background:rgba(99,102,241,0.12);color:#a5b4fc;">${label}</span>`;
  }

  async function fetchNotifications() {
    try {
      const lastRead = localStorage.getItem(STORAGE_KEY) || '';
      const url = '/audit-logs/notifications/recent' + (lastRead ? `?since=${encodeURIComponent(lastRead)}` : '');
      const res = await fetch(url, { credentials: 'same-origin' });
      if (!res.ok) return;
      const data = await res.json();

      const unreadCount = data.unreadCount || 0;
      if (unreadCount > 0) {
        const displayCount = unreadCount > 99 ? '99+' : (isBn ? toBnDigits(unreadCount) : String(unreadCount));
        if (notifBadge) {
          notifBadge.textContent = displayCount;
          notifBadge.style.display = 'flex';
        }
        if (notifPulse) notifPulse.style.display = 'block';
        if (notifPill) {
          notifPill.textContent = isBn ? `${toBnDigits(unreadCount)} নতুন` : `${unreadCount} new`;
          notifPill.style.display = 'inline-block';
        }
      } else {
        if (notifBadge) notifBadge.style.display = 'none';
        if (notifPulse) notifPulse.style.display = 'none';
        if (notifPill) notifPill.style.display = 'none';
      }

      if (notifList && data.logs) {
        if (data.logs.length === 0) {
          notifList.innerHTML = `
            <div style="padding: 2rem 1rem; text-align: center; color: var(--color-text-muted); font-size: 0.85rem;">
              <div style="font-size: 1.5rem; margin-bottom: 0.35rem;">🛡️</div>
              <div>${isBn ? 'নতুন কোন অডিট নোটিফিকেশন নেই' : 'No recent audit alerts'}</div>
            </div>`;
          return;
        }

        const lastReadTimestamp = lastRead ? new Date(lastRead).getTime() : 0;
        let html = '';
        data.logs.forEach((log) => {
          const logTime = new Date(log.createdDate).getTime();
          const isUnread = logTime > lastReadTimestamp;
          const displayDetails = isBn ? (log.detailsBn || log.details) : log.details;
          const subDetails = isBn && log.details !== displayDetails ? log.details : '';
          const timeAgo = formatTimeAgo(log.createdDate);
          const initial = log.userName && log.userName[0] ? log.userName[0].toUpperCase() : 'U';

          html += `
            <a href="/audit-logs?search=${encodeURIComponent(log.userName || '')}&action=${encodeURIComponent(log.action || 'ALL')}" class="audit-notif-item ${isUnread ? 'is-unread' : ''}">
              <div class="audit-notif-avatar">${initial}</div>
              <div class="audit-notif-content">
                <div class="audit-notif-top">
                  <span class="audit-notif-user">${log.userName || (isBn ? 'ব্যবহারকারী' : 'User')}</span>
                  <span class="audit-notif-time">${timeAgo}</span>
                </div>
                <div class="audit-notif-badges">
                  ${getActionBadge(log.action)}
                  ${getEntityBadge(log.entityType)}
                </div>
                <div class="audit-notif-details">${displayDetails}</div>
                ${subDetails ? `<div class="audit-notif-details-sub">${subDetails}</div>` : ''}
              </div>
            </a>`;
        });
        notifList.innerHTML = html;
      }
    } catch (e) {
      // Non-blocking fallback
    }
  }

  // Toggle Dropdown
  notifBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isHidden = notifDropdown.style.display === 'none' || !notifDropdown.style.display;
    if (isHidden) {
      notifDropdown.style.display = 'flex';
      notifBtn.classList.add('active');
      fetchNotifications();
    } else {
      notifDropdown.style.display = 'none';
      notifBtn.classList.remove('active');
    }
  });

  // Dedicated Close Button (especially for mobile)
  const closeBtn = document.getElementById('auditNotifCloseBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      notifDropdown.style.display = 'none';
      notifBtn.classList.remove('active');
    });
  }

  // Prevent taps inside dropdown from bubbling and closing it
  notifDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Mark all read
  if (markReadBtn) {
    markReadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
      if (notifBadge) notifBadge.style.display = 'none';
      if (notifPulse) notifPulse.style.display = 'none';
      if (notifPill) notifPill.style.display = 'none';
      document.querySelectorAll('.audit-notif-item.is-unread').forEach((el) => {
        el.classList.remove('is-unread');
      });
    });
  }

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (notifDropdown.style.display === 'flex' && !notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
      notifDropdown.style.display = 'none';
      notifBtn.classList.remove('active');
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && notifDropdown.style.display === 'flex') {
      notifDropdown.style.display = 'none';
      notifBtn.classList.remove('active');
    }
  });

  // Initial fetch and poll every 45 seconds
  fetchNotifications();
  setInterval(fetchNotifications, 45000);
}

// ============================================================
// Universal Modern Confirmation Modal Dialog
// ============================================================
function initConfirmModal() {
  const modal = document.getElementById('appConfirmModal');
  const closeBtn = document.getElementById('confirmModalCloseBtn');
  const cancelBtn = document.getElementById('confirmModalCancelBtn');
  const submitBtn = document.getElementById('confirmModalSubmitBtn');
  const submitText = document.getElementById('confirmModalSubmitText');
  const submitIcon = document.getElementById('confirmModalSubmitIcon');
  const titleEl = document.getElementById('confirmModalTitle');
  const descEl = document.getElementById('confirmModalDesc');
  const iconBadge = document.getElementById('confirmModalIconBadge');
  const iconEl = document.getElementById('confirmModalIcon');
  const previewBox = document.getElementById('confirmModalPreview');
  const avatarEl = document.getElementById('confirmModalAvatar');
  const targetNameEl = document.getElementById('confirmModalTargetName');
  const targetSubEl = document.getElementById('confirmModalTargetSub');
  const targetBadgeEl = document.getElementById('confirmModalTargetBadge');
  const calloutBox = document.getElementById('confirmModalCallout');
  const calloutIcon = document.getElementById('confirmModalCalloutIcon');
  const calloutText = document.getElementById('confirmModalCalloutText');

  if (!modal || !submitBtn) return;

  let activeCallback = null;

  function closeModal() {
    modal.style.display = 'none';
    activeCallback = null;
    document.body.style.overflow = '';
  }

  function openModal(options) {
    options = options || {};
    activeCallback = typeof options.onConfirm === 'function' ? options.onConfirm : null;

    // Title & Description
    if (titleEl) titleEl.textContent = options.title || 'Confirm Action';
    if (descEl) descEl.textContent = options.desc || options.message || '';

    // Icon & Badge type: 'warning' | 'danger' | 'success' | 'info'
    const type = options.type || 'warning';
    if (iconBadge) {
      iconBadge.className = `confirm-modal-icon-badge type-${type}`;
      if (iconEl) {
        if (options.icon) {
          iconEl.textContent = options.icon;
        } else if (type === 'danger') {
          iconEl.textContent = '⛔';
        } else if (type === 'success') {
          iconEl.textContent = '✅';
        } else {
          iconEl.textContent = '⚠️';
        }
      }
    }

    // Callout warning / notice
    if (calloutBox) {
      const calloutMsg = options.calloutText || options.warning;
      if (calloutMsg) {
        calloutBox.className = `confirm-modal-callout type-${type}`;
        if (calloutIcon) calloutIcon.textContent = options.calloutIcon || (type === 'danger' ? '🚫' : type === 'success' ? '✨' : '⚠️');
        if (calloutText) calloutText.textContent = calloutMsg;
        calloutBox.style.display = 'flex';
      } else {
        calloutBox.style.display = 'none';
      }
    }

    // Target Preview (e.g. customer/employee preview)
    if (previewBox) {
      if (options.targetName) {
        if (targetNameEl) targetNameEl.textContent = options.targetName;
        if (targetSubEl) {
          targetSubEl.innerHTML = options.targetSub || '';
        }
        if (avatarEl) {
          const trimmed = String(options.targetName).trim();
          avatarEl.textContent = options.targetAvatar || (trimmed[0] ? trimmed[0].toUpperCase() : 'U');
        }
        if (targetBadgeEl) {
          if (options.targetBadgeHtml) {
            targetBadgeEl.innerHTML = options.targetBadgeHtml;
          } else if (options.targetBadgeText) {
            targetBadgeEl.innerHTML = `<span class="badge ${options.targetBadgeClass || 'badge-warning'}">${options.targetBadgeText}</span>`;
          } else {
            targetBadgeEl.innerHTML = '';
          }
        }
        previewBox.style.display = 'flex';
      } else {
        previewBox.style.display = 'none';
      }
    }

    // Buttons
    if (cancelBtn) {
      if (options.cancelText) cancelBtn.textContent = options.cancelText;
    }
    if (submitBtn) {
      submitBtn.className = `btn confirm-submit-btn ${options.submitBtnClass || (type === 'danger' ? 'btn-danger' : type === 'success' ? 'btn-success' : 'btn-warning')}`;
      if (submitText) submitText.textContent = options.submitText || options.confirmText || 'Confirm';
      if (submitIcon) submitIcon.textContent = options.submitIcon || '';
    }

    // Display
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    if (submitBtn) submitBtn.focus();
  }

  // Event handlers
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      closeModal();
    }
  });

  submitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const cb = activeCallback;
    closeModal();
    if (cb) cb();
  });

  // Intercept forms with data-confirm-modal="true"
  document.addEventListener('submit', (e) => {
    const form = e.target;
    if (!form || !form.matches || !form.matches('form[data-confirm-modal="true"]')) return;
    if (form.dataset.confirmed === 'true') {
      delete form.dataset.confirmed;
      return;
    }
    e.preventDefault();
    openModal({
      title: form.dataset.confirmTitle || 'Confirm Action',
      desc: form.dataset.confirmDesc || '',
      type: form.dataset.confirmType || 'warning',
      icon: form.dataset.confirmIcon || '',
      warning: form.dataset.confirmWarning || '',
      targetName: form.dataset.confirmTargetName || '',
      targetSub: form.dataset.confirmTargetSub || '',
      targetBadgeText: form.dataset.confirmTargetBadge || '',
      targetBadgeClass: form.dataset.confirmTargetBadgeClass || 'badge-warning',
      submitText: form.dataset.confirmSubmit || 'Confirm',
      submitBtnClass: form.dataset.confirmBtnClass || '',
      onConfirm: () => {
        form.dataset.confirmed = 'true';
        form.submit();
      }
    });
  });

  // Expose globally
  window.showConfirmModal = openModal;
}


