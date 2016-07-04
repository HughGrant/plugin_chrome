// var jq = document.createElement('script');
// jq.src = "//cdn.bootcss.com/jquery/2.2.0/jquery.min.js";
// document.getElementsByTagName('head')[0].appendChild(jq);

function inject_script(file) {
    var th = document.getElementsByTagName('head')[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
}

function open_url(url) {
    chrome.runtime.sendMessage({action: 'open_url', url: url})
}

function download_url(url, filename) {
    chrome.runtime.sendMessage({
        action: 'download_url',
        url: url,
        filename: filename
    });
}

function collect_keywords(name) {
    chrome.runtime.sendMessage({action: 'collect_keywords', name: name});
}

function download_images() {
    var name = get_product_name();
    var images = get_main_pictures().concat(get_rich_text().imgs);
    for (var i = images.length - 1; i >= 0; i--) {
        download_url(images[i], name + ' (' + i + ').jpg');
    }
}

function check_img(url) {
    open_url(url);
}

function copy_title() {
    var input = document.getElementById('productName');
    input.focus();
    input.select();
    document.execCommand('copy');
}

function fill_product_name(name) {
    $('#productName').val(name);
}

function fill_product_keyword(keyword) {
    $('#productKeyword').val(keyword);
}

function get_apid() {
    return parseInt(window.location.search.match(/\d+/g)[0]);
}

function move_down_to_submit() {
    $('html, body').animate({
        scrollTop: $("#submitFormBtnA").offset().top - 850
    }, 500);
}

function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}

function find_model() {
    var x = $('.attr-title').map(function(i) {
        if ($(this).html() == 'Model Number') {
            var model = $('#productAttribute').find('.ui-form-control')[i];
            return $(model).find('input').val();
        }
    });

    if (x.length == 1) {
        return x[0];
    } else {
        alert('没有填写型号或当前页面不是英文')
        return false;
    }
}

// invoked at command_plaste.js
var capture_product = function(product) {
    product.rich_text = [];
    data = {
        'json': JSON.stringify(product)
    };

    $.post(CAPTURE_PRODUCT_URL, data).done(function(data) {
        if (data.status) {
            alert('抓取成功');
        } else {
            alert(data.message);
        }
    }).fail(function(data) {
        alert('出错了');
    });
}

function get_inner_text(css_selector, default_str) {
    var attr = $(css_selector);
    if (attr.length) {
        return $.trim(attr[0].innerText);
    }
    return default_str || '';
}

function scratch() {
    var product = {};
    product.name = get_product_name();

    product.category = array_trim($('.ui-breadcrumb').attr('content').split('>'));

    product.unkown_category_id = $('.num').html().replace(/[()]/g, '');
    // main images src
    product.photos = get_main_pictures();

    product.attrs = []
    keys = $('#J-quick-detail .J-name');
    values = $('#J-quick-detail .J-value');
    for (var i = 0; i < keys.length; i++) {
        product.attrs.push([keys[i].innerText.replace(/:/g, ''), $.trim(values[i].innerText)]);
    }

    product.consignment_term = get_inner_text('td:contains("Delivery Detail:") + td');
    product.packaging_desc = get_inner_text('td:contains("Packaging Details:") + td');

    product.price_range_min = 0;
    product.price_range_max = 0;
    if ($('span[itemProp="priceCurrency"]').length == 1) {
        product.price_range_min = parseInt($('span[itemProp="lowPrice"]').html().replace(/,/g, ""));
        product.price_range_max = parseInt($('span[itemProp="highPrice"]').html().replace(/,/g, ""));
    }
    // in preset.py money_type USD is 1
    product.money_type = 1;
    // SET/SETS
    product.price_unit = 20;

    var MOQ = $('th:contains("Min.Order Quantity:") + td')[0].innerText;
    MOQ = MOQ.split(' ');
    product.min_order_quantity = parseInt(MOQ[0]);
    product.min_order_unit = unitType[MOQ[1]];


    product.port = get_inner_text('th:contains("Port:") + td', 'NingBo');


    var pm = $('th:contains("Payment Terms:") + td')[0].innerText;
    product.payment_terms = array_trim(pm.split(','));

    var supply = $('th:contains("Supply Ability:") + td')[0].innerText;
    supply = supply.split(' ');

    product.supply_unit = unitType[supply[1]];
    product.supply_quantity = parseInt(supply[0]);
    product.supply_period = supply[supply.length - 1];

    var rich = get_rich_text();
    product.rich_text = rich.txt.join('');

    if (rich.imgs.length > 0) {
        for (var i = rich.imgs.length - 1; i >= 0; i--) {
            product.photos.push(rich.imgs[i]);
        }
    }
    product.photos.reverse();
    return product;
}

