//the code that runs in the service worker (i think that makes sense, at least thats how I understand it)

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "captureScreenshot",
        title: "Screenshot Page and Describe",
        contexts: ["all"]
    });
});//adds context menu button

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "captureScreenshot") {
        chrome.tabs.captureVisibleTab(null, { format: "png" }, function (image) {//captures screen
            if (chrome.runtime.lastError || !image) {
                console.error("Failed to capture screenshot:", chrome.runtime.lastError);
                return;
            }//checks if screen was captured successfully
            console.log("Screenshot captured!");
            processScreenshot(image);//process screenshot through chatgpt and gets a response back, which is then displayed
        });
    }
});//when context menu button pressed, triggers the screenshot functionality

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received message:", message);

    if (message.action === "capture_full_screenshot") {
        chrome.tabs.captureVisibleTab(null, { format: "png" }, function (image) {//captures screen
            if (chrome.runtime.lastError || !image) {
                console.error("Failed to capture screenshot:", chrome.runtime.lastError);
                return;
            }//checks if screen was captured successfully
            console.log("Screenshot captured!");
            processScreenshot(image);//process screenshot through chatgpt and gets a response back, which is then displayed
        });
    }
});//listens for the capture_full_screenshot message from the popup. It then takes a screenshot of the page and then sends it to the processScreenshot function

function processScreenshot(imageData) {
    console.log("Processing Screenshot:", imageData);//prints the screenshot as base64 link

    chrome.storage.sync.get(["apiKeyScreenshotExtension"], function (result) {//gets the api key from storage
        let apiKey = result.apiKeyScreenshotExtension;
        if (!apiKey) {
            console.error("API key not set.");
            return;
        }

		fetch("https://api.openai.com/v1/chat/completions", {//api call to openai, sending the image and prompt
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Describe what you see in this screenshot."//prompt
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageData//the base64 link for the screenshot
                            }
                        }
                    ]
                }
            ],
            max_tokens: 300
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })//checks the response if it was successful and then returns the response as a json
    .then(data => {
        console.log("OpenAI Response:", data);
        if (data.choices && data.choices.length > 0) {
            console.log("Description:", data.choices[0].message.content);
			sendNotification(data.choices[0].message.content);//for chrome notification containing the response
			sendAlert(data.choices[0].message.content);//for chrome alert containing response
			speakAlert(data.choices[0].message.content)//chrome text to speach for the response
        } else {
            console.error("No valid response from OpenAI.");
        }
    })//takes the response json and extracts the content of chatgpts response
    .catch(error => {
        console.error("Error making request:", error);
    });

    });
}//process image and then gets chatgpt response

function sendNotification(aiResponse){
	chrome.notifications.create({
				type: "basic",
				iconUrl: "/icon.jpeg",
				title: "ChatGPT Says",
				message: aiResponse,
				priority: 2
	});
}//makes a chrome notification with the passed text

function sendAlert(aiResponse) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
			const tabId = tabs[0].id;
            chrome.tabs.sendMessage(tabId, { aiAlert: aiResponse });//sends a message to the tab with the alert text
        }
    });
	
}//creates a chrome alert on the screenshotted page with the passed text

function speakAlert(aiResponse){
	chrome.tts.speak(aiResponse);
}//text to speech function for the chatgpt response