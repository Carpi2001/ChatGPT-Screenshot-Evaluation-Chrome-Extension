console.log("popup.js loaded!");

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded!");
    
    let captureButton = document.getElementById("capture");
    if (!captureButton) {
        console.error("Button not found!");
        return;
    }//makes sure the capture buttons exists

    captureButton.addEventListener("click", () => {
        console.log("Button clicked!");

        chrome.runtime.sendMessage({ action: "capture_full_screenshot" });//when the button is clicked, this runtime message is sent, alerting the service worker to start the screeshot function
    });
});