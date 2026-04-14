export const storage = {
  // Save data
  set(key, value) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve(true);
      });
    });
  },

  // Get data
  get(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key]);
      });
    });
  },

  // Remove one item
  remove(key) {
    return new Promise((resolve) => {
      chrome.storage.local.remove(key, () => {
        resolve(true);
      });
    });
  },

  // Clear all storage
  clear() {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => {
        resolve(true);
      });
    });
  }
};