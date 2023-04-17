let isEnabled = false;
let focusLength = 2;
let isDarkMode = false;

chrome.storage.sync.get(["isEnabled", "focusLength", "isDarkMode"], ({ isEnabled: savedIsEnabled, focusLength: savedFocusLength, isDarkMode: savedIsDarkMode }) => {
  isEnabled = savedIsEnabled;
  focusLength = savedFocusLength || 2;
  isDarkMode = savedIsDarkMode || false;
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
  } else if (request.action === "updateFocusLength") {
    focusLength = parseInt(request.focusLength, 10);
    if (isEnabled) {
      updateBionicReading();
    }
  } else if (request.action === "toggleDarkMode") {
    isDarkMode = request.isDarkMode;
    updateBionicReading();
  }
});

function injectCSS() {
  const primaryColor = isDarkMode ? '#B0C4DE' : 'inherit';
  const secondaryColor = isDarkMode ? '#A0D6B4' : 'grey';

  const styles = `
    .bionic-primary {
      font-weight: bold;
      color: ${primaryColor};
    }

    .bionic-secondary {
      font-weight: bold;
      color: ${secondaryColor};
    }
  `;

  const styleElement = document.createElement('style');
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);
}

function activateBionicReading() {
  injectCSS();
  let textNodes = getTextNodes(document.body);
  textNodes.forEach((node) => {
    let bionicText = applyBionicReading(node);
    let newNode = document.createElement("span");
    newNode.innerHTML = bionicText;
    node.parentNode.replaceChild(newNode, node);
  });
}

function deactivateBionicReading() {
  let bionicSpans = document.querySelectorAll(".bionic-primary, .bionic-secondary");
  bionicSpans.forEach((span) => {
    span.outerHTML = span.textContent;
  });
}

function getTextNodes(element) {
  let textNodes = [];
  let walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode: function (node) {
      if (
        !/^(script|style|noscript)$/i.test(node.parentNode.nodeName) &&
        node.textContent.trim().length > 0
      ) {
        return NodeFilter.FILTER_ACCEPT;
      }
    },
  }, false);

  while (node = walk.nextNode()) {
    textNodes.push(node);
  }

  return textNodes;
}

function applyBionicReading(textNode) {
  const text = textNode.nodeValue;
  const words = text.split(/(\s+)/);
  const bionicWords = words.map((word) => {
    if (/^\s+$/.test(word)) {
      return word;
    } else {
      let bionicWord = "";
      const characters = word.split('');

      characters.forEach((char, index) => {
        if (index === 0 || (index < focusLength && word.length > focusLength)) {
          bionicWord += `<span class="bionic-primary">${char}</span>`;
        } else if (index === Math.floor(word.length / 2)) {
          bionicWord += `<span class="bionic-secondary">${char}</span>`;
        } else {
          bionicWord += char;
        }
      });

      return bionicWord;
    }
  });

  return bionicWords.join('');
}

function updateBionicReading() {
  deactivateBionicReading();
  activateBionicReading();
}