function getRecipeData() {
    let data;

    const ldJsonScript = document.querySelector(
        'script[type="application/ld+json"]'
    );

    if (ldJsonScript) {
        data = JSON.parse(ldJsonScript.textContent);
    }

    return data;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "FROM_POPUP" && message.action === "GET_DATA") {
        const data = getRecipeData();

        sendResponse({ success: true, data: data || "Could not get data" });
    }
});
