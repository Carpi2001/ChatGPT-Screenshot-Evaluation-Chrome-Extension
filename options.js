document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.sync.get(["apiKeyScreenshotExtension"], function(result) {
        if (result.apiKeyScreenshotExtension) {
            document.getElementById("apiKeyScreenshotExtension").value = result.apiKeyScreenshotExtension;
        }
    });
});//loads the api key if it is already saved to the users chrome storage and sets the input box to the current key

document.getElementById("save").addEventListener("click", function() {
    let apiKeyScreenshotExtension = document.getElementById("apiKeyInput").value.trim();
    chrome.storage.sync.set({ apiKeyScreenshotExtension: apiKeyScreenshotExtension }, function() {
        document.getElementById("status").textContent = "API Key has been successfully updated!";
    });
});//saves the key to the users synced chrome storage (should be local if sync isn't enabled according to chrome documentation)

//javascript for the html options page