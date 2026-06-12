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

  document.addEventListener('DOMContentLoaded', () => {
    initLanguageSwitcher();
    initHeader();
    initReveal();
    initSmoothScroll();
  });
})();
