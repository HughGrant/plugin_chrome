var select_btn = '<a id="select_keyword" class="ui-button ui-button-primary ui-button-medium">反选</a>';
var append_btn = '<a id="append_keyword" class="ui-button ui-button-primary ui-button-medium">添加</a>';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.action == 'set_name') {
		$(function() {
			$('#J-search-keywords').val(request.name);
		});
	}
});

$(function() {
	$('#J-search-trigger').after(select_btn);
	$('#select_keyword').after(append_btn);

	setInterval(adding_boxes, 1000);

	$('#select_keyword').click(function() {
		var f = detect_keywords();
		if (!f) {
			return false;
		}
		$('.ynkw').prop('checked', false);
	});

	$('#append_keyword').click(function() {
		var f = detect_keywords();
		if (!f) {
			return false;
		}
		var kws = $('.ynkw:checked');
		if (kws.length == 0) {
			return false;
		}
		
		var model = $('#J-search-keywords').val();
		if ($.trim(model) == '') {
			alert('输入产品基本ID');
			return;
		}
		var list = [];
		kws.map(function(){
			var v = $(this).attr('value');
			list.push(v);
		});

		var words = { model: model, words: list };
		$.post(KW_URL, words).done(function(data) {
			if (data.status) {
				alert('添加成功');
			} else {
				alert(data.message);
			}
		}).fail(function() {
            alert('服务器出错了');
		});
	});
});

function adding_boxes() {
	var kw = $('#J-search-keywords');
	if ($.trim(kw.val()) == '') {
		return false;
	}

	var kws = $('#J-keywords-content .J-keyword-line > .column-keyword.align-left');
	if (kws.length == 0) {
		return false;
	}

	kws.map(function(){
		var kw = $(this);
		if (kw.find('input').length == 0 ) {
			kw.prepend('<input value="' + kw.text() + '" type="checkbox" class="ynkw" checked="checked">');
		}
	});
}

function detect_keywords() {
	var kw = $('#J-search-keywords');
	if ($.trim(kw.val()) == '') {
		kw.css('border', '1px solid red');
		return false;
	} else {
		kw.css('border', '1px solid #ccc');
	}

	var kws = $('#J-keywords-content .J-keyword-line > .column-keyword.align-left');
	if (kws.length == 0) {
		return false;
	}

	return true;
}