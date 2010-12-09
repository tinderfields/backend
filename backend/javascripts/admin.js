var settings = {
	ckeditor_height: 140,
	ckeditor_width: 420,
	add_icons_to_content_buttons: true,
	auto_alt_tables: true
};

var is_browser = {
	webkit: jQuery.browser.webkit,
	ie6: (jQuery.browser.msie && jQuery.browser.version.substr(0,1)<7)
};

var app = {
	initialise: function() {
		app.log('app.initialised');
		app.setup_ajax_callbacks();
		app.cakephp_debugging();
		backend.back_and_forwards();
		backend.classyfy_inputs();
		backend.ckeditor_stop_pages_jumping();
		backend.set_up_checkbox_related_hiding();
		message.initialise();
		confirm_window.initialise();
		fastlook.initialise();
		
		//extra fancy bits, switch off in settings at top
		backend.fanciefy_fancy_frames();
		backend.add_icon_spans();
		backend.auto_alt_tables();
		
		//ie6 handlers
		$('#start_ckeditor').live('click', function (){
			backend.make_ckeditors();
			return false;
		});
		
	},
	
	log: function(message) {
		if(typeof console != 'undefined') console.log(message);
	},
	
	setup_ajax_callbacks: function () {
		var loading = $('#ajax_loading');
		var body = $('body');
		
		body.ajaxStart(function () {
			loading.show();
	   	});
	
	   	body.ajaxStop(function () {
			loading.fadeOut();
	   	});
	
		body.ajaxError(function (event, xml_http_request, ajax_options, thrown_error) {
			message.error('There was a probelm with the ajax.');
		});
	
		body.ajaxComplete(function(e, xml_http_request, ajax_settings) {
			if(xml_http_request.status != 200){
				message.warning( app.ajax_status(xml_http_request.status) );
			}
			backend.classyfy_inputs();
		});
	 },
	
	ajax_status: function(status_code) {
		var message = status_code + " ";
		var warning_start = 'The ajax returned a "';
		var warning_end = '" message.';
		switch(status_code)
		{
		case 404:
			return warning_start + message + "Not Found" + warning_end;
		break;
		case 403:
			return warning_start + message + "Forbidden" + warning_end;
		break;
		case 401:
			return warning_start + message + "Unauthorized" + warning_end;
		break;
		case 301:
			return warning_start + message + "Moved Permanently" + warning_end;
		break;
		case 302:
			return warning_start + message + "Found and Redirected" + warning_end;
		break;
		case 305:
			return warning_start + message + "Use Proxy" + warning_end;
		break;
		case 0:
			return warning_start + message + "Unkown" + warning_end + " <br /> This could be a 301 - moved permanently, 302 - found then redirected or 305 - use proxy problem. <br />This does not necessarily mean the operation failed, just that it might have failed.";
		break;
		default:
			return status_code;
		}
		
	},

	cakephp_debugging: function() {
		if($('.cake-sql-log').length > 0){
			$('.cake-sql-log').wrap('<div class="cake_debug_wrapper">');
			$('.cake_debug_wrapper').hide();
			$('body').append('<a id="toggle_log" class="button" href="#">Log</a>');
			$('#toggle_log').live('click', function() {
				$('.cake_debug_wrapper').show();
				$(this).hide();
			});
		}
	}
};

