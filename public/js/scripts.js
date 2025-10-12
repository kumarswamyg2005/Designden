// Global axios defaults
if (window.axios) {
  axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
}

// Simple helper for fetch/axios with fallback
window.api = {
  get: async (url) => {
    if (window.axios) return (await axios.get(url)).data;
    const res = await fetch(url, {
      headers: { "X-Requested-With": "XMLHttpRequest" },
    });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  },
  post: async (url, body) => {
    if (window.axios) return (await axios.post(url, body)).data;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  },
};

// Toast utility using Bootstrap
window.toast = (message, type = "info") => {
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} position-fixed top-0 end-0 m-3 shadow`;
  alert.role = "alert";
  alert.style.zIndex = 1080;
  alert.textContent = message;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 3000);
};
document.addEventListener("DOMContentLoaded", () => {
  // Theme toggle: icon button at navbar end
  const themeBtn = document.getElementById("themeToggleBtn");
  const themeIcon = document.getElementById("themeIcon");
  const applyTheme = (dark) => {
    if (dark) {
      document.body.classList.add("dark-theme");
      if (themeIcon) {
        themeIcon.classList.remove("fa-sun");
        themeIcon.classList.add("fa-moon");
      }
    } else {
      document.body.classList.remove("dark-theme");
      if (themeIcon) {
        themeIcon.classList.remove("fa-moon");
        themeIcon.classList.add("fa-sun");
      }
    }
  };

  try {
    const saved = localStorage.getItem("designden_theme");
    applyTheme(saved === "dark");
  } catch (e) {}

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const dark = !document.body.classList.contains("dark-theme");
      applyTheme(dark);
      try {
        localStorage.setItem("designden_theme", dark ? "dark" : "light");
      } catch (e) {}
    });
  }
  // Design Studio Preview
  const designForm = document.getElementById("designForm");
  if (designForm) {
    const fabricSelect = document.getElementById("fabric");
    const colorInputs = document.querySelectorAll('input[name="color"]');
    const patternInputs = document.querySelectorAll('input[name="pattern"]');
    const sizeSelect = document.getElementById("size");

    const previewFabric = document.getElementById("previewFabric");
    const previewColor = document.getElementById("previewColor");
    const previewPattern = document.getElementById("previewPattern");
    const previewSize = document.getElementById("previewSize");

    // Update preview when form elements change
    fabricSelect.addEventListener("change", updatePreview);
    colorInputs.forEach((input) =>
      input.addEventListener("change", updatePreview)
    );
    patternInputs.forEach((input) =>
      input.addEventListener("change", updatePreview)
    );
    sizeSelect.addEventListener("change", updatePreview);

    function updatePreview() {
      if (fabricSelect.value) {
        previewFabric.textContent = fabricSelect.value;
      }

      const selectedColor = document.querySelector(
        'input[name="color"]:checked'
      );
      if (selectedColor) {
        previewColor.textContent = selectedColor.value;

        // Update the preview image background color
        const previewContainer = document.getElementById("previewContainer");
        if (previewContainer) {
          // Map color names to CSS colors
          const colorMap = {
            Red: "red",
            Blue: "blue",
            Green: "green",
            Black: "black",
            White: "white",
            Gray: "gray",
            Yellow: "yellow",
            Purple: "purple",
            Pink: "pink",
            Orange: "orange",
            Brown: "brown",
            "Navy Blue": "navy",
            Maroon: "maroon",
            "Forest Green": "forestgreen",
            Teal: "teal",
            Lavender: "lavender",
            Gold: "gold",
            Silver: "silver",
          };

          const bgColor =
            colorMap[selectedColor.value] || selectedColor.value.toLowerCase();
          previewContainer.style.backgroundColor = bgColor;

          // Adjust text color for visibility
          if (
            ["Black", "Navy Blue", "Maroon", "Forest Green"].includes(
              selectedColor.value
            )
          ) {
            previewContainer.style.color = "white";
          } else {
            previewContainer.style.color = "black";
          }
        }
      }

      const selectedPattern = document.querySelector(
        'input[name="pattern"]:checked'
      );
      if (selectedPattern) {
        previewPattern.textContent = selectedPattern.value;

        // Update the preview image pattern
        const previewContainer = document.getElementById("previewContainer");
        if (previewContainer) {
          // Reset background
          previewContainer.style.backgroundImage = "none";

          // Apply pattern
          switch (selectedPattern.value) {
            case "Checkered":
              previewContainer.style.backgroundImage =
                "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)";
              break;
            case "Striped":
              previewContainer.style.backgroundImage =
                "repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)";
              break;
            case "Polka Dot":
              previewContainer.style.backgroundImage =
                "radial-gradient(circle, rgba(0,0,0,0.1) 2px, transparent 2px)";
              previewContainer.style.backgroundSize = "20px 20px";
              break;
            case "Floral":
              // Simplified representation
              previewContainer.style.backgroundImage =
                'url("/placeholder.svg?height=50&width=50")';
              previewContainer.style.backgroundSize = "50px 50px";
              previewContainer.style.backgroundRepeat = "repeat";
              break;
            case "Graphic Print":
              // Simplified representation
              previewContainer.style.backgroundImage =
                'url("/placeholder.svg?height=100&width=100")';
              previewContainer.style.backgroundSize = "100px 100px";
              previewContainer.style.backgroundRepeat = "no-repeat";
              previewContainer.style.backgroundPosition = "center";
              break;
          }
        }
      }

      if (sizeSelect.value) {
        previewSize.textContent = sizeSelect.value;
      }
    }
  }

  // Order Quantity and Price Calculator
  const quantityInput = document.getElementById("quantity");
  if (quantityInput) {
    const quantityDisplay = document.getElementById("quantityDisplay");
    const totalPrice = document.getElementById("totalPrice");
    const basePrice = 50; // Base price per item

    quantityInput.addEventListener("input", updatePrice);

    function updatePrice() {
      const quantity = Number.parseInt(quantityInput.value) || 1;
      const price = basePrice * quantity;

      quantityDisplay.textContent = quantity;
      totalPrice.textContent = "₹" + price.toFixed(2);
    }
  }

  // Form Validation
  const forms = document.querySelectorAll("form");
  forms.forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
});
