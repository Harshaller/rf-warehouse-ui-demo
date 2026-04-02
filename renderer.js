
console.log("✅ renderer.js loaded");

let flowData = {};
let currentScreen = null;

/* ✅ Ensure DOM is ready before boot */
document.addEventListener("DOMContentLoaded", () => {
  loadScreen("GR_SCAN_DELIVERY");
});

function loadScreen(screenId) {
  currentScreen = screenId;

  fetch(`json/${screenId}.json`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`Could not load ${screenId}.json`);
      }
      return res.json();
    })
    .then(meta => {
      console.log("Loaded screen:", meta);
      renderScreen(meta);
    })
    .catch(err => console.error("Screen load failed:", err));
}

function renderScreen(meta) {
  const header = document.querySelector(".rf-header");
  const app = document.getElementById("app");
  const actionBtn = document.getElementById("primaryAction");

  // ✅ Defensive checks (important)
  if (!header || !app || !actionBtn) {
    console.error("UI shell not found");
    return;
  }

  header.textContent = meta.title || "";
  app.innerHTML = "";

  // ✅ Render message screens
  if (meta.message) {
    const msg = document.createElement("div");
    msg.textContent = meta.message;
    msg.style.fontSize = "18px";
    msg.style.paddingTop = "20px";
    app.appendChild(msg);
  }

  // ✅ Render fields
  if (meta.fields && meta.fields.length) {
    meta.fields.forEach(field => {
      const wrapper = document.createElement("div");
      wrapper.className = "rf-field";

      const label = document.createElement("label");
      label.textContent = field.label;

      const input = document.createElement("input");
      input.type = field.type === "number" ? "number" : "text";
      input.id = field.id;
      input.value = flowData[field.id] || "";

      if (field.autoFocus) input.autofocus = true;

      wrapper.appendChild(label);
      wrapper.appendChild(input);
      app.appendChild(wrapper);
    });
  }

  actionBtn.textContent = meta.action?.label || "Next";

  actionBtn.onclick = () => {
    if (meta.fields) {
      meta.fields.forEach(f => {
        const el = document.getElementById(f.id);
        if (el) flowData[f.id] = el.value;
      });
    }

    if (meta.nextScreen) {
      loadScreen(meta.nextScreen);
    }
  };
}
// ✅ Auto‑advance for success / system screens
if (meta.autoNext) {
  const delay = meta.autoNext.delayMs || 1500;

  setTimeout(() => {
    loadScreen(meta.autoNext.nextScreen);
  }, delay);
}
