(() => {
  const form = document.querySelector("#rsvp-form");
  const success = document.querySelector("#rsvp-success");
  const edit = document.querySelector("#edit-rsvp");
  const status = document.querySelector("#rsvp-status");
  const menu = document.querySelector(".menu-button");
  const nav = document.querySelector(".mobile-nav");
  const storageKey = "babycakes-prelim-rsvp-v1";
  const apiUrl = "https://babycakes-rsvp-api.diosalumiere1730-creator.workers.dev/";
  const requestTimeout = 15000;
  let lastFocused = null;

  const setStatus = (message, state = "") => {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
  };

  const showSaved = (focus = false) => {
    if (!form || !success) return;
    form.hidden = true;
    success.hidden = false;
    setStatus("");
    if (focus) {
      requestAnimationFrame(() => success.focus());
    }
  };

  const restore = () => {
    if (!form) return;
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
    } catch (_) {
      try { localStorage.removeItem(storageKey); } catch (_) {}
    }
  };

  const closeNav = (restoreFocus = false) => {
    nav?.classList.remove("open");
    nav?.setAttribute("aria-hidden", "true");
    nav?.setAttribute("inert", "");
    menu?.setAttribute("aria-expanded", "false");
    if (restoreFocus && lastFocused) {
      requestAnimationFrame(() => lastFocused.focus());
    }
  };

  nav?.setAttribute("aria-hidden", "true");
  nav?.setAttribute("inert", "");

  menu?.addEventListener("click", () => {
    const open = nav?.classList.toggle("open") ?? false;
    nav?.setAttribute("aria-hidden", String(!open));
    if (open) {
      nav?.removeAttribute("inert");
      lastFocused = document.activeElement;
      menu.setAttribute("aria-expanded", "true");
      requestAnimationFrame(() => nav?.querySelector("a")?.focus());
    } else {
      closeNav();
    }
  });

  nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => closeNav()));

  document.addEventListener("click", event => {
    if (!nav?.classList.contains("open")) return;
    if (nav.contains(event.target) || menu?.contains(event.target)) return;
    closeNav(true);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && nav?.classList.contains("open")) {
      event.preventDefault();
      closeNav(true);
    }
  });

  form?.addEventListener("submit", async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form).entries());
    const submit = form.querySelector(".submit-button");
    const originalText = submit?.innerHTML;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

    if (submit) {
      submit.disabled = true;
      submit.setAttribute("aria-busy", "true");
      submit.innerHTML = "Saving RSVP…";
    }
    setStatus("Saving your preliminary RSVP…", "pending");

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          name: data.name,
          attendance: data.attendance,
          party: data.party,
          region: data.region,
          notes: data.notes
        }),
        signal: controller.signal
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Unable to save RSVP.");
      }

      data.savedAt = new Date().toISOString();
      data.submissionId = result.id;

      let remembered = true;
      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (_) {
        remembered = false;
      }

      setStatus(
        remembered ? "Saved. Thank you." : "Saved. Thank you. This device couldn't remember the response.",
        "success"
      );
      showSaved(true);
      document.querySelector("#rsvp")?.scrollIntoView({behavior: "smooth", block: "start"});
    } catch (error) {
      const message = error?.name === "AbortError"
        ? "Saving took too long. Please check your connection and try again."
        : "We couldn't save your RSVP right now. Please check your connection and try again.";
      setStatus(message, "error");
    } finally {
      clearTimeout(timeoutId);
      if (submit) {
        submit.disabled = false;
        submit.removeAttribute("aria-busy");
        submit.innerHTML = originalText;
      }
    }
  });

  edit?.addEventListener("click", () => {
    success.hidden = true;
    form.hidden = false;
    setStatus("");
    form.querySelector("[name=\"name\"]")?.focus();
  });

  const observer = "IntersectionObserver" in window
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      }, {threshold: 0.12})
    : null;

  document.querySelectorAll(".reveal").forEach(el => {
    if (observer) observer.observe(el);
    else el.classList.add("visible");
  });

  restore();
})();