/**
 * Coffee Shop — основной JavaScript-файл
 * ES6+, без сторонних библиотек
 */

'use strict';

/* ----------------------------------------------------------
   1. Утилиты
   ---------------------------------------------------------- */

/**
 * Проверяет, что элемент присутствует в DOM.
 * @param {string} selector
 * @returns {Element|null}
 */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);


/* ----------------------------------------------------------
   2. Текущий год в футере
   ---------------------------------------------------------- */
const yearEl = $('#year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}


/* ----------------------------------------------------------
   3. Фиксированный хедер — тень при скролле
   ---------------------------------------------------------- */
const header = $('.header');

const handleHeaderScroll = () => {
  if (!header) return;
  header.classList.toggle('header--scrolled', window.scrollY > 10);
};

// Инициализируем сразу и вешаем обработчик
handleHeaderScroll();
window.addEventListener('scroll', handleHeaderScroll, { passive: true });


/* ----------------------------------------------------------
   4. Мобильное меню (бургер)
   ---------------------------------------------------------- */
const burgerBtn  = $('#burgerBtn');
const navMenu    = $('#navMenu');
const navLinks   = $$('.header__menu-link');

const openMenu = () => {
  if (!navMenu || !burgerBtn) return;
  navMenu.classList.add('header__nav--open');
  burgerBtn.classList.add('header__burger--open');
  burgerBtn.setAttribute('aria-expanded', 'true');
  burgerBtn.setAttribute('aria-label', 'Закрыть меню');
  document.body.style.overflow = 'hidden'; // блокируем прокрутку фона
};

const closeMenu = () => {
  if (!navMenu || !burgerBtn) return;
  navMenu.classList.remove('header__nav--open');
  burgerBtn.classList.remove('header__burger--open');
  burgerBtn.setAttribute('aria-expanded', 'false');
  burgerBtn.setAttribute('aria-label', 'Открыть меню');
  document.body.style.overflow = '';
};

const toggleMenu = () => {
  const isOpen = navMenu.classList.contains('header__nav--open');
  isOpen ? closeMenu() : openMenu();
};

if (burgerBtn) {
  burgerBtn.addEventListener('click', toggleMenu);
}

// Закрытие меню по клику на ссылку
navLinks.forEach((link) => {
  link.addEventListener('click', closeMenu);
});

// Закрытие меню по клику вне его области
document.addEventListener('click', (e) => {
  if (
    navMenu &&
    navMenu.classList.contains('header__nav--open') &&
    !navMenu.contains(e.target) &&
    !burgerBtn.contains(e.target)
  ) {
    closeMenu();
  }
});

// Закрытие меню по Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});


/* ----------------------------------------------------------
   5. Подсветка активной ссылки навигации при скролле
   (Intersection Observer)
   ---------------------------------------------------------- */
const sections  = $$('main [id]');
const menuLinks = $$('.header__menu-link');

/**
 * Находит ссылку навигации, соответствующую секции.
 * @param {string} id
 * @returns {Element|undefined}
 */
const getLinkBySection = (id) =>
  [...menuLinks].find((link) => link.getAttribute('href') === `#${id}`);

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Снимаем активный класс со всех ссылок
        menuLinks.forEach((link) => link.classList.remove('header__menu-link--active'));

        // Устанавливаем активный класс на текущую
        const activeLink = getLinkBySection(entry.target.id);
        if (activeLink) activeLink.classList.add('header__menu-link--active');
      }
    });
  },
  {
    rootMargin: `-${getComputedStyle(document.documentElement)
      .getPropertyValue('--header-h')
      .trim()} 0px -60% 0px`,
    threshold: 0,
  }
);

sections.forEach((section) => sectionObserver.observe(section));


/* ----------------------------------------------------------
   6. Фильтрация карточек меню
   ---------------------------------------------------------- */
const filterBtns = $$('.menu__filter-btn');
const menuCards  = $$('.menu__card');

/**
 * Фильтрует карточки по выбранной категории.
 * @param {string} filter — значение атрибута data-filter
 */
