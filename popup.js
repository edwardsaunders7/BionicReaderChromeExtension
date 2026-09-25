const toggleSwitch = document.getElementById("toggleSwitch");
const darkModeToggle = document.getElementById("darkModeToggle");
const intensityButtons = document.querySelectorAll(".intensity-btn");

let currentFocusLength = 2;

chrome.storage.sync.get(
  { isEnabled: false, focusLength: 2, isDarkMode: false },
  (settings) => {
    toggleSwitch.checked = settings.isEnabled;
    darkModeToggle.checked = settings.isDarkMode;
    currentFocusLength = parseInt(settings.focusLength, 10);
    updateActiveButton(currentFocusLength);
  }
);

toggleSwitch.addEventListener("change", () => {
  const isEnabled = toggleSwitch.checked;
  chrome.storage.sync.set({ isEnabled });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: isEnabled ? "activateBionicReading" : "deactivateBionicReading",
      });
    }
  });
});

darkModeToggle.addEventListener("change", emitSettingsChange);

intensityButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFocusLength = parseInt(btn.dataset.value, 10);
    updateActiveButton(currentFocusLength);
    emitSettingsChange();
  });
});

function updateActiveButton(value) {
  intensityButtons.forEach((btn) => {
    if (parseInt(btn.dataset.value, 10) === value) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function emitSettingsChange() {
  const settings = {
    focusLength: currentFocusLength,
    isDarkMode: darkModeToggle.checked,
  };

  chrome.storage.sync.set(settings);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "updateSettings",
        ...settings,
      });
    }
  });
}
