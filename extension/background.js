// Right-click → "Ask Sprig" → open the page/selection in the Chervil desktop app
// via the chervil:// deep link the app registers.

function deepLink({ url, title, text }) {
  const p = new URLSearchParams();
  if (text) p.set("text", text);
  if (url) p.set("url", url);
  if (title) p.set("title", title);
  return "chervil://ask?" + p.toString();
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: "ask-page", title: "Ask Sprig about this page", contexts: ["page"] });
  chrome.contextMenus.create({ id: "ask-selection", title: 'Ask Sprig about “%s”', contexts: ["selection"] });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const link =
    info.menuItemId === "ask-selection"
      ? deepLink({ text: info.selectionText, url: tab && tab.url, title: tab && tab.title })
      : deepLink({ url: tab && tab.url, title: tab && tab.title });
  chrome.tabs.create({ url: link });
});