var backend = {
	classyfy_inputs: function() {
		$('input[type=text]').addClass('input_text');
		$('input[type=password]').addClass('input_text');
		$('input[type=button]').addClass('input_button');
		$('input[type=submit]').addClass('input_button submit_button');
		$('input[type=checkbox]').addClass('input_checkbox');		
		if (is_browser.webkit) { $('input[type=button], input[type=submit]').addClass('webkit_input_button'); }
	},
	
	back_and_forwards: function() {
		$('.javascript_back').click(function(){
			if($(this).attr('href') == ""){
				history.go(-1);
				return false;
			}
		});
		$('.javascript_forwards').click(function(){
			if($(this).attr('href') == ""){
				history.go(1);
				return false;
			}
		});
	},
	
	fanciefy_fancy_frames: function() {
		if( !(is_browser.ie6) ){
			$('.fancy_frame').wrap('<div class="fancy_frame_wrapper">');
			$('.fancy_frame_wrapper').append('<span class="shadow shadow_left"></span>').append('<span class="shadow shadow_right"></span>');
		}
	},
	
	add_icon_spans: function() {
		if(settings.add_icons_to_content_buttons){ $('.content .icon').append('<span></span>'); }
		if(settings.add_icons_to_content_buttons){ $('#login .content .title').append('<img src="/backend/images/login_title.png" />'); }
	},
	
	make_ckeditors: function() {
		if( $('.do_ckeditor').length > 0 ){
			var ck_config = {
			    toolbar:
			    [
					['Bold', 'Italic', 'Bullet'],
					['Copy', 'Paste', 'BulletedList'],
					['Link','Unlink'],
			        ['ShowBlocks','Source'],
			        ['Maximize']
			    ],
				skin: 'kama'
			};
			ck_config.removePlugins = 'elementspath';		
			ck_config.toolbarCanCollapse = false;
			ck_config.resize_enabled = false;
			ck_config.width = settings.ckeditor_width;
			ck_config.height = settings.ckeditor_height;
			$('.do_ckeditor').ckeditor(ck_config);
			$('.ie_ckeditor_warning').hide();
		}
	},
		
	remove_ck_editors: function() {
		$('.do_ckeditor').ckeditor(function(){
			this.destroy();
		});
	},
	
	ckeditor_stop_pages_jumping: function() {
		//stops page height jumping when ckeditor initialises 
		$('.ckeditor').height(settings.ckeditor_height + 45);
	},
	
	set_up_checkbox_related_hiding: function() {
		$('.hidden_form_area').prepend('<span class="hidden_area_callout"></span>');
		
		$('input[type=checkbox]').live('change', function (){
			backend.show_and_hide_checkbox_hidden_areas();
		});
		backend.show_and_hide_checkbox_hidden_areas();
	},
	
	checkbox_hidden_area_slide_speed: 0,
	show_and_hide_checkbox_hidden_areas: function() {		
		$('input[type=checkbox]').each(function(index) {
			
			var callout_left = $(this).position().left + 10;
			if (is_browser.webkit) { callout_left = callout_left - 3; }
			if (is_browser.ie6) { callout_left = callout_left - 10; }
			
			if( this.checked ){
				$('.show_when_' + $(this).attr('id') + '_is_checked').slideDown(backend.checkbox_hidden_area_slide_speed).find('.hidden_area_callout').css('left', (callout_left + 'px'));
				$('.hide_when_' + $(this).attr('id') + '_is_checked').slideUp(backend.checkbox_hidden_area_slide_speed).find('.hidden_area_callout').css('left', (callout_left + 'px'));
			}else{
				$('.show_when_' + $(this).attr('id') + '_is_checked').slideUp(backend.checkbox_hidden_area_slide_speed).find('.hidden_area_callout').css('left', (callout_left + 'px'));
				$('.hide_when_' + $(this).attr('id') + '_is_checked').slideDown(backend.checkbox_hidden_area_slide_speed).find('.hidden_area_callout').css('left', (callout_left + 'px'));
			}
		});
		
		backend.checkbox_hidden_area_slide_speed = 500;
	},
	
	auto_alt_tables: function() {
		if(settings.auto_alt_tables){
			$("table tr:even").addClass("alt");
		}
	},
	
	label_heights: function() {
		$('.input').each(function(index) {
			var input_div = $(this);
			var label_height = input_div.find('label').height();
			if(input_div.find('label').height() > 1 && label_height >  input_div.height() ){
				input_div.css('min-height',  (label_height + 'px') )
			}
		});		
	}
	
}

