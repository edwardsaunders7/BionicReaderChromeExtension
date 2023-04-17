const toggleSwitch = document.getElementById("toggleSwitch");
const focusLength = document.getElementById("focusLength");
const focusLengthValue = document.getElementById("focusLengthValue");
const darkModeToggle = document.getElementById("darkModeToggle");

chrome.storage.sync.get(["isEnabled", "focusLength", "isDarkMode"], ({ isEnabled, focusLength: savedFocusLength, isDarkMode }) => {
  toggleSwitch.checked = isEnabled;
  focusLength.value = savedFocusLength || 2;
  focusLengthValue.textContent = focusLength.value;
  darkModeToggle.checked = isDarkMode;
});

toggleSwitch.addEventListener("change", () => {
  const isEnabled = toggleSwitch.checked;
  chrome.storage.sync.set({ isEnabled });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: isEnabled ? "activateBionicReading" : "deactivateBionicReading",
    });
  });
});

focusLength.addEventListener("input", () => {
  const value = focusLength.value;
  focusLengthValue.textContent = value;
  chrome.storage.sync.set({ focusLength: value });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "updateFocusLength", focusLength: value });
  });
});

darkModeToggle.addEventListener("change", () => {
  const isDarkMode = darkModeToggle.checked;
  chrome.storage.sync.set({ isDarkMode });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "toggleDarkMode", isDarkMode });
  });
});
