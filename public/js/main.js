document.addEventListener('DOMContentLoaded', () => {
  // Mobile drawer toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileDrawer.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (mobileDrawer.classList.contains('open') && !mobileDrawer.contains(e.target) && e.target !== mobileMenuBtn) {
        mobileDrawer.classList.remove('open');
      }
    });
  }

  // Quick fill demo credentials on login screen
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
        // visual pulse animation
        emailInput.style.borderColor = 'var(--color-accent)';
        passwordInput.style.borderColor = 'var(--color-accent)';
        setTimeout(() => {
          emailInput.style.borderColor = '';
          passwordInput.style.borderColor = '';
        }, 600);
      }
    });
  });

  // Auto-dismiss toast notifications after 4.5 seconds
  const toast = document.querySelector('.toast');
  if (toast) {
    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  // Auto-submit filter forms on select change
  const filterSelects = document.querySelectorAll('.select-filter');
  filterSelects.forEach((select) => {
    select.addEventListener('change', () => {
      const form = select.closest('form');
      if (form) form.submit();
    });
  });
});
