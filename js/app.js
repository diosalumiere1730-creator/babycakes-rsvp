(() => {
  const form = document.querySelector("#rsvp-form");
  const success = document.querySelector("#rsvp-success");
  const edit = document.querySelector("#edit-rsvp");
  const menu = document.querySelector(".menu-button");
  const nav = document.querySelector(".mobile-nav");
  const storageKey = "babycakes-prelim-rsvp-v1";

  const showSaved = () => {
    form.hidden = true;
    success.hidden = false;
  };

  const restore = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (!saved) return;
      Object.entries(saved).forEach(([key, value]) => {
        const field = form.elements[key];
        if (!field) return;
        if (field instanceof RadioNodeList) {
          const radio = [...field].find(input => input.value === value);
          if (radio) radio.checked = true;
        } else {
          field.value = value;
        }
      });
      showSaved();
    } catch (_) {}
  };

  menu?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(open));
  });

  nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
  }));

  form?.addEventListener("submit", event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    data.savedAt = new Date().toISOString();
    localStorage.setItem(storageKey, JSON.stringify(data));
    showSaved();
    document.querySelector("#rsvp")?.scrollIntoView({behavior:"smooth"});
  });

  edit?.addEventListener("click", () => {
    success.hidden = true;
    form.hidden = false;
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.12});

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
  restore();
})();
