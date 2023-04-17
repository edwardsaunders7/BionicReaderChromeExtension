let isEnabled = false;
let focusLength = 2;
let isDarkMode = false;
let isDarkMode2 = false;

chrome.storage.sync.get(["isEnabled", "focusLength", "isDarkMode", "isDarkMode2"], ({ isEnabled: savedIsEnabled, focusLength: savedFocusLength, isDarkMode: savedIsDarkMode, isDarkMode2: savedIsDarkMode2 }) => {
  isEnabled = savedIsEnabled;
  focusLength = savedFocusLength || 2;
  isDarkMode = savedIsDarkMode || false;
  isDarkMode2 = savedIsDarkMode2 || false;
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
  } else if (request.action === "toggleDarkMode2") {
    isDarkMode2 = request.isDarkMode2;
    updateBionicReading();
  }
});

function injectCSS() {
  const primaryColor = isDarkMode ? '#B0C4DE' : 'inherit';
  const secondaryColor = isDarkMode ? '#A0D6B4' : 'grey';

  const primaryColor2 = isDarkMode2 ? '#FFA07A' : 'inherit'; // New alternate color
  const secondaryColor2 = isDarkMode2 ? '#FFB6C1' : 'grey'; // New alternate color

  const styles = `
    .bionic-primary {
      font-weight: bold;
      color: ${isDarkMode2 ? primaryColor2 : primaryColor};
    }

    .bionic-secondary {
      font-weight: bold;
      color: ${isDarkMode2 ? secondaryColor2 : secondaryColor};
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

function updateBionicReading() {
  deactivateBionicReading();
  activateBionicReading();
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