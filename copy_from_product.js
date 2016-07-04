setTimeout(set_up_btn, 1500) 
// currently don't know how to accquire the product id
// 
function set_up_btn() {
	$('#productName').after('<button id="auto_fill_tk" type="button" class="ui-button ui-button-normal ui-button-big">填写</button>');

	$('#auto_fill_tk').click(function() {
		var model = find_model();
		if (model !== false) {
			var action = 'copy';
			send_background_ajax_get(KW_URL, {model, action})
			$('#auto_fill_tk').remove();
		}
		// inject_script(chrome.extension.getURL('get_login_id.js'));
	});
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == 'ajax_in_back_returns') {
    	dom_update_tk(request.data);
    }
});

// window.addEventListener("fill_product_title_keywords", function(data) {
// 	var email = ACCOUNT_ID_EMAIL_MAP[data.detail];
// 	if (email) {
// 	    fill_title_keywords_begin(email);
// 	} else {
// 		alert('帐户没有设置对应邮箱');
// 	}
// }, false)