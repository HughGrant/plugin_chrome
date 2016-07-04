document.addEventListener("upload_product", function(data) {
    var product = data.detail;
    chrome.runtime.sendMessage(
        {
            action: 'upload_product',
            product: product
        }
    );
}, false);