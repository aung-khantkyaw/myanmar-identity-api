let states = [];
let townships = [];
let nrcTypes = [];

const statusEl = document.getElementById("status");
const responseEl = document.getElementById("response");
const resultBox = document.getElementById("result");

// Load initial data
async function loadData() {
  try {
    const [statesRes, nrcTypesRes] = await Promise.all([
      fetch("/v1/states"),
      fetch("/v1/nrc-types"),
    ]);

    states = await statesRes.json();
    nrcTypes = await nrcTypesRes.json();

    populateStates();
    populateNrcTypes();
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

function populateStates() {
  const select = document.getElementById("state-select");
  states.forEach((state) => {
    const option = document.createElement("option");
    option.value = state.number.en;
    option.textContent = `${state.number.en} - ${state.name.en} (${state.name.mm})`;
    select.appendChild(option);
  });
}

function populateNrcTypes() {
  const select = document.getElementById("nrc-type-select");
  nrcTypes.forEach((type) => {
    const option = document.createElement("option");
    option.value = type.name.en;
    option.textContent = `${type.name.en} - ${type.name.mm}`;
    select.appendChild(option);
  });
}

async function onStateChange() {
  const stateNumber = document.getElementById("state-select").value;
  const townshipSelect = document.getElementById("township-select");

  if (!stateNumber) {
    townshipSelect.disabled = true;
    townshipSelect.innerHTML = '<option value="">Select Township</option>';
    return;
  }

  try {
    const response = await fetch(`/v1/states/number/${stateNumber}/townships`);
    townships = await response.json();

    townshipSelect.innerHTML = '<option value="">Select Township</option>';
    townships.forEach((township) => {
      const option = document.createElement("option");
      option.value = township.short.en;
      option.textContent = `${township.short.en} - ${township.name.en} (${township.name.mm})`;
      townshipSelect.appendChild(option);
    });

    townshipSelect.disabled = false;
  } catch (error) {
    console.error("Error loading townships:", error);
  }
}

function switchTab(tab) {
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .querySelectorAll(".tab-content")
    .forEach((content) => content.classList.remove("active"));

  document
    .querySelector(`[onclick="switchTab('${tab}')"]`)
    .classList.add("active");
  document.getElementById(`${tab}-tab`).classList.add("active");

  statusEl.dataset.state = "";
  statusEl.textContent =
    tab === "build"
      ? "Fill the form to build an NRC."
      : "Enter an NRC to validate.";
  resultBox.hidden = true;
}

function showResult(message, type, data = null) {
  statusEl.dataset.state = type;
  statusEl.textContent = message;

  if (data) {
    responseEl.textContent = JSON.stringify(data, null, 2);
    resultBox.hidden = false;
  } else {
    resultBox.hidden = true;
  }
}

function initGetPlayground() {
  const panels = document.querySelectorAll(".endpoint-playground");

  const formatStatus = (el, message, state = "") => {
    if (!el) return;
    el.textContent = message;
    el.dataset.state = state;
  };

  panels.forEach((panel) => {
    const template = panel.dataset.template;
    const form = panel.querySelector("form");
    const statusNode = panel.querySelector(".endpoint-status");
    const resultWrapper = panel.querySelector(".endpoint-result");
    const codeNode = resultWrapper?.querySelector("code");

    if (!form || !template) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      let finalPath = template;
      const formData = new FormData(form);

      formData.forEach((value, key) => {
        const input = form.querySelector(`[name="${key}"]`);
        let processed = value.trim();
        if (input?.dataset.transform === "upper") {
          processed = processed.toUpperCase();
          input.value = processed;
        }
        finalPath = finalPath.replace(`:${key}`, encodeURIComponent(processed));
      });

      if (finalPath.includes(":")) {
        formatStatus(
          statusNode,
          "Please supply all required parameters.",
          "error"
        );
        if (resultWrapper) resultWrapper.hidden = true;
        return;
      }

      formatStatus(statusNode, `Calling ${finalPath}…`, "loading");
      if (resultWrapper) resultWrapper.hidden = true;

      try {
        const response = await fetch(finalPath);
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.error || `Request failed with ${response.status}`
          );
        }

        formatStatus(statusNode, "Success", "success");
        if (codeNode) {
          codeNode.textContent = JSON.stringify(data, null, 2);
          if (resultWrapper) resultWrapper.hidden = false;
        }
      } catch (error) {
        formatStatus(
          statusNode,
          error.message || "Unable to fetch endpoint",
          "error"
        );
        if (resultWrapper) resultWrapper.hidden = true;
      }
    });
  });
}

// Event listeners
document
  .getElementById("state-select")
  .addEventListener("change", onStateChange);

document.getElementById("build-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const state = formData.get("state");
  const township = formData.get("township");
  const nrcType = formData.get("nrcType");
  const serial = formData.get("serial");

  if (!state || !township || !nrcType || !serial) {
    showResult("Please fill all fields", "error");
    return;
  }

  if (serial.length !== 6 || !/^\d{6}$/.test(serial)) {
    showResult("Serial number must be 6 digits", "error");
    return;
  }

  const nrc = `${state}/${township}(${nrcType})${serial}`;
  document.getElementById("nrc-input").value = nrc;

  showResult(`Built NRC: ${nrc}`, "loading");

  try {
    const response = await fetch("/v1/nrc/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nrc }),
    });

    const data = await response.json();

    if (response.ok) {
      showResult(`Valid NRC built successfully!`, "success", data);
    } else {
      showResult(data.error, "error");
    }
  } catch (error) {
    showResult("Error validating built NRC", "error");
  }
});

document.getElementById("test-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const nrc = formData.get("nrc").trim();

  if (!nrc) {
    showResult("Please enter an NRC number", "error");
    return;
  }

  showResult(`Testing NRC: ${nrc}...`, "loading");

  try {
    const response = await fetch("/v1/nrc/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nrc }),
    });

    const data = await response.json();

    if (response.ok) {
      showResult(`Valid NRC!`, "success", data);
    } else {
      showResult(data.error, "error");
    }
  } catch (error) {
    showResult("Error testing NRC", "error");
  }
});

// Load data on page load
loadData();
initGetPlayground();
