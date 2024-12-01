const getRecipeButton = document.getElementById("getRecipeData");

getRecipeButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];

        chrome.tabs.sendMessage(
            activeTab.id,
            { type: "FROM_POPUP_TO_CONTENT", action: "GET_DATA" },
            (res) => {
                // Show the recipe data in the popup UI, and then get the user to send it to the server. Need to handle auth somehow. Maybe I need to send the request to my server from the background script?

                chrome.runtime.sendMessage(
                    {
                        type: "FROM_POPUP_TO_BACKGROUND",
                        action: "SEND_DATA_TO_SERVER",
                        data: res.data,
                    },
                    (response) => {
                        // Get response back from background script to say it's finished processing

                        console.log(response);
                    }
                );
            }
        );
    });
});
