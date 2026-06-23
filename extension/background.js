// Right-click → "Ask Sprig" → open the page/selection/link in the Chervil desktop
// app via the chervil:// deep link the app registers. An optional `action` param
// shapes what Sprig does with it (summarize, key points, explain…).

function deepLink({ url, title, text, action }) {
  const p = new URLSearchParams();
  if (action) p.set("action", action);
  if (text) p.set("text", text);
  if (url) p.set("url", url);
  if (title) p.set("title", title);
  return "chervil://ask?" + p.toString();
}

function openChervil(args) {
  chrome.tabs.create({ url: deepLink(args) });
}

// Build the deep-link args for each menu item from the click context.
const MENU = {
  "ask-page": (info, tab) => ({ url: tab && tab.url, title: tab && tab.title }),
  "sum-page": (info, tab) => ({ action: "summarize", url: tab && tab.url, title: tab && tab.title }),
  "key-page": (info, tab) => ({ action: "keypoints", url: tab && tab.url, title: tab && tab.title }),
  "ask-sel": (info, tab) => ({ text: info.selectionText, url: tab && tab.url, title: tab && tab.title }),
  "explain-sel": (info, tab) => ({ action: "explain", text: info.selectionText, url: tab && tab.url, title: tab && tab.title }),
  "key-sel": (info, tab) => ({ action: "keypoints", text: info.selectionText, url: tab && tab.url, title: tab && tab.title }),
  "open-link": (info) => ({ action: "summarize", url: info.linkUrl, title: info.linkUrl }),
};

chrome.runtime.onInstalled.addListener(() => {
  // removeAll first so updating the extension doesn't throw on duplicate ids.
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: "sprig", title: "Ask Sprig", contexts: ["page", "selection", "link"] });
    // Page
    chrome.contextMenus.create({ id: "ask-page", parentId: "sprig", title: "About this page", contexts: ["page"] });
    chrome.contextMenus.create({ id: "sum-page", parentId: "sprig", title: "Summarize this page", contexts: ["page"] });
    chrome.contextMenus.create({ id: "key-page", parentId: "sprig", title: "Key points", contexts: ["page"] });
    // Selection
    chrome.contextMenus.create({ id: "ask-sel", parentId: "sprig", title: 'About “%s”', contexts: ["selection"] });
    chrome.contextMenus.create({ id: "explain-sel", parentId: "sprig", title: 'Explain “%s” simply', contexts: ["selection"] });
    chrome.contextMenus.create({ id: "key-sel", parentId: "sprig", title: 'Key points from “%s”', contexts: ["selection"] });
    // Link
    chrome.contextMenus.create({ id: "open-link", parentId: "sprig", title: "Open this link in Chervil", contexts: ["link"] });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const build = MENU[info.menuItemId];
  if (build) openChervil(build(info, tab));
});

// Keyboard shortcut: summarize the current page (see manifest "commands").
if (chrome.commands && chrome.commands.onCommand) {
  chrome.commands.onCommand.addListener(async (command) => {
    if (command !== "summarize-page") return;
    const [t] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (t) openChervil({ action: "summarize", url: t.url, title: t.title });
  });
}
