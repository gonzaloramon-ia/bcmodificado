(function () {
  "use strict";

  var storageKey = "bc-theme";
  var mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  var allowed = { system: true, light: true, dark: true };

  function readSavedMode() {
    try {
      var value = localStorage.getItem(storageKey);
      return value === "light" || value === "dark" ? value : "system";
    } catch (error) {
      return "system";
    }
  }

  function getSystemTheme() {
    return mediaQuery.matches ? "dark" : "light";
  }

  function updateBrowserColor(theme) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", theme === "dark" ? "#0b0d0f" : "#ffffff");
  }

  function updateButtons(mode) {
    document.querySelectorAll("[data-theme-choice]").forEach(function (button) {
      var active = button.getAttribute("data-theme-choice") === mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function applyTheme(mode, save) {
    if (!allowed[mode]) mode = "system";
    var resolved = mode === "system" ? getSystemTheme() : mode;

    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.setAttribute("data-theme-mode", mode);
    document.documentElement.style.colorScheme = resolved;
    updateBrowserColor(resolved);
    updateButtons(mode);

    if (save) {
      try {
        if (mode === "system") localStorage.removeItem(storageKey);
        else localStorage.setItem(storageKey, mode);
      } catch (error) {}
    }
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-theme-choice]");
    if (!button) return;
    applyTheme(button.getAttribute("data-theme-choice"), true);
  });


  function localizeControls() {
    var lang = (document.documentElement.lang || "es").toLowerCase();
    var labels;
    if (lang.indexOf("fr") === 0) {
      labels = { group: "Apparence du site", system: "Auto", light: "Clair", dark: "Sombre" };
    } else if (lang.indexOf("ja") === 0) {
      labels = { group: "サイトの外観", system: "自動", light: "明るい", dark: "暗い" };
    } else if (lang.indexOf("en") === 0) {
      labels = { group: "Site appearance", system: "Auto", light: "Light", dark: "Dark" };
    } else {
      labels = { group: "Apariencia del sitio", system: "Auto", light: "Claro", dark: "Oscuro" };
    }

    document.querySelectorAll(".theme-selector").forEach(function (group) {
      group.setAttribute("aria-label", labels.group);
    });
    document.querySelectorAll("[data-theme-choice]").forEach(function (button) {
      var mode = button.getAttribute("data-theme-choice");
      button.setAttribute("aria-label", labels[mode]);
      button.setAttribute("title", labels[mode]);
      var visibleLabel = button.querySelector(".theme-option-label");
      if (visibleLabel) visibleLabel.textContent = labels[mode];
    });
  }

  function handleSystemChange() {
    if (document.documentElement.getAttribute("data-theme-mode") === "system") {
      applyTheme("system", false);
    }
  }

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleSystemChange);
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(handleSystemChange);
  }

  localizeControls();
  if (window.MutationObserver) {
    new MutationObserver(function (mutations) {
      if (mutations.some(function (m) { return m.type === "attributes" && m.attributeName === "lang"; })) {
        localizeControls();
      }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  }
  applyTheme(readSavedMode(), false);
})();
