(function () {
  'use strict';

  const STORAGE_KEY = 'alvina-lang';
  let currentLang = localStorage.getItem(STORAGE_KEY) || 'en';

  function applyTranslations(lang) {
    const t = getTranslation(lang);
    const info = getLanguageInfo(lang);

    document.documentElement.lang = lang;
    document.documentElement.dir = info.dir;
    document.body.dir = info.dir;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = t[key];
        } else {
          el.textContent = t[key];
        }
      }
    });

    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    const select = document.getElementById('lang-select');
    if (select) select.value = lang;
  }

  function initLanguageSwitcher() {
    const select = document.getElementById('lang-select');
    if (!select) return;

    LANGUAGES.forEach(lang => {
      const opt = document.createElement('option');
      opt.value = lang.code;
      opt.textContent = lang.name;
      select.appendChild(opt);
    });

    select.addEventListener('change', e => applyTranslations(e.target.value));
    applyTranslations(currentLang);
  }

  function initHeader() {
    const header = document.querySelector('.header');
    const toggle = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.nav-mobile');

    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    if (toggle && mobileNav) {
      toggle.addEventListener('click', () => {
        mobileNav.classList.toggle('open');
        document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
      });

      mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileNav.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    }
  }

  function initReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));
  }

  function initHeroVideo() {
    const video = document.querySelector('.hero-portrait-video');
    const frame = document.querySelector('.hero-portrait-frame');
    if (!video || !frame) return;

    const useFallback = () => frame.classList.add('no-video');

    video.addEventListener('error', useFallback);

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(useFallback);
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause();
      useFallback();
    }
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        const id = anchor.getAttribute('href');
        if (id === '#') return;
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  function initPwa() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }

    const modal = document.getElementById('pwa-install-modal');
    const backdrop = document.getElementById('pwa-install-backdrop');
    const confirmBtn = document.getElementById('pwa-install-confirm');
    const cancelBtn = document.getElementById('pwa-install-cancel');
    let deferredPrompt = null;
    let dismissed = false;

    try {
      dismissed = sessionStorage.getItem('alvinaflow-pwa-dismissed') === '1';
    } catch (e) {}

    function isStandalone() {
      return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    }

    function showInstallModal() {
      if (!modal || isStandalone() || dismissed || !deferredPrompt) return;
      modal.hidden = false;
      document.body.classList.add('pwa-modal-open');
    }

    function hideInstallModal() {
      if (!modal) return;
      modal.hidden = true;
      document.body.classList.remove('pwa-modal-open');
    }

    function runNativeInstall() {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(choice => {
        deferredPrompt = null;
        hideInstallModal();
        if (choice.outcome === 'dismissed') {
          dismissed = true;
          try {
            sessionStorage.setItem('alvinaflow-pwa-dismissed', '1');
          } catch (e) {}
        }
      });
    }

    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      deferredPrompt = e;
      showInstallModal();
    });

    if (confirmBtn) confirmBtn.addEventListener('click', runNativeInstall);
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        dismissed = true;
        try {
          sessionStorage.setItem('alvinaflow-pwa-dismissed', '1');
        } catch (e) {}
        hideInstallModal();
      });
    }
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        dismissed = true;
        try {
          sessionStorage.setItem('alvinaflow-pwa-dismissed', '1');
        } catch (e) {}
        hideInstallModal();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initLanguageSwitcher();
    initHeader();
    initReveal();
    initHeroVideo();
    initSmoothScroll();
    initPwa();
  });
})();
