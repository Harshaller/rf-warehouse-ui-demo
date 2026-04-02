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

  /* ✅ ALWAYS reset footer visibility */
  actionBtn.style.display = "block";

  header.textContent = meta.title || "";
  app.innerHTML = "";

  /* ✅ ACTION BUTTON MENU (POST PUTAWAY) */
  if (meta.actions && meta.actions.length) {
    meta.actions.forEach(action => {
      const btn = document.createElement("button");
      btn.textContent = action.label;
      btn.style.width = "100%";
      btn.style.padding = "14px";
      btn.style.fontSize = "18px";
      btn.style.marginBottom = "12px";
      btn.style.borderRadius = "6px";
      btn.style.border = "none";
      btn.style.background = "#0070f2";
      btn.style.color = "#fff";

      btn.onclick = () => {
        const routes = {
          FINISH_TASK: "TASK_COMPLETE",
          REPORT_DAMAGE: "DAMAGE_REPORT",
          QUALITY_CHECK: "QUALITY_CHECK",
          REPACK_HU: "REPACK_HU"
        };

        loadScreen(routes[action.id]);
      };

      app.appendChild(btn);
    });

    /* ✅ Hide footer ONLY for this screen */
    actionBtn.style.display = "none";
    return;
  }

  /* ✅ MESSAGE */
  if (meta.message) {
    const msg = document.createElement("div");
    msg.textContent = meta.message;
    msg.style.fontSize = "18px";
    msg.style.paddingTop = "20px";
    app.appendChild(msg);
  }

  /* ✅ FIELDS */
  if (meta.fields && meta.fields.length) {
    meta.fields.forEach(field => {
      const wrapper = document.createElement("div");
      wrapper.className = "rf-field";

      const label = document.createElement("label");
      label.textContent = field.label;

      let input;
      if (field.type === "select") {
        input = document.createElement("select");
        field.options.forEach(opt => {
          const o = document.createElement("option");
          o.value = opt;
          o.textContent = opt;
          input.appendChild(o);
        });
      } else {
        input = document.createElement("input");
        input.type = field.type === "number" ? "number" : "text";
      }

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

  /* ✅ FOOTER BUTTON */
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

  /* ✅ AUTO NEXT */
  if (meta.autoNext) {
    setTimeout(() => {
      loadScreen(meta.autoNext.nextScreen);
    }, meta.autoNext.delayMs || 1500);
  }
}