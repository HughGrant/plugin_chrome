$(function(){
	if(document.location.href.indexOf('product-detail') !== -1) {
    $('.buttons').append('<div class="item"><a id="scratch_trigger" class="ui-button ui-button-normal ui-button-large atm dot-app-pd atmonline">复制产品</a></div>')
    $('#scratch_trigger').click(function() {
	    var config = {currentWindow:true, active:true}
		  chrome.tabs.query(config, function (tabs) {
		    var tab = tabs[0]
		    if (tab.status != "complete") { 
	        chrome.tabs.sendMessage(tab.id, {action:"wrong", msg:"页面未加载完成"});
	      } else {
		    	chrome.tabs.sendMessage(tab.id, {action:"do"})
		  	}
		  })
    })
  }
})