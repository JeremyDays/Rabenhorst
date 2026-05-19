async function bootSearch() {
  const input = document.querySelector("#site-search");
  const results = document.querySelector("#search-results");
  if (!input || !results) return;

  const notes = await fetch("api/index.json").then((response) => response.json()).catch(() => []);
  const haystack = notes.map((note) => ({
    ...note,
    text: [note.title, note.category, note.excerpt, note.tags.join(" "), note.relativePath].join(" ").toLowerCase()
  }));

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    results.innerHTML = "";
    if (!query) return;

    const matches = haystack.filter((note) => note.text.includes(query)).slice(0, 10);
    results.innerHTML = matches.length
      ? matches.map((note) => '<a href="' + note.url + '"><strong>' + escapeHtml(note.title) + '</strong><span>' + escapeHtml(note.excerpt || note.category) + '</span></a>').join("")
      : '<p class="muted">Keine Treffer.</p>';
  });
}

function bootImageLightbox() {
  const images = document.querySelectorAll(".content img");
  if (!images.length) return;

  const lightbox = document.createElement("div");
  lightbox.className = "image-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.innerHTML = '<img alt="">';
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector("img");
  let zoom = 1;
  let maxZoom = 1;
  const applyZoom = () => {
    lightboxImage.style.width = lightboxImage.dataset.fitWidth ? (Number(lightboxImage.dataset.fitWidth) * zoom) + "px" : "";
    lightboxImage.style.height = "auto";
  };
  const close = () => {
    lightbox.classList.remove("is-open");
    lightbox.classList.remove("is-zoomable");
    lightboxImage.removeAttribute("src");
    lightboxImage.removeAttribute("style");
    lightboxImage.removeAttribute("data-fit-width");
  };

  images.forEach((image) => {
    image.addEventListener("click", () => {
      const isMap = document.body.classList.contains("note-karte-von-barovia") && image.classList.contains("vault-embed");
      zoom = 1;
      maxZoom = isMap ? 2 : 1;
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt || "";
      lightbox.classList.toggle("is-zoomable", isMap);
      lightbox.classList.add("is-open");
      lightboxImage.onload = () => {
        if (!isMap) return;
        const fitWidth = Math.min(lightboxImage.naturalWidth, window.innerWidth - 48);
        lightboxImage.dataset.fitWidth = String(fitWidth);
        applyZoom();
      };
    });
  });

  lightbox.addEventListener("wheel", (event) => {
    if (!lightbox.classList.contains("is-zoomable")) return;
    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;
    zoom = Math.min(maxZoom, Math.max(0.3, zoom + direction * 0.15));
    applyZoom();
  }, { passive: false });

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) close();
  });
  lightboxImage.addEventListener("click", () => {
    if (!lightbox.classList.contains("is-zoomable")) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

bootSearch();
bootImageLightbox();