// This background script will remain minimal for now,
// but can be expanded for features like notifications or alarms
chrome.runtime.onInstalled.addListener(() => {
    console.log('Flashcard Extension installed');
  });