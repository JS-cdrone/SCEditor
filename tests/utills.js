/*global $, QUnit, document*/
function html2dom(html, wrapInJquery) {
	'use strict';

	var ret = document.createElement("div");
	ret.innerHTML = html;

	if(wrapInJquery)
		ret = $(ret);

	$("#qunit-fixture").append(ret);

	return ret;
}

function equalMulti(actual, expectedArr, message) {
	'use strict';

	var matched = false;

	$.each(expectedArr, function(idx, expected) {
		if(actual == expected)
			matched = true;
	});

	QUnit.push(matched, actual, expectedArr, message);
}

function ignoreSpaces(str) {
	'use strict';

	return str.replace(/[\n\r ]+/g, '');
}


var eventMatchers = {
	'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
	'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
};

// Source: http://stackoverflow.com/questions/6157929/how-to-simulate-mouse-click-using-javascript
function simulate(elm, evtName, opts) {
	'use strict';

	var options = $.extend({
		pointerX: 0,
		pointerY: 0,
		button: 0,
		ctrlKey: false,
		altKey: false,
		shiftKey: false,
		metaKey: false,
		bubbles: true,
		cancelable: true
	}, opts || {});

	var oEvent, eventType = null;

	for (var name in eventMatchers)
		if (eventMatchers[name].test(evtName)) { eventType = name; break; }

	if (!eventType)
		throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

	if (document.createEvent)
	{
		oEvent = document.createEvent(eventType);

		if (eventType == 'MouseEvents')
		{
			oEvent.initMouseEvent(evtName, options.bubbles, options.cancelable, document.defaultView,
				options.button, options.pointerX, options.pointerY, options.pointerX,
				options.pointerY, options.ctrlKey, options.altKey, options.shiftKey,
				options.metaKey, options.button, elm);
		}
		else
			oEvent.initEvent(evtName, options.bubbles, options.cancelable);

		elm.dispatchEvent(oEvent);
	}
	else
	{
		options.clientX = options.pointerX;
		options.clientY = options.pointerY;
		oEvent = $.extend(document.createEventObject(), options);
		elm.fireEvent('on' + evtName, oEvent);
	}

	return elm;
}

// Source: http://stackoverflow.com/questions/10455626/keydown-simulation-in-chrome-fires-normally-but-not-the-correct-key/10520017#10520017
function simulateKey(evtName, code) {
	'use strict';

	var oEvent = document.createEvent('KeyboardEvent');

	// Chromium Hack
	Object.defineProperty(oEvent, 'keyCode', {
		get : function() {
			return this.keyCodeVal;
		}
	});
	Object.defineProperty(oEvent, 'which', {
		get : function() {
			return this.keyCodeVal;
		}
	});

	if(!/^(?:keypress|keyup|keydown)$/.test(evtName))
		throw new SyntaxError('Event not supported');

	if (oEvent.initKeyboardEvent)
		oEvent.initKeyboardEvent(evtName, true, true, document.defaultView, false, false, false, false, code, code);
	else
		oEvent.initKeyEvent(evtName, true, true, document.defaultView, false, false, false, false, code, 0);

	oEvent.keyCodeVal = code;

	if (oEvent.keyCode !== code)
		throw new Error("keyCode mismatch " + oEvent.keyCode + "(" + oEvent.which + ")");

	document.dispatchEvent(oEvent);
}
