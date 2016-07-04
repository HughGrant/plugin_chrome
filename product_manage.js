setInterval(detect_update, 2000);

function detect_update() {
	var list = $('.manager-list-col-updated');
	if (list.length == 0) {
		return false;
	}

	list.map(function(index) {
		var list_date = $(this);
        if (list_date.hasClass('reminded')) { return false; };
		list_date.addClass('reminded');

		var	date = $.trim(list_date.find('span:eq(0)').text());
		// English time format day/month/year
		if (date.indexOf('/') != -1) {
			date = date.split('/').reverse().join('-');
		}
		date = (new Date(date)).valueOf();
		var now = (new Date()).valueOf();
		// Time on alibaba is 1 day behind us
		var days = Math.round((now - date)/86400000);

		if (days <= 7) {
            var reminder = '<br><span style="color:#FFF;background-color:GREEN;">无需更新</span>';
		} else {
            var reminder = '<br><span style="color:#FFF;background-color:RED;">需要更新</span>';
		}

		list_date.find('span:eq(1)').append(reminder);
	});
}