/* ==========================================================================
   Haven Estates — Journal
   Searchable, categorised article index plus the article reader with a table
   of contents and related reading.
   ========================================================================== */

(function () {
  "use strict";

  const PAGE_SIZE = 6;

  function featuredMarkup(post) {
    const ui = window.HavenUI;
    const author = ui.getAgent(post.authorId);
    const href = `blog-details.html?id=${encodeURIComponent(post.id)}`;
    return `
      <article class="post-featured">
        <a class="post-featured__media" href="${href}" tabindex="-1" aria-hidden="true">
          <img src="${post.image}" alt="${ui.escapeHTML(post.imageAlt)}" width="1400" height="900" loading="eager" fetchpriority="high" decoding="async">
        </a>
        <div class="post-featured__body">
          <p class="post-meta">
            <span class="post-meta__cat">${ui.escapeHTML(post.category)}</span>
            <span class="post-meta__dot" aria-hidden="true"></span>
            <time datetime="${post.date}">${ui.formatDate(post.date)}</time>
            <span class="post-meta__dot" aria-hidden="true"></span>
            <span>${ui.escapeHTML(post.readTime)}</span>
          </p>
          <h2><a href="${href}">${ui.escapeHTML(post.title)}</a></h2>
          <p>${ui.escapeHTML(post.excerpt)}</p>
          <a class="link-arrow" href="${href}" aria-label="Read ${ui.escapeHTML(post.title)}">
            ${author ? `By ${ui.escapeHTML(author.name)}` : "Read the story"} ${ui.icon("arrowRight")}
          </a>
        </div>
      </article>`;
  }

  function initBlogIndex() {
    const grid = document.querySelector("[data-blog-grid]");
    if (!grid || !window.HavenUI) return;

    const ui = window.HavenUI;
    const posts = [...(window.HAVEN_POSTS || [])].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    const featured = posts.find((post) => post.featured);
    const featuredHost = document.querySelector("[data-blog-featured]");
    const searchInput = document.querySelector("[data-blog-search]");
    const chipsHost = document.querySelector("[data-blog-categories]");
    const countEl = document.querySelector("[data-blog-count]");
    const empty = document.querySelector("[data-blog-empty]");
    const loadWrap = document.querySelector("[data-blog-load-more-wrap]");
    const loadButton = document.querySelector("[data-blog-load-more]");
    const loadNote = document.querySelector("[data-blog-note]");

    const categories = Array.from(new Set(posts.map((post) => post.category))).sort((a, b) =>
      a.localeCompare(b)
    );
    const params = new URLSearchParams(window.location.search);

    let query = params.get("q") || "";
    let category = categories.includes(params.get("category")) ? params.get("category") : "";
    let shown = PAGE_SIZE;

    if (searchInput) searchInput.value = query;

    function hasFilters() {
      return Boolean(query.trim() || category);
    }

    function renderChips() {
      if (!chipsHost) return;
      chipsHost.innerHTML = [
        `<button class="chip" type="button" data-blog-category="" aria-pressed="${category === ""}">All stories</button>`,
        ...categories.map(
          (item) =>
            `<button class="chip" type="button" data-blog-category="${ui.escapeHTML(item)}" aria-pressed="${category === item}">${ui.escapeHTML(item)}</button>`
        )
      ].join("");
    }

    function updateUrl() {
      const next = new URLSearchParams(window.location.search);
      if (query.trim()) next.set("q", query.trim());
      else next.delete("q");
      if (category) next.set("category", category);
      else next.delete("category");
      const url = `${window.location.pathname}${next.toString() ? `?${next}` : ""}`;
      window.history.replaceState(null, "", url);
    }

    function matches(post) {
      if (category && post.category !== category) return false;
      const normalized = query.trim().toLowerCase();
      if (!normalized) return true;
      const haystack = [post.title, post.subtitle, post.excerpt, post.category, post.content]
        .join(" ")
        .replace(/<[^>]*>/g, " ")
        .toLowerCase();
      return normalized
        .split(/\s+/)
        .filter(Boolean)
        .every((token) => haystack.includes(token));
    }

    function render() {
      const filtered = posts.filter(matches);
      const showFeatured = featured && !hasFilters() && filtered.includes(featured);

      if (featuredHost) {
        featuredHost.hidden = !showFeatured;
        featuredHost.innerHTML = showFeatured ? featuredMarkup(featured) : "";
      }

      const gridPosts = showFeatured
        ? filtered.filter((post) => post.id !== featured.id)
        : filtered;
      const visible = gridPosts.slice(0, shown);

      grid.innerHTML = visible.map((post) => ui.postCard(post)).join("");

      if (countEl) {
        countEl.innerHTML = `<strong>${filtered.length}</strong> ${filtered.length === 1 ? "story" : "stories"}${category ? ` in ${ui.escapeHTML(category)}` : ""}`;
      }

      if (empty) empty.classList.toggle("is-visible", filtered.length === 0);

      if (loadWrap) {
        const hasMore = gridPosts.length > shown;
        loadWrap.hidden = filtered.length === 0;
        if (loadButton) {
          loadButton.hidden = !hasMore;
          loadButton.innerHTML = `Load more stories ${ui.icon("arrowRight")}`;
        }
        if (loadNote) {
          loadNote.textContent = hasMore
            ? `Showing ${visible.length} of ${gridPosts.length}`
            : filtered.length === 0
              ? ""
              : "You're all caught up";
        }
      }

      renderChips();
      updateUrl();
      if (window.HavenAnimations) window.HavenAnimations.refresh();
    }

    if (searchInput) {
      searchInput.addEventListener(
        "input",
        ui.debounce(() => {
          query = searchInput.value;
          shown = PAGE_SIZE;
          render();
        }, 180)
      );
    }

    if (chipsHost) {
      chipsHost.addEventListener("click", (event) => {
        const button = event.target.closest("[data-blog-category]");
        if (!button) return;
        category = button.dataset.blogCategory;
        shown = PAGE_SIZE;
        render();
      });
    }

    if (loadButton) {
      loadButton.addEventListener("click", () => {
        const before = grid.children.length;
        shown += PAGE_SIZE;
        render();
        if (grid.children[before]) {
          const link = grid.children[before].querySelector("a");
          if (link) link.focus();
        }
      });
    }

    if (empty) {
      empty.addEventListener("click", (event) => {
        if (!event.target.closest("[data-blog-reset]")) return;
        query = "";
        category = "";
        shown = PAGE_SIZE;
        if (searchInput) searchInput.value = "";
        render();
        if (searchInput) searchInput.focus();
      });
    }

    render();
  }

  function initArticle() {
    const root = document.querySelector("[data-article-root]");
    if (!root || !window.HavenUI) return;

    const ui = window.HavenUI;
    const id = ui.getParam("id");
    const posts = window.HAVEN_POSTS || [];
    const post = id ? ui.getPost(id) : posts.find((item) => item.featured) || posts[0];

    if (!post) {
      const body = root.querySelector("[data-article-body]");
      if (body) {
        body.innerHTML = `
          <p class="eyebrow">Story unavailable</p>
          <h1 class="h2">We couldn't find that story</h1>
          <p class="lede">The link may be out of date. Return to the journal to keep reading.</p>
          <p><a class="btn btn-primary" href="blog.html">Back to the journal ${ui.icon("arrowRight")}</a></p>`;
      }
      return;
    }

    const author = ui.getAgent(post.authorId);
    const title = root.querySelector("[data-article-title]");
    const category = root.querySelector("[data-article-category]");
    const subtitle = root.querySelector("[data-article-sub]");
    const meta = root.querySelector("[data-article-meta]");
    const imageHost = root.querySelector("[data-article-image]");
    const body = root.querySelector("[data-article-body]");
    const toc = root.querySelector("[data-article-toc]");
    const authorHost = root.querySelector("[data-article-author]");
    const share = root.querySelector("[data-article-share]");
    const crumb = root.querySelector("[data-article-crumb]");

    const pageUrl = window.location.href;
    const pageTitle = `${post.title} — Haven Estates Journal`;

    ui.setDocumentTitle(pageTitle);
    ui.updateMetaDescription(post.excerpt);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", pageTitle);
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute("content", post.excerpt);
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute("content", new URL(post.image, pageUrl).href);

    if (title) title.textContent = post.title;
    if (category) category.textContent = post.category;
    if (subtitle) subtitle.textContent = post.subtitle;
    if (crumb) crumb.textContent = post.title;
    if (meta) {
      meta.innerHTML = `
        <span>By ${ui.escapeHTML(author ? author.name : "Haven Editorial")}</span>
        <span aria-hidden="true">·</span>
        <time datetime="${post.date}">${ui.formatDate(post.date)}</time>
        <span aria-hidden="true">·</span>
        <span>${ui.escapeHTML(post.readTime)}</span>`;
    }

    if (imageHost) {
      imageHost.innerHTML = `<img src="${post.image}" alt="${ui.escapeHTML(post.imageAlt)}" width="1800" height="900" loading="eager" fetchpriority="high" decoding="async">`;
    }

    if (body) {
      body.innerHTML = post.content;
      body.querySelectorAll("h2").forEach((heading, index) => {
        if (!heading.id) heading.id = `section-${index + 1}`;
      });
    }

    if (toc && body) {
      const headings = Array.from(body.querySelectorAll("h2"));
      toc.innerHTML = headings
        .map(
          (heading) =>
            `<a href="#${ui.escapeHTML(heading.id)}">${ui.escapeHTML(heading.textContent)}</a>`
        )
        .join("");
    }

    if (authorHost) {
      authorHost.innerHTML = author
        ? `
          <img src="${author.image}" alt="Portrait of ${ui.escapeHTML(author.name)}" width="92" height="92" loading="lazy">
          <div>
            <strong>${ui.escapeHTML(author.name)}</strong>
            <span>${ui.escapeHTML(author.role)}</span>
          </div>`
        : `<div><strong>Haven Editorial</strong><span>The Haven Estates journal</span></div>`;
    }

    if (share) {
      share.innerHTML = `
        <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(post.title)}" target="_blank" rel="noopener noreferrer">Share on X</a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}" target="_blank" rel="noopener noreferrer">Share on LinkedIn</a>
        <a href="mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(`I thought you might enjoy this from Haven Estates: ${pageUrl}`)}">Share by email</a>`;
    }

    const related = posts
      .filter((item) => item.id !== post.id)
      .sort(
        (a, b) =>
          Number(b.category === post.category) - Number(a.category === post.category) ||
          new Date(b.date) - new Date(a.date)
      )
      .slice(0, 3);

    const relatedHost = document.querySelector("[data-related-posts]");
    if (relatedHost) {
      relatedHost.innerHTML = related.map((item) => ui.postCard(item)).join("");
    }

    if (window.HavenAnimations) window.HavenAnimations.refresh();
  }

  if (window.HavenUI) {
    window.HavenUI.onReady(() => {
      initBlogIndex();
      initArticle();
    });
  }
})();
