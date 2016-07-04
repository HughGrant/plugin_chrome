setTimeout(setup_update, 1500) 

function setup_update() {
	$('#productName').after('<button id="setup_update" type="button" class="ui-button ui-button-normal ui-button-big">更新</button>');
	$('#setup_update').click(function() {
		inject_script(chrome.extension.getURL('get_login_id.js'));
	});
}

window.addEventListener("from_product_editing_page", function(data) {
	if (!data.detail) {
		alert('未能获取Login ID');
		return false;
	}

	var login_id = data.detail
	var model = find_model();
	if (model !== false) {
		var apid = get_apid();
		var action = 'update';
		send_background_ajax_get(KW_URL, {model, apid, login_id, action})
		$('#setup_update').remove();
	}
}, false);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == 'ajax_in_back_returns') {
    	dom_update_tk(request.data);
    }
});




