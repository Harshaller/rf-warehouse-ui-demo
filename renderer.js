console.log("✅ renderer.js loaded");

let flowData = {};
let currentScreen = null;

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
      console.log("Loaded screen:", meta.screenId);
      renderScreen(meta);
    })
    .catch(err => console.error("Screen load failed:", err));
}

function renderScreen(meta) {
  const header = document.querySelector(".rf-header");
  const app = document.getElementById("app");
  const actionBtn = document.getElementById("primaryAction");

  if (!header || !app || !actionBtn) {
    console.error("UI shell not found");
    return;
  }

  header.textContent = meta.title || "";
  app.innerHTML = "";

  /* ✅ Message screen */
  if (meta.message) {
    const msg = document.createElement("div");
    msg.textContent = meta.message;
    msg.style.fontSize = "18px";
    msg.style.paddingTop = "20px";
    app.appendChild(msg);
  }

  /* ✅ Fields */
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

      wrapper.appendChild(label);
      wrapper.appendChild(input);
      app.appendChild(wrapper);

      if (field.autoFocus) {
        setTimeout(() => input.focus(), 0);
      }
    });
  }

  /* ✅ Primary button */
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

  /* ✅ ✅ AUTO‑NEXT (THIS FIXES PUTAWAY) */
  if (meta.autoNext) {
    const delay = meta.autoNext.delayMs || 1500;
    console.log(
      `⏭ AutoNext: ${meta.screenId} → ${meta.autoNext.nextScreen}`
    );
    setTimeout(() => {
      loadScreen(meta.autoNext.nextScreen);
    }, delay);
  }
}