var confirm_window = {
	height: 100,
	initialise: function() {		
		//handeler
		//$('.confirm').removeAttr('onclick');
		$('.confirm').live('click', function() {
			confirm_window.open($(this));
			return false;
		});
		
		$('#cancel_confirm_window').live('click', function() {
			confirm_window.close();
			return false;
		});
	},
	
	open: function(link) {
		overlay.show();
		
		//window
		$('#child_window_holder').remove();
		
		if(link.attr('title').length > 0){
			var message = "<p>" + link.attr('title') + "</p>";
		}else{
			var message = " ";
		}
		
		var window_html = '<div id="child_window_holder"><div id="child_window" class="content no_top_left_curve no_top_right_curve"><h1 class="title">Are you sure you want to do that?</h1>' + message + '<div class="buttons text_right"><a href="#" id="cancel_confirm_window">Cancel</a><a href="' + link.attr('href') + '" id="confirm_confirm_window" class="button delete">Yes, ' + link.text(); + '</a></div></div></div>';
		$('body').prepend(window_html);
		
		confirm_window.height = $('#child_window_holder').height();
		$('#child_window_holder').css('top', '-' + confirm_window.height + 'px');
		
		$('#child_window_holder').animate({
			top: 0
		}, 200, function(){
			$('#confirm_confirm_window').focus();
		});
	},
	
	close: function() {
		$('#child_window_holder').animate({
			top: confirm_window.height * -1
		}, 200, function() {
			$('#child_window_holder').remove();
			overlay.hide();
		});
	}
	
}


var message = {
	initialise: function() {
		message.add_close_buttons();
	},
	add_close_buttons: function() {
		$('#flash_messages .message .close').remove();
		$('#flash_messages .message').append('<a href="#" class="close" >Close</a>');
		$('.close').live('click', function() {
			$(this).closest('.message').fadeOut('fast');
			return false;
		});
	},
	show_message: function(type, text) {
		$('#flash_messages').append('<div class="message ' + type + '">' + text + '</div>');
		message.add_close_buttons();
	},
	info: function(text) {
		message.show_message('info', text);
	},
	ok: function(text) {
		message.show_message('ok', text);
	},
	warning: function(text) {
		message.show_message('warning', text);
	},
	error: function(text) {
		message.show_message('error', text);
	}
}

var overlay = {
	initialise: function() {
		$('#overlay').remove();
		$('body').prepend('<div id="overlay" style="height:' + $(document).height() + 'px; display:none;"  ></div>');
	},
	show: function() {
		
		if( $.browser.msie && $.browser.version.substr(0,1)<7 ){
			$('select').hide();
		}
		
		overlay.initialise();
		$('#overlay').fadeTo(0, 0.5);
	},
	hide: function() {
		$('#overlay').fadeTo(0, 0, function() {
			$('#overlay').remove();
			if( $.browser.msie && $.browser.version.substr(0,1)<7 ){
				$('select').show();
			}
		});
	}
}

var fastlook = {
	initialise: function() {
		$('.fastlook').live('click', function() {
			fastlook.show($(this));
			return false;
		});
		
		$('#fastlook_box_holder #close_fastlook a').live('click', function() {
			fastlook.hide();
			return false;
		});
	},
	show: function(link) {
		//alert(link.attr('href'));
		overlay.show();
		$('#fastlook_box_holder').remove();
		$('body').append('<div id="fastlook_box_holder" ><div id="fastlook_box" ><div id="fastlook_frame" class="no_top_left_curve no_top_right_curve no_bottom_right_curve" ><div id="close_fastlook"><a href="#" class="button icon close_icon"><span></span></a></div><img src="' + link.attr('href') + '" alt=""  /></div></div></div>');
		$('body').css('overflow', 'hidden');
		$('#fastlook_box_holder #close_fastlook a').focus();
	},
	hide: function() {
		$('#fastlook_box_holder').remove();
		overlay.hide();
		$('body').css('overflow', 'auto');
	}
}

$(document).ready(function(){
	app.initialise();
});

$(window).load(function(){
	if( !(is_browser.ie6) ){
		backend.make_ckeditors();
	}else{
		$('.do_ckeditor').before('<p class="ie_ckeditor_warning">The rich text editor has been switched off to speed up your browser and page load times. <a id="start_ckeditor" href="#"> Click here to use the editor.</a> You should consider upgrading your browser.</p>');
	}
	backend.label_heights();
});

// register keypresses
$(document).keyup(function(e) {
  if (e.keyCode == 27) { $('#cancel_confirm_window').click(); }   // esc closes confirm window
  if (e.keyCode == 27) { $('#fastlook_box_holder #close_fastlook a').click(); }   // esc closes confirm window
});
