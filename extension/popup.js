const GET_CHERVIL = "https://getchervil.com/";

async function currentTab() {
  const [t] = await chrome.tabs.query({ active: true, currentWindow: true });
  return t || {};
}

function deepLink({ url, title, text, action }) {
  const p = new URLSearchParams();
  if (action) p.set("action", action);
  if (text) p.set("text", text);
  if (url) p.set("url", url);
  if (title) p.set("title", title);
  return "chervil://ask?" + p.toString();
}

function openInChervil(link) {
  chrome.tabs.create({ url: link });
  window.close();
}

document.getElementById("askpage").addEventListener("click", async () => {
  const t = await currentTab();
  openInChervil(deepLink({ action: "summarize", url: t.url, title: t.title }));
});

document.getElementById("keypage").addEventListener("click", async () => {
  const t = await currentTab();
  openInChervil(deepLink({ action: "keypoints", url: t.url, title: t.title }));
});

document.getElementById("askq").addEventListener("click", async () => {
  const q = document.getElementById("q").value.trim();
  if (!q) return;
  const t = await currentTab();
  openInChervil(deepLink({ text: q, url: t.url, title: t.title }));
});

document.getElementById("q").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("askq").click();
});

document.getElementById("get").href = GET_CHERVIL;