const filterMenu = (filter) => {
  menuCards.forEach((card) => {
    const category = card.dataset.category;
    const isVisible = filter === 'all' || category === filter;

    if (isVisible) {
      card.classList.remove('menu__card--hidden');
      card.removeAttribute('aria-hidden');
    } else {
      card.classList.add('menu__card--hidden');
      card.setAttribute('aria-hidden', 'true');
    }
  });
};

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    // Переключаем активный класс кнопки
    filterBtns.forEach((b) => b.classList.remove('menu__filter-btn--active'));
    btn.classList.add('menu__filter-btn--active');

    filterMenu(btn.dataset.filter);
  });
});


/* ----------------------------------------------------------
   7. Валидация и отправка формы бронирования
   ---------------------------------------------------------- */
const bookingForm = $('#bookingForm');

/**
 * Простая клиентская валидация поля.
 * @param {HTMLInputElement} input
 * @returns {boolean}
 */
const validateField = (input) => {
  const isValid = input.checkValidity() && input.value.trim() !== '';
  input.classList.toggle('contacts__form-input--error', !isValid);
  return isValid;
};

if (bookingForm) {
  // Валидация в реальном времени (после первого взаимодействия)
  bookingForm.querySelectorAll('.contacts__form-input').forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('contacts__form-input--error')) {
        validateField(input);
      }
    });
  });

  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const inputs = bookingForm.querySelectorAll('.contacts__form-input');
    const allValid = [...inputs].every((input) => validateField(input));

    if (!allValid) return;

    // Имитируем отправку (в реальном проекте — fetch/XMLHttpRequest)
    const submitBtn = bookingForm.querySelector('.contacts__form-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';

    // Симуляция асинхронного запроса
    setTimeout(() => {
      showNotification('Столик забронирован! Мы свяжемся с вами в ближайшее время.', 'success');
      bookingForm.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Забронировать';
    }, 1200);
  });
}


/* ----------------------------------------------------------
   8. Toast-уведомление
   ---------------------------------------------------------- */

/**
 * Показывает всплывающее уведомление.
 * @param {string} message
 * @param {'success'|'error'} type
 */
const showNotification = (message, type = 'success') => {
  // Удаляем предыдущее уведомление, если есть
  const existingToast = $('.toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;

  // Инлайн-стили тоста (не засоряем CSS правилами для редко используемого элемента)
  Object.assign(toast.style, {
    position:     'fixed',
    bottom:       '5rem',
    left:         '50%',
    transform:    'translateX(-50%)',
    background:   type === 'success' ? '#2e7d32' : '#c62828',
    color:        '#fff',
    padding:      '0.85rem 2rem',
    borderRadius: '50px',
    fontSize:     '0.95rem',
    fontFamily:   'var(--font-heading)',
    fontWeight:   '600',
    boxShadow:    '0 6px 20px rgba(0,0,0,0.2)',
    zIndex:       '9999',
    maxWidth:     '90vw',
    textAlign:    'center',
    animation:    'fadeInUp 0.4s ease both',
  });

  document.body.appendChild(toast);

  // Автоматически скрываем через 4 секунды
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
};


/* ----------------------------------------------------------
   9. Кнопка «Наверх»
   ---------------------------------------------------------- */
const scrollTopBtn = $('#scrollTopBtn');

const handleScrollTopVisibility = () => {
  if (!scrollTopBtn) return;
  const isVisible = window.scrollY > 400;
  scrollTopBtn.classList.toggle('scroll-top--visible', isVisible);
  scrollTopBtn.hidden = !isVisible;
};

if (scrollTopBtn) {
  window.addEventListener('scroll', handleScrollTopVisibility, { passive: true });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

handleScrollTopVisibility();


/* ----------------------------------------------------------
   10. Плавное появление секций (Intersection Observer)
   ---------------------------------------------------------- */

/**
 * Добавляем CSS-класс .is-visible при попадании элемента в поле зрения.
 * Анимация прописана прямо в стилях, чтобы не смешивать логику с DOM.
 */

// Вставляем стили анимации появления секций через JS,
// чтобы не срабатывали при отключённом JS
const revealStyle = document.createElement('style');
revealStyle.textContent = `
  .reveal {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .reveal.is-visible {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(revealStyle);

// Добавляем класс .reveal ко всем карточкам преимуществ и меню
$$('.advantages__item, .menu__card, .about__inner, .contacts__inner').forEach(
  (el) => el.classList.add('reveal')
);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target); // наблюдаем только один раз
      }
    });
  },
  { threshold: 0.12 }
);

$$('.reveal').forEach((el) => revealObserver.observe(el));
