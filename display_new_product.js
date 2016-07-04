var product = null;

function add_more_attr(key, value) {
	var cai = $('.custom-attr-item').last();
	cai.find('input').first().val(key);
	cai.find('input').last().val(value);
	$('#copyActionButton').click();
}

// no sign of use of this function yet
function select_by_val(elem, val) {
	var name = elem.attr('name');
	$('[name=' + name + ']').val(val);
}

function create_other_input(name, value) {
	// this function is used to create a input box which should be
	// visible on the page after you select a "other" value
	var input_name = 'otherAttrContext' + name.replace('sysAttrValueIdAndValue', '');
	var input = '<input value="' + value + '" id="" name="' + input_name + '" type="text" class="ui-textfield ui-textfield-system ui-control-m">';
	return input;
}

function select_by_text(elem, text) {
	var name = elem.find('select').attr('name');
	var option = $('[name=' + name + '] option').filter(function() {
		return ($(this).text() == text);
	});

	if (option.length) {
		option.prop('selected', true);
	} else {
		$('[name=' + name + '] option').filter(function() {
			return ($(this).text() == 'Other')
		}).prop('selected', true);
		var input = create_other_input(name, text);
		elem.append(input);
	}
}

function check_box(elem, values) {
	// get all available default options 
	var defaults = [];
	elem.find('label').map(function() {
		defaults.push($(this).text().trim());
	});

	var left = [];
	values.forEach(function(v) {
		var find = false;
		var v = v.trim();
		defaults.forEach(function(d, position) {
			if (v == d) {
				find = true;
				elem.find('input:eq(' + position + ')').prop('checked', true);
				return;
			}
		})
		if (find == false) {
			left.push(v);
		}
	})

	if (left.length != 0) {
		elem.find('input:eq(0)').parent().click();
		elem.find('input[type="text"]').val(left.join(','));
	}
}

function fill_attr(elem, val) {
	if (elem.find('input[type=text]').size() > 0) {
		elem.find('input').val(val);
	} else if (elem.find('select').size() > 0) {
		select_by_text(elem, val);
	} else if (elem.find('input[type=checkbox]').size() > 0) {
		check_box(elem, val.split(','));
	}
}

function mark_empty_attr(elem) {
	// could be one of the following
	$(elem).find('input[type=text]').css('border', '2px solid red');
	$(elem).find('select').css('border', '2px solid red');
	$(elem).find('input[type=checkbox]').css('border', '2px solid red');
}

function paste_product() {
	chrome.runtime.sendMessage({'action': 'paste_product'}, function(resp) {
		var temp = resp.product;
		if (temp === '') {
			alert('请先复制产品');
			return;
		}
		auto_fill_product(temp);
	});
}

function auto_fill_product(product) {
	// find out what lang that this page is in
	var is_en = $('.ui-header-lan-display-text').html() == 'English';
	if (!is_en) {
		alert('请先把页面语言设置为英文');
		return false;
	}
	// set up inital state for all product attr list
	for (var i = product.attrs.length - 1; i >= 0; i--) {
		product.attrs[i][2] = false;
	}

	product.get_attr_val = function(key) {
		for (var i = 0; i < product.attrs.length; i++) {
			if (product.attrs[i][0] == key) {
				product.attrs[i][2] = true;
				return product.attrs[i][1];
			}
		}
		return false;
	}
	// attrs needs to fill
	var attrs = [];
	// attr's key
	$('.attr-title').map(function() {
		attrs.push($(this).html());
	});
	// attrs's value
	var values = $('#productAttribute').find('.ui-form-control');
	// walk through it pair by pair
	attrs.forEach(function(attr_name, key_index) {
		// get attr value from product's attr list by the key
		var attr_val = product.get_attr_val(attr_name);
		var values_tag = $(values[key_index]);
		// first rule out the attr we don't care
		if (attr_name == 'Place of Origin') {
			$('[name=contryValue]').val('CN-China (Mainland)');
			// maybe create a input to mimic a select
			$('[name="provinceValue"]').val('GUA-Guangdong');
			return;
		}
		// clear some data that's already there
		if (attr_name == 'Packaging Material') {
			values_tag.find('input[type="checkbox"]').prop('checked', false);
		}
		if (attr_name == 'Application') {
			values_tag.find('input[type="checkbox"]').prop('checked', false);
		}
		// start to fill if you get attr value
		if (attr_val !== false) {
			fill_attr(values_tag, attr_val);
		} else {
			mark_empty_attr(values_tag);
		}
	});
	// loop through all attrs to finish the unfilled attr
	$('.del-custom-attr.icon-del').click();
	product.attrs.forEach(function(attr) {
		if (!attr[2]) {
			add_more_attr(attr[0], attr[1]);
		}
	});

	// trade information
	$('label[for="price-setting-fob-radio"').click();

	$('#minOrderQuantity').val(product.min_order_quantity);
	$('#minOrderUnit').val(product.min_order_unit);

	$('#moneyType').val(product.money_type);
	$('#priceRangeMin').val(product.price_range_min);
	$('#priceRangeMax').val(product.price_range_max);
	$('#priceUnit').val(product.price_unit);

	$('#supplyQuantity').val(product.supply_quantity);
	$('#supplyUnit').val(product.supply_unit);
	$('#supplyPeriod').val(product.supply_period);

	common_things_to_update();
}

function auto_fill_rich_text(product) {
	// fisrt select Standard Editing
	$('input:radio[name=editorselector]:eq(0)').attr('checked', false);
	$('input:radio[name=editorselector]:eq(1)').attr('checked', true);
	$('input:radio[name=editorselector]:eq(1)').click();

	var rich_f = function(content) {
		if (content.constructor === Array) {
			content = content.join('');
		}
		tinyMCE.activeEditor.setContent(content);
	}

	// var rich_text = product.rich_text.replace('{{title}}', product_name);
	var rich_code = '(' + rich_f.toString() + ')(' + JSON.stringify(product.rich_text) + ')';
	var script = document.createElement('script');
	script.textContent = rich_code;
	setTimeout(function() {
		(document.head || document.documentElement).appendChild(script);
		script.parentNode.removeChild(script);
	}, 1500);
}

window.addEventListener("upload_from_back", function(data) {
	if (!data.detail) {
		alert('未能获取Login ID');
		return false;
	}
	var login_id = data.detail;
	var model = product.model;
	var action = 'upload';
	send_background_ajax_get(KW_URL, {login_id, model, action});
}, false);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

	if (request.action == 'set_product') {
		product = request.product;

		$('#productName').after('<button id="auto_fill" type="button" class="ui-button ui-button-normal ui-button-big">填写</button>');

		$('#auto_fill').click(function() {
			inject_script(chrome.extension.getURL('get_login_id.js'));
		});
	}

	// set the category
	if (request.action == 'set_category') {
		$('#search-keyword').val(request.category[request.category.length - 1]);
		$('button[type=submit]').click();
	}

	if (request.action == 'ajax_in_back_returns') {
    	dom_update_tk(request.data);
    	auto_fill_product(product);
		auto_fill_rich_text(product);
    }

});