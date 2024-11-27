chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (
        message.type === "FROM_POPUP" &&
        message.action === "SEND_DATA_TO_SERVER"
    ) {
        (async () => {
            try {
                const res = await fetch(
                    "http://localhost:8000/api/import-recipe",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ firstname: "Kevin" }),
                    }
                );
                const data = await res.json();

                sendResponse({
                    success: true,
                    message: "Message received and processed!",
                    data: data,
                });
            } catch (e) {
                sendResponse({
                    success: false,
                    message: "Server returned an error",
                });
            }
        })();

        return true;
    }
});
