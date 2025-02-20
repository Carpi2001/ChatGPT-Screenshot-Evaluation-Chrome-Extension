chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.aiAlert) {
        alert(request.aiAlert);
    }
});//when the message has an aiAlert, create an alert on the current tab.
