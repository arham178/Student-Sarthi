chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FILL_FORM") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;

      chrome.tabs.sendMessage(tabs[0].id, {
        type: "FILL_FORM",
        payload: message.payload
      });
    });
-+
    sendResponse({ ok: true });
  }
});