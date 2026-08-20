'use strict';



/**
 * Add event listener on multiple elements
 */

const addEventOnElements = function (elements, eventType, callback) {
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].addEventListener(eventType, callback);
  }
}



/**
 * MOBILE NAVBAR TOGGLER
 */

const navbar = document.querySelector("[data-navbar]");
const navTogglers = document.querySelectorAll("[data-nav-toggler]");

const toggleNav = () => {
  navbar.classList.toggle("active");
  document.body.classList.toggle("nav-active");
}

addEventOnElements(navTogglers, "click", toggleNav);



/**
 * HEADER ANIMATION
 * When scrolled donw to 100px header will be active
 */

const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

window.addEventListener("scroll", () => {
  if (window.scrollY > 100) {
    header.classList.add("active");
    backTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove("active");
  }
});



/**
 * SLIDER
 */

const slider = document.querySelector("[data-slider]");

if (slider) {
  const sliderContainer = document.querySelector("[data-slider-container]");
  const sliderPrevBtn = document.querySelector("[data-slider-prev]");
  const sliderNextBtn = document.querySelector("[data-slider-next]");

  let totalSliderVisibleItems = Number(getComputedStyle(slider).getPropertyValue("--slider-items"));
  let totalSlidableItems = sliderContainer.childElementCount - totalSliderVisibleItems;

  let currentSlidePos = 0;

  const moveSliderItem = function () {
    sliderContainer.style.transform = `translateX(-${sliderContainer.children[currentSlidePos].offsetLeft}px)`;
  }

  /**
   * NEXT SLIDE
   */

  const slideNext = function () {
    const slideEnd = currentSlidePos >= totalSlidableItems;

    if (slideEnd) {
      currentSlidePos = 0;
    } else {
      currentSlidePos++;
    }

    moveSliderItem();
  }

  sliderNextBtn.addEventListener("click", slideNext);

  /**
   * PREVIOUS SLIDE
   */

  const slidePrev = function () {
    if (currentSlidePos <= 0) {
      currentSlidePos = totalSlidableItems;
    } else {
      currentSlidePos--;
    }

    moveSliderItem();
  }

  sliderPrevBtn.addEventListener("click", slidePrev);

  /**
   * RESPONSIVE
   */
  window.addEventListener("resize", function () {
    totalSliderVisibleItems = Number(getComputedStyle(slider).getPropertyValue("--slider-items"));
    totalSlidableItems = sliderContainer.childElementCount - totalSliderVisibleItems;

    moveSliderItem();
  });
}



/**
 * BLOG GRID
 * Pagination (6 articles per page) and tag filtering via ?tag=... in the URL
 */

const blogGrid = document.querySelector("[data-blog-grid]");

