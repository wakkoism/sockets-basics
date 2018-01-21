/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

	function getQueryVariable(variable) {
	  var query = window.location.search.substring(1);
	  var vars = query.split('&');
	  for (var i = 0; i < vars.length; i++) {
	      var pair = vars[i].split('=');
	      if (decodeURIComponent(pair[0]) == variable) {
	          return decodeURIComponent(pair[1]);
	      }
	  }

	  return undefined;
	}

	const socket = io();

	socket.on('connect', () => {
	  console.log('Connected to socket.io server!');
	});

	socket.on('message', (message) => {
	  const $messageBox = $('.messages');
	  const user = message.name ? message.name : 'anonymous';
	  $messageBox.append(`
	    <p>
	      <span class="date">[${moment(message.timestamp).local().format('h:mm a')}]</span>&nbsp;
	      &lt;${user}&gt;:&nbsp;
	      ${message.text}
	    </p>
	  `);
	  $messageBox.scrollTop($messageBox.prop('scrollHeight'));
	});

	// Handles submitting a new message.
	(function ($) {
	  $(document).ready(() => {
	    const $form = $('#message-form');
	    const $messageBox = $('.messages');

	    $form.on('submit', (event) => {
	      event.preventDefault();

	      const $message = $form.find('input[name=message]');
	      const timestamp = moment().utc().valueOf();
	      socket.emit('message', {
	        timestamp,
	        text: $message.val(),
	        name: getQueryVariable('name'),
	        room: getQueryVariable('room'),
	      });
	      $messageBox.append(`
	        <p>
	          <span class="date">[${moment(timestamp).local().format('h:mm a')}]</span>&nbsp;
	          &lt;${getQueryVariable('name')}&gt;:&nbsp;
	          ${$message.val()}
	        </p>
	      `);
	      $messageBox.scrollTop($messageBox.prop('scrollHeight'));
	      $message.val('');
	    });
	  });
	})(jQuery);


/***/ })
/******/ ]);