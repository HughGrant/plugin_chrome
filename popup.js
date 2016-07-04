var aliUrl = "https://login.alibaba.com/",
    product_display_url = "www.alibaba.com/product-detail";

$(function() {
    function login_status() {
        $('form').hide();
        $('#btns').show();
    }

    function logout_status() {
        $('form').show();
        $('#btns').hide();
    }

    $.get(LOGIN_URL).done(function(data){
        if (data.status) {
            login_status();
        } else {
            logout_status();
        }
    });

    $(window).keydown(function(event){
        if (event.keyCode == 13) { $('#login').click(); }
    });

    $('#login').click(function() {
        var username = $('#username');
        var password = $('#password');

        if ($.trim(username.val()) == '') {
            username.css('border', '1px solid red');
            return false;
        }

        if ($.trim(password.val()) == '') {
            password.css('border', '1px solid red');
            return false;
        }

        var info = {username: username.val(), password: password.val()};

        $.post(LOGIN_URL, info).done(function(data) {
            if (data.status) {
                login_status()
            } else {
                alert('用户名或密码错误，请重试');
                username.focus();
            }
            username.val('');
            password.val('');
        }).fail(function() {
            alert('服务器出错，请联系管理员');
        });
    });

    $('#logout').click(function() {
        $.get(LOGOUT_URL).done(function() {
            logout_status();
            $('#username').focus();
        }).fail(function() {
            $('#server_error').show();
        });
    });

    $('#site').click(function() {
        chrome.tabs.create({url:ADMIN_URL});
    });
});