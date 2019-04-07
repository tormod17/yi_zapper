let source = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // sent from another content script, intended for saving source
  if (request.action === "migrationPut") {
    source = request.source;
    chrome.tabs.create({ url: "migration.html" });
  }
  // sent from newtab-contentscript, to get the source
  if (request.action === "migrationGet") {
    sendResponse({ source: source });
  }
});
