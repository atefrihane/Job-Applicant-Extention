// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'analyzePage') {
        // Find all form fields on the page
        const html = document.querySelector("html").outerHTML;
        console.log(html)

        // Optional: if you want to log the HTML of the inputs specifically
        // const inputsHTML = Array.from(inputs).map(input => input.outerHTML);
        // console.log("lol")
        // console.log(inputsHTML);

        // Send back success response
        sendResponse({
            success: true
        });
    }
    return true; // Important! Keeps the message channel open
});