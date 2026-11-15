/* =========================================================
   Pooja — Model Portfolio
   Vanilla JS — no dependencies
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Page load veil ---------- */
  function initVeil() {
    var veil = document.querySelector(".veil");
    window.addEventListener("load", function () {
      requestAnimationFrame(function () {
        setTimeout(function () {
          document.body.classList.add("loaded");
          if (veil) veil.classList.add("is-hidden");
        }, 220);
      });
    });
    // fallback in case load event already fired / is slow
    setTimeout(function () {
      document.body.classList.add("loaded");
      if (veil) veil.classList.add("is-hidden");
    }, 1600);
  }

  /* ---------- Header scroll state ---------- */
  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    function onScroll() {
      if (window.scrollY > 40) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile hamburger menu ---------- */
  function initMobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) return;

    function close() {
      panel.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    }
    function open() {
      panel.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("menu-open");
    }

    toggle.addEventListener("click", function () {
      var isOpen = panel.classList.contains("is-open");
      if (isOpen) close();
      else open();
    });

    panel.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", close);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ---------- Smooth scroll for in-page anchors ---------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var headerH = document.querySelector(".site-header")
          ? document.querySelector(".site-header").offsetHeight
          : 0;
        var top =
          target.getBoundingClientRect().top + window.pageYOffset - headerH - 12;
        window.scrollTo({ top: top, behavior: "smooth" });
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  function initScrollReveal() {
    var els = document.querySelectorAll("[data-reveal], [data-reveal-stagger]");
    if (!els.length) return;

    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -60px 0px" }
    );

    els.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- Lazy loading (native + fallback class) ---------- */
  function initLazyImages() {
    var imgs = document.querySelectorAll("img[data-src]");
    if (!imgs.length) return;

    if (!("IntersectionObserver" in window)) {
      imgs.forEach(function (img) {
        img.src = img.getAttribute("data-src");
        img.removeAttribute("data-src");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var img = entry.target;
            img.src = img.getAttribute("data-src");
            img.removeAttribute("data-src");
            img.addEventListener(
              "load",
              function () {
                img.style.opacity = "1";
              },
              { once: true }
            );
            io.unobserve(img);
          }
        });
      },
      { rootMargin: "200px 0px" }
    );

    imgs.forEach(function (img) {
      img.style.opacity = "0";
      img.style.transition = "opacity .5s ease";
      io.observe(img);
    });
  }

  /* ---------- Lightbox ----------
     Works on any group of images sharing the same
     [data-lightbox-group] value. Triggers: elements with
     [data-lightbox] wrapping/near an <img>.
  ------------------------------------------------------- */
  function initLightbox() {
    var triggers = Array.prototype.slice.call(
      document.querySelectorAll("[data-lightbox]")
    );
    if (!triggers.length) return;

    // group triggers
    var groups = {};
    triggers.forEach(function (t, i) {
      var group = t.getAttribute("data-lightbox") || "default";
      if (!groups[group]) groups[group] = [];
      groups[group].push(t);
    });

    // build lightbox DOM once
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-hidden", "true");
    lb.innerHTML =
      '<div class="lightbox-stage">' +
      '<button class="lightbox-close" aria-label="Close">\u2715</button>' +
      '<button class="lightbox-prev" aria-label="Previous image">\u2190</button>' +
      '<img alt="" />' +
      '<button class="lightbox-next" aria-label="Next image">\u2192</button>' +
      '<span class="lightbox-counter"></span>' +
      "</div>";
    document.body.appendChild(lb);

    var imgEl = lb.querySelector("img");
    var counterEl = lb.querySelector(".lightbox-counter");
    var closeBtn = lb.querySelector(".lightbox-close");
    var prevBtn = lb.querySelector(".lightbox-prev");
    var nextBtn = lb.querySelector(".lightbox-next");

    var currentGroup = [];
    var currentIndex = 0;

    function fullSrc(el) {
      return (
        el.getAttribute("data-full") ||
        (el.tagName === "IMG" ? el.src : el.querySelector("img").src)
      );
    }
    function altText(el) {
      var img = el.tagName === "IMG" ? el : el.querySelector("img");
      return img ? img.alt : "";
    }

    function show(index) {
      currentIndex = (index + currentGroup.length) % currentGroup.length;
      var el = currentGroup[currentIndex];
      imgEl.classList.remove("is-shown");
      var src = fullSrc(el);
      var alt = altText(el);
      // small delay for cross-fade
      window.setTimeout(function () {
        imgEl.src = src;
        imgEl.alt = alt;
        imgEl.onload = function () {
          imgEl.classList.add("is-shown");
        };
      }, 80);
      counterEl.textContent =
        pad(currentIndex + 1) + " / " + pad(currentGroup.length);
    }
    function pad(n) {
      return n < 10 ? "0" + n : "" + n;
    }

    function open(group, index) {
      currentGroup = group;
      document.body.style.overflow = "hidden";
      lb.classList.add("is-open");
      lb.setAttribute("aria-hidden", "false");
      show(index);
    }
    function close() {
      lb.classList.remove("is-open");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      imgEl.classList.remove("is-shown");
    }

    Object.keys(groups).forEach(function (key) {
      groups[key].forEach(function (trigger, idx) {
        trigger.addEventListener("click", function (e) {
          e.preventDefault();
          open(groups[key], idx);
        });
      });
    });

    closeBtn.addEventListener("click", close);
    lb.addEventListener("click", function (e) {
      if (e.target === lb) close();
    });
    prevBtn.addEventListener("click", function () {
      show(currentIndex - 1);
    });
    nextBtn.addEventListener("click", function () {
      show(currentIndex + 1);
    });

    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(currentIndex - 1);
      if (e.key === "ArrowRight") show(currentIndex + 1);
    });

    // basic touch swipe
    var touchStartX = null;
    lb.addEventListener(
      "touchstart",
      function (e) {
        touchStartX = e.changedTouches[0].clientX;
      },
      { passive: true }
    );
    lb.addEventListener(
      "touchend",
      function (e) {
        if (touchStartX === null) return;
        var dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 40) {
          if (dx < 0) show(currentIndex + 1);
          else show(currentIndex - 1);
        }
        touchStartX = null;
      },
      { passive: true }
    );
  }

  /* ---------- Contact form (mailto, no backend) ---------- */
  function initContactForm() {
    var form = document.querySelector("#booking-form");
    if (!form) return;

    var fields = form.querySelectorAll(".field input, .field select, .field textarea");
    fields.forEach(function (el) {
      var wrap = el.closest(".field");
      el.addEventListener("focus", function () {
        wrap.classList.add("is-focused");
      });
      el.addEventListener("blur", function () {
        if (!el.value) wrap.classList.remove("is-focused");
      });
    });

    var status = form.querySelector(".form-status");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var data = new FormData(form);
      var name = data.get("name") || "";
      var email = data.get("email") || "";
      var phone = data.get("phone") || "";
      var company = data.get("company") || "";
      var project = data.get("project") || "";
      var date = data.get("date") || "";
      var message = data.get("message") || "";

      if (!name || !email || !message) {
        if (status)
          status.textContent = "Please fill in your name, email and message.";
        return;
      }

      var subject = "Booking Inquiry — " + name;
      var body =
        "Name: " + name + "\n" +
        "Email: " + email + "\n" +
        "Phone: " + phone + "\n" +
        "Company / Brand: " + company + "\n" +
        "Project type: " + project + "\n" +
        "Preferred date: " + date + "\n\n" +
        "Message:\n" + message;

      var mailto =
        "mailto:booking@Poojamercer.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      window.location.href = mailto;

      if (status)
        status.textContent =
          "Opening your email application to send this inquiry\u2026";
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initVeil();
    initHeader();
    initMobileNav();
    initSmoothScroll();
    initScrollReveal();
    initLazyImages();
    initLightbox();
    initContactForm();
  });
})();
