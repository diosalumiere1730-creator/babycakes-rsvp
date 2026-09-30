(() => {
  const form = document.querySelector("#rsvp-form");
  const success = document.querySelector("#rsvp-success");
  const edit = document.querySelector("#edit-rsvp");
  const status = document.querySelector("#rsvp-status");
  const menu = document.querySelector(".menu-button");
  const nav = document.querySelector(".mobile-nav");
  const storageKey = "babycakes-prelim-rsvp-v1";
  const apiUrl = "https://babycakes-rsvp-api.diosalumiere1730.workers.dev/";

  const setStatus = (message, state = "") => {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
  };

  const showSaved = () => {
    if (!form || !success) return;
    form.hidden = true;
    success.hidden = false;
    setStatus("");
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
      localStorage.removeItem(storageKey);
    }
  };

  const closeNav = () => {
    nav?.classList.remove("open");
    menu?.setAttribute("aria-expanded", "false");
  };

  menu?.addEventListener("click", () => {
    const open = nav?.classList.toggle("open") ?? false;
    menu.setAttribute("aria-expanded", String(open));
  });

  nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeNav));

  document.addEventListener("click", event => {
    if (!nav?.classList.contains("open")) return;
    if (nav.contains(event.target) || menu?.contains(event.target)) return;
    closeNav();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeNav();
  });

  form?.addEventListener("submit", async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form).entries());
    const submit = form.querySelector(".submit-button");
    const originalText = submit?.innerHTML;

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
        })
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Unable to save RSVP.");
      }

      data.savedAt = new Date().toISOString();
      data.submissionId = result.id;
      localStorage.setItem(storageKey, JSON.stringify(data));
      setStatus("Saved. Thank you.", "success");
      showSaved();
      document.querySelector("#rsvp")?.scrollIntoView({behavior: "smooth", block: "start"});
    } catch (_) {
      setStatus("We couldn't save your RSVP right now. Please check your connection and try again.", "error");
    } finally {
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