if (blogGrid) {
  const PAGE_SIZE = 6;
  const items = Array.from(blogGrid.children).filter((el) => el.hasAttribute("data-tags"));
  const pagination = document.querySelector("[data-blog-pagination]");
  const filterNotice = document.querySelector("[data-filter-notice]");
  const filterLabel = document.querySelector("[data-filter-label]");

  const params = new URLSearchParams(window.location.search);
  const activeTag = params.get("tag");

  const clearPagination = function () {
    if (pagination) pagination.innerHTML = "";
  }

  if (activeTag) {
    /**
     * FILTERED VIEW
     * show every article matching the tag, ignore pagination entirely
     */
    const tag = activeTag.toLowerCase();

    items.forEach((item) => {
      const tags = (item.getAttribute("data-tags") || "").split(" ");
      item.style.display = tags.indexOf(tag) !== -1 ? "" : "none";
    });

    clearPagination();

    if (filterNotice) {
      filterNotice.hidden = false;
      if (filterLabel) filterLabel.textContent = activeTag;
    }

  } else {
    /**
     * DEFAULT VIEW
     * paginate items PAGE_SIZE at a time
     */
    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    let currentPage = 1;

    const showPage = function (page) {
      currentPage = Math.min(Math.max(1, page), totalPages);

      items.forEach((item, index) => {
        const itemPage = Math.floor(index / PAGE_SIZE) + 1;
        item.style.display = itemPage === currentPage ? "" : "none";
      });

      if (pagination) {
        pagination.querySelectorAll("[data-page-btn]").forEach((btn) => {
          btn.classList.toggle("active", Number(btn.getAttribute("data-page-btn")) === currentPage);
        });
      }
    }

    if (pagination && totalPages > 1) {
      let html = '<a href="#" class="pagination-btn" data-page-prev aria-label="page précédente"><ion-icon name="arrow-back" aria-hidden="true"></ion-icon></a>';

      for (let i = 1; i <= totalPages; i++) {
        html += '<a href="#" class="pagination-btn" data-page-btn="' + i + '">' + i + '</a>';
      }

      html += '<a href="#" class="pagination-btn" data-page-next aria-label="page suivante"><ion-icon name="arrow-forward" aria-hidden="true"></ion-icon></a>';
      pagination.innerHTML = html;

      pagination.querySelectorAll("[data-page-btn]").forEach((btn) => {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          showPage(Number(btn.getAttribute("data-page-btn")));
          blogGrid.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });

      const prevBtn = pagination.querySelector("[data-page-prev]");
      const nextBtn = pagination.querySelector("[data-page-next]");

      prevBtn.addEventListener("click", function (e) {
        e.preventDefault();
        showPage(currentPage - 1);
        blogGrid.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      nextBtn.addEventListener("click", function (e) {
        e.preventDefault();
        showPage(currentPage + 1);
        blogGrid.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    showPage(1);
  }
}



/**
 * COOKIE CONSENT
 * Banner shown on first visit, choice stored in localStorage.
 * "Nécessaires uniquement" and "Refuser" behave the same today (the site
 * sets no non-essential cookie yet) but are kept distinct so future
 * analytics/marketing scripts can check for "all" specifically.
 */

const COOKIE_CONSENT_KEY = "cookie-consent";

const getStoredConsent = function () {
  try {
    return window.localStorage.getItem(COOKIE_CONSENT_KEY);
  } catch (e) {
    return null;
  }
}

const storeConsent = function (value) {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
  } catch (e) {
    /* localStorage unavailable (private mode, disabled storage...): the
       banner will simply be shown again on the next page load. */
  }
}

const getBasePath = function () {
  const logoLink = document.querySelector(".header .logo");
  if (!logoLink) return "./";
  return logoLink.getAttribute("href").replace("index.html", "");
}

const closeCookieBanner = function () {
  const existing = document.querySelector("[data-cookie-banner]");
  if (existing) existing.remove();
}

const showCookieBanner = function () {
  closeCookieBanner();

  const banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.setAttribute("data-cookie-banner", "");
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "Préférences de cookies");

  const policyHref = getBasePath() + "politique-confidentialite.html";

  banner.innerHTML =
    '<p class="cookie-banner-title">Gestion des cookies</p>' +
    '<p class="cookie-banner-text">' +
      "Ce site utilise uniquement des cookies techniques nécessaires à son bon fonctionnement. " +
      "Aucun cookie de mesure d'audience ou publicitaire n'est déposé sans votre accord. " +
      'Plus de détails dans la <a href="' + policyHref + '">politique de confidentialité</a>.' +
    "</p>" +
    '<div class="cookie-banner-actions">' +
      '<button type="button" class="btn btn-primary" data-cookie-choice="all">Tout accepter</button>' +
      '<button type="button" class="btn btn-outline" data-cookie-choice="necessary">Nécessaires uniquement</button>' +
      '<button type="button" class="btn btn-outline" data-cookie-choice="rejected">Refuser</button>' +
    "</div>";

  document.body.appendChild(banner);

  banner.querySelectorAll("[data-cookie-choice]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      storeConsent(btn.getAttribute("data-cookie-choice"));
      closeCookieBanner();
    });
  });
}

if (!getStoredConsent()) {
  showCookieBanner();
}

document.querySelectorAll("[data-cookie-manage]").forEach(function (link) {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    showCookieBanner();
  });
});



/**
 * NEWSLETTER FORM
 * Submitted in the background (fetch, mode "no-cors") instead of a native
 * POST, so the visitor never leaves the page or sees Brevo's own response
 * page. The request is still sent to Brevo exactly as a normal form
 * submission would; with "no-cors" the browser just won't let us read the
 * response, so success is assumed once the request has been dispatched.
 */

document.querySelectorAll("[data-newsletter-form]").forEach(function (form) {
  const note = form.parentElement.querySelector("[data-newsletter-note]");
  const submitBtn = form.querySelector('button[type="submit"]');
  const emailInput = form.querySelector('input[type="email"]');

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (submitBtn) submitBtn.setAttribute("disabled", "true");

    fetch(form.getAttribute("action"), {
      method: "POST",
      mode: "no-cors",
      body: new FormData(form)
    }).catch(function () {
      /* request already left the browser regardless of this rejecting */
    });

    if (note) {
      note.textContent = "Merci ! Vérifiez votre boîte mail pour confirmer votre inscription.";
      note.classList.add("newsletter-note--success");
    }

    if (emailInput) emailInput.value = "";

    window.setTimeout(function () {
      if (submitBtn) submitBtn.removeAttribute("disabled");
      if (note) {
        note.textContent = note.getAttribute("data-default-text");
        note.classList.remove("newsletter-note--success");
      }
    }, 5000);
  });
});