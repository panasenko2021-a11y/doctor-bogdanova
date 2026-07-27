/* ==========================================================================
   Личный сайт врача — script.js
   Отвечает за: navbar при скролле, floating CTA, мобильное меню,
   ленту отзывов (requestAnimationFrame), инициализацию AOS (scroll reveal).
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* -----------------------------------------------------------
     1. AOS — плавное появление блоков при скролле
  ----------------------------------------------------------- */
  if (window.AOS) {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 60,
    });
  }

  /* -----------------------------------------------------------
     2. NAVBAR: становится непрозрачным + blur при скролле
  ----------------------------------------------------------- */
  const navbar = document.getElementById("navbar");
  const SCROLL_THRESHOLD = 40;

  function updateNavbar() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add("is-scrolled");
    } else {
      navbar.classList.remove("is-scrolled");
    }
  }
  updateNavbar();
  window.addEventListener("scroll", updateNavbar, { passive: true });

  /* -----------------------------------------------------------
     3. МОБИЛЬНОЕ МЕНЮ (burger)
  ----------------------------------------------------------- */
  const burgerBtn = document.getElementById("burgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  function closeMobileMenu() {
    burgerBtn.classList.remove("is-open");
    mobileMenu.classList.remove("is-open");
    burgerBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  function toggleMobileMenu() {
    const isOpen = mobileMenu.classList.toggle("is-open");
    burgerBtn.classList.toggle("is-open", isOpen);
    burgerBtn.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  burgerBtn.addEventListener("click", toggleMobileMenu);

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  /* -----------------------------------------------------------
     4. FLOATING CTA: появляется после выхода из Hero,
        может скрываться при возврате наверх
  ----------------------------------------------------------- */
  const floatingCta = document.getElementById("floatingCta");
  const heroSection = document.getElementById("hero");

  if (floatingCta && heroSection) {
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Кнопка видна, когда Hero НЕ пересекается с экраном
          floatingCta.classList.toggle("is-visible", !entry.isIntersecting);
        });
      },
      { threshold: 0.05 }
    );
    heroObserver.observe(heroSection);
  }

  /* -----------------------------------------------------------
     5. Плавный скролл для якорных ссылок (запасной вариант,
        html { scroll-behavior: smooth } покрывает большинство случаев)
  ----------------------------------------------------------- */
  /* -----------------------------------------------------------
     6. ЛЕНТА ОТЗЫВОВ: бесконечная прокрутка на requestAnimationFrame.
        Считается от реального времени, а не от CSS-анимации —
        поэтому не «замирает» вне области видимости и всегда
        в движении, даже если долистать до блока не сразу.
  ----------------------------------------------------------- */
  const reviewsTrack = document.getElementById("reviewsTrack");
  const reviewsViewport = reviewsTrack ? reviewsTrack.closest(".reviews__viewport") : null;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reviewsTrack && reviewsViewport && !prefersReducedMotion) {
    const SPEED = 38; // пикселей в секунду
    let offset = 0;
    let paused = false;
    let lastTimestamp = null;

    function loopWidth() {
      // Дорожка продублирована ровно в 2 раза для бесшовного повтора
      return reviewsTrack.scrollWidth / 2;
    }

    function tick(timestamp) {
      if (lastTimestamp === null) lastTimestamp = timestamp;
      const deltaSeconds = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (!paused) {
        offset += SPEED * deltaSeconds;
        const width = loopWidth();
        if (width > 0 && offset >= width) {
          offset -= width;
        }
        reviewsTrack.style.transform = `translateX(${-offset}px)`;
      }

      requestAnimationFrame(tick);
    }

    reviewsViewport.addEventListener("mouseenter", () => { paused = true; });
    reviewsViewport.addEventListener("mouseleave", () => { paused = false; });

    requestAnimationFrame(tick);
  }

});
