/**
 * Algolia Search for Symphony
 * @author Frederick Hamon x Deux Huit Huit
 */
(function ($, S) {

	'use strict';

	var sels = {
		ctn: '#search',
		input: '#search-bar',
		suggestion: '#search-suggestion-dropdown',
		results: '#search-results',
		suggestionChoice: '.js-choice'
	};

	var VERBS = [
		'in',
		'by',
		'from',
		'where',
		'is',
		'id'
	];

	var placeholders = [
		'Search something',
		'Find your eternal love',
		'Find the Holy Grail',
		'Search entries',
		'Search',
		'Find your pet halibut'
	];

	var UP_KEY = 38;
	var DOWN_KEY = 40;
	var ESCAPE_KEY = 27;

	var client = window.algoliasearch(window.algoliaAppId, window.algoliaKey);
	var index = client.initIndex(window.algoliaIndex);
	var DEFAULT_FIELDS = JSON.parse(window.algoliaDefaultFields);

	var timer = null;

	var parseVal = function (text) {
		$.each(VERBS, function (index, element) {
			text = text.replace(element + ':', ' ' + '<span class="verb">' + element + ':</span>');
		});
		return text;
	};

	var setCaret =  function (el) {
		if (typeof window.getSelection != 'undefined' && typeof document.createRange != 'undefined') {
			var range = document.createRange();
			range.selectNodeContents(el);
			range.collapse(false);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		} else if (typeof document.body.createTextRange != 'undefined') {
			var textRange = document.body.createTextRange();
			textRange.moveToElementText(el);
			textRange.collapse(false);
			textRange.select();
		}
	};

	var clear = function () {
		S.Utilities.requestAnimationFrame(function () {
			$(sels.ctn).removeClass('is-content-visible');
		});
	};

	var search = function (opts, cb) {
		index.search(opts.query, {
			filters: opts.filters
		}, function (err, content) {

			if (!!err) {
				return;
			}

			cb(content.hits.splice(0, 10));
		});
	};

	var goTo = function (entry) {
		window.location.href = S.Context.get('symphony') + '/publish/' + entry['section-handle'] + '/edit/' + entry.objectID + '/';
		clear();
	};

	var renderResults = function (results) {
		var ctn = $(sels.ctn);
		var resultsCtn = ctn.find(sels.results);
		resultsCtn.empty();
		$.each(results, function (index, element) {
			var result = $('<a/>').attr('href', S.Context.get('symphony') + '/publish/' + element['section-handle'] + '/edit/' + element.objectID + '/');
			var label = $('<span/>').addClass('search-label');
			var sectionName = $('<span/>').addClass('search-section-name').text(element.section);
			var field = null;
			var text = '';

			$.each(DEFAULT_FIELDS, function (index, defaultField) {
				$.each(element, function (key, value) {
					if (key === defaultField) {
						field = value;
						return false;
					}
				});
				if (!!field) {
					return false;
				}
			});

			if (!field) {
				$.each(element, function (key, value) {
					field = value;
					return false;
				});
			}

			text = field.value || element.entry;
			text = $('<div />').append(text).text();
			result.data('entry', element);
			label.text(text);

			result.append([label, sectionName]);
			resultsCtn.append(result);

			result.on('click', function (event) {
				goTo(element);
				event.preventDefault();
				return event.stopPropagation();
			});

			result.on('mouseenter', function () {
				$(sels.results).find('> *').removeClass('is-active');
				$(this).addClass('is-active');
			});
		});

		if (!results.length) {
			var noResults = $('<div />').text(S.Language.get('No results'));
			resultsCtn.append(noResults);
		} else {
			resultsCtn.find('> *').first().addClass('is-active');
		}
	};

	var onInput = function (event) {
		var t = $(this);
		var ctn = t.closest(sels.ctn);
		var isEnter = t.html().indexOf('<br') >= 0;
		var text = '';

		t.html(parseVal(t.text()));
		setCaret(t.get(0));

		text = t.text();

		if (!t.text()) {
			clear();
			return;
		}

		if (!!event.originalEvent && !event.originalEvent.data && !!isEnter) {
			t.html(parseVal(t.text()));
			t.blur();
			event.preventDefault();
			event.stopPropagation();

			goTo(ctn.find(sels.results).find('> *').filter('.is-active').data('entry'));
			return false;
		} else {
			var filters = text.match(/\s?[(a-z)]*:[a-z\-]*/g) || [];

			$.each(filters, function (index, element) {
				text = text.replace(element, '');
				filters[index] = element.trim();
			});

			filters = filters.join(',').replace('in:','section-handle:').replace('by:','author:').replace('id:','entry:');

			if (!!filters.endsWith(':')) {
				filters = '';
			}

			search({
				query: text.trim(),
				filters: filters
			}, renderResults);
		}
	};

	var onKeydown = function (event) {
		var ctn = $(this).closest(sels.ctn);
		var input = ctn.find(sels.input);
		var results = ctn.find(sels.results).find('> *');
		var currentActive = results.filter('.is-active');

		S.Utilities.cancelAnimationFrame(timer);
		timer = S.Utilities.requestAnimationFrame(function () {
			ctn[!!input.text() && ctn.hasClass('is-open') ? 'addClass' : 'removeClass']('is-content-visible');
		});

		if (event.which === DOWN_KEY) {
			if (!!currentActive.next().length) {
				currentActive.removeClass('is-active');
				currentActive.next().addClass('is-active');
			}
		} else if (event.which === UP_KEY) {
			if (!!currentActive.prev().length) {
				currentActive.prev().addClass('is-active');
				currentActive.removeClass('is-active');
			}
		} else if (event.which === ESCAPE_KEY) {
			input.blur();
		}
	};

	var onBlur = function () {
		S.Utilities.requestAnimationFrame(function () {
			$(this).closest(sels.ctn).removeClass('is-open').removeClass('is-content-visible');
		});
	};

	var onFocus = function () {
		$(this).closest(sels.ctn).addClass('is-open');
		$(this).trigger('input').trigger('keydown');
	};

	var render = function () {
		var search = $('<div />').attr('id','search');
		var bar = $('<div />').attr('id','search-bar').prop('contenteditable', true);
		var results = $('<div />').attr('id', 'search-results');
		search.insertBefore(S.Elements.tools.find(S.Elements.session));
		bar.attr('data-placeholder', placeholders[Math.floor(Math.random() * placeholders.length)]);
		search.append([bar, results]);
		search.append('<svg class="icon" viewBox="0 0 15.1 15.2"><path fill="currentColor" d="M14.8,13.5l-3.7-3.7c0.8-1,1.2-2.3,1.2-3.6C12.3,2.8,9.6,0,6.2,0C2.8,0,0,2.8,0,6.2 s2.8,6.2,6.2,6.2c1.3,0,2.5-0.4,3.5-1.1l3.7,3.7c0.2,0.2,0.5,0.3,0.7,0.3c0.3,0,0.5-0.1,0.7-0.3C15.2,14.5,15.2,13.8,14.8,13.5z M2,6.2C2,3.9,3.9,2,6.2,2c2.3,0,4.2,1.9,4.2,4.2c0,1.2-0.5,2.2-1.2,2.9c0,0,0,0,0,0c-0.8,0.7-1.8,1.2-2.9,1.2C3.9,10.3,2,8.4,2,6.2 z"/></svg>'); // jshint ignore:line
	};

	var init = function () {
		render();
		$(sels.input).on('input', onInput);
		$(sels.input).on('keydown', onKeydown);
		$(sels.input).on('blur', onBlur);
		$(sels.input).on('focus', onFocus);
		$(sels.search).on('click', function(event) {
			event.stopPropagation();
			return event.preventDefault();
		});
		$(window).on('click', function (event) {
			if (!$(event.target).is(sels.ctn) && !$(event.target).closest(sels.ctn).length) {
				clear();
			}
		});
	};

	$(init);

})(window.jQuery, window.Symphony);
