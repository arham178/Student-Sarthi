// ---------------- Toast ----------------
function showToast() {
  const toast = document.createElement("div");
  toast.innerText = "Fields populated by Student Sarthi";

  Object.assign(toast.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#000",
    color: "#fff",
    padding: "10px",
    borderRadius: "8px",
    zIndex: 999999
  });

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ---------------- Highlight ----------------
function highlight(el) {
  el.style.backgroundColor = "#fff9c4";
  el.style.border = "2px solid #fbc02d";
}

// ---------------- Find field ----------------
function findField(keywords) {
  const inputs = document.querySelectorAll("input, textarea, select");

  let best = null;
  let bestScore = 0;

  inputs.forEach((el) => {
    const text = (
      el.name +
      " " +
      el.id +
      " " +
      el.placeholder +
      " " +
      el.getAttribute("aria-label")
    ).toLowerCase();

    let score = 0;

    keywords.forEach((k) => {
      if (text.includes(k)) score++;
    });

    if (score > bestScore) {
      bestScore = score;
      best = el;
    }
  });

  return best;
}

// ---------------- Set value (React-safe) ----------------
function setValue(el, value) {
  if (!el) return;

  el.focus();
  el.value = value;

  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));

  highlight(el);
}

// ---------------- Main fill ----------------
function fillForm(data) {
  const mappings = [
    { key: "name", keywords: ["name", "full name", "applicant"] },
    { key: "income", keywords: ["income", "salary", "annual"] },
    { key: "dob", keywords: ["dob", "birth", "date of birth"] },
    { key: "category", keywords: ["category", "caste", "social"] }
  ];

  mappings.forEach(({ key, keywords }) => {
    const field = findField(keywords);
    if (field && data[key]) {
      setValue(field, data[key]);
    }
  });

  showToast();
}

// ---------------- Listen from background ----------------
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "FILL_FORM") {
    fillForm(message.payload);
  }
});