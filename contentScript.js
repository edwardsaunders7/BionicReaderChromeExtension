let isEnabled = false;
let focusLength = 2;
let isDarkMode = false;
let observer = null;

chrome.storage.sync.get(["isEnabled", "focusLength", "isDarkMode"], (settings) => {
  isEnabled = settings.isEnabled || false;
  focusLength = parseInt(settings.focusLength || 2, 10);
  isDarkMode = settings.isDarkMode || false;

  updateThemeClass();

  if (isEnabled) {
    activateBionicReading();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "activateBionicReading") {
    isEnabled = true;
    activateBionicReading();
  } else if (request.action === "deactivateBionicReading") {
    isEnabled = false;
    deactivateBionicReading();
  } else if (request.action === "updateSettings") {
    focusLength = parseInt(request.focusLength, 10);
    isDarkMode = request.isDarkMode;
    updateThemeClass();
    if (isEnabled) {
      updateBionicReading();
    }
  }
});

function updateThemeClass() {
  if (isDarkMode) {
    document.body.classList.add("bionic-dark");
    document.body.classList.remove("bionic-light");
  } else {
    document.body.classList.add("bionic-light");
    document.body.classList.remove("bionic-dark");
  }
}

function activateBionicReading() {
  updateThemeClass();
  processElement(document.body);
  startObserver();
}

function deactivateBionicReading() {
  stopObserver();
  document.body.classList.remove("bionic-dark", "bionic-light");
  let bionicWrappers = document.querySelectorAll(".bionic-wrapper");
  bionicWrappers.forEach((wrapper) => {
    const textNode = document.createTextNode(wrapper.textContent);
    wrapper.parentNode.replaceChild(textNode, wrapper);
  });
}

function updateBionicReading() {
  deactivateBionicReading();
  activateBionicReading();
}

function processElement(element) {
  let textNodes = getTextNodes(element);
  textNodes.forEach((node) => {
    let bionicText = applyBionicReading(node.nodeValue);
    let newNode = document.createElement("span");
    newNode.className = "bionic-wrapper";
    newNode.innerHTML = bionicText;
    if (node.parentNode) {
      node.parentNode.replaceChild(newNode, node);
    }
  });
}

function getTextNodes(element) {
  let textNodes = [];
  let walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode: function (node) {
      const parent = node.parentNode;
      if (!parent) return NodeFilter.FILTER_REJECT;

      const tag = parent.nodeName.toLowerCase();
      const isEditable = parent.isContentEditable || tag === 'input' || tag === 'textarea';
      const isIgnoredTag = /^(script|style|noscript|code|pre|svg|canvas)$/i.test(tag);
      const isAlreadyBionic = parent.classList.contains('bionic-wrapper') || parent.closest('.bionic-wrapper');

      if (!isEditable && !isIgnoredTag && !isAlreadyBionic && node.textContent.trim().length > 0) {
        return NodeFilter.FILTER_ACCEPT;
      }
      return NodeFilter.FILTER_REJECT;
    },
  }, false);

  while (node = walk.nextNode()) {
    textNodes.push(node);
  }

  return textNodes;
}

function applyBionicReading(text) {
  const words = text.split(/(\s+)/);

  const bionicWords = words.map((word) => {
    if (/^\s+$/.test(word) || word.length === 0) {
      return word;
    }

    const len = word.length;
    let boldLength = 1;

    if (len === 1) {
      boldLength = 1;
    } else if (len <= 3) {
      boldLength = focusLength === 1 ? 1 : 2;
    } else if (len <= 8) {
      boldLength = Math.ceil(len * (0.3 + focusLength * 0.1));
    } else {
      boldLength = Math.ceil(len * (0.25 + focusLength * 0.08));
    }

    boldLength = Math.min(boldLength, len);

    const primaryPart = word.slice(0, boldLength);
    const restPart = word.slice(boldLength);

    return `<span class="bionic-primary">${primaryPart}</span>${restPart}`;
  });

  return bionicWords.join('');
}

function startObserver() {
  if (observer) return;
  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('bionic-wrapper')) {
          processElement(node);
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function stopObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}