function is_preview_page() {
    if (window.location.hostname === "preview.alibaba.com") {
        return true;
    }
    return false;
}

function get_product_name() {
    var name = "";
    if (is_preview_page()) {
        name = $.trim($('#title_to_link').html());
    } else {
        name = $.trim($('.title.fn')[0].innerText);
    }
    return name.replace(/[\\/:*?"<>|"]/g, '');
}

function get_main_pictures() {
    var mp = [];
    $('.inav.util-clearfix img').each(function() {
        mp.push('http:' + $(this).attr('src').replace("_50x50.jpg", ""));
    });

    if (mp.length === 0) {
        $('.ui-image-viewer-image-frame img').each(function(){
            mp.push('http:' + $(this).attr('src'));
        });
    }
    $.unique(mp);
    return mp;
}

function get_rich_text() {
    // this function return a dict
    if (is_preview_page()) {
        var div = $('#richTextContainer');
    } else {
        var div = $('#J-rich-text-description');
    }
    var eles = div.find('> p, > table, > ul');
    rich = {};
    rich.txt = [];
    rich.imgs = [];
    for (var i = 0; i < eles.length; i++) {
        var img = $(eles[i]).find('img');
        if (img.length == 0) {
            var html = eles[i].outerHTML;
            rich.txt.push(html);
        }
    }

    var imgs = div.find('noscript');
    for (var i = imgs.length - 1; i >= 0; i--) {
        var src = $(imgs[i].innerText).attr('src');
        rich.imgs.push(src);
        $.unique(rich.imgs);
    }
    return rich;
}

function array_trim(arr) {
    for (var i = 0; i < arr.length; i++) {
        arr[i] = $.trim(arr[i]);
    }
    return arr;
}

function check_payment_box(values) {
    $('.paymentMethod-count input').prop('checked', false);
    left = [];
    values.forEach(function(v) {
        var v = v.trim();
        var input = $('input[value="' + v + '"]');
        if (input.length) {
            input.prop('checked', true);
        } else {
            left.push(v);
        }
    })

    if (left.length) {
        $('label[for="paymentMethodOther"]').click();
        $('#paymentMethodOtherDesc').val(left.join(','));
    }
}

function common_things_to_update() {
    check_payment_box(['T/T', 'Western Union', 'MoneyGram', 'PayPal']);
    $('#port').val('NingBo');
    $('#consignmentTerm').val(3);
    $('#packagingDesc').val('Standard Export Packaging, Safe And Secure');
}

function send_background_ajax_get(url, data) {
    chrome.runtime.sendMessage({
        action: 'ajax_get_from_back',
        url: url,
        params: data
    });
}

function send_background_ajax_post(url, data) {
    chrome.runtime.sendMessage({
        action: 'ajax_post_from_back',
        url: url,
        params: data
    });
}

function dom_update_tk(data) {
    if (data.fail) {
        alert('服务器出错');
    } else if (data.msg) {
        alert(data.msg);
    } else {
        fill_product_name(data.title);
        fill_product_keyword(data.word);
        copy_title();
        move_down_to_submit();
        common_things_to_update();
    }
}