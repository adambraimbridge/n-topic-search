const Delegate = require('ftdomdelegate');
import { debounce } from 'n-ui-foundations';
import suggestionList from './renderers/search-suggestions';

const KEYS = {
	ENTER: 13,
	UP_ARROW: 38,
	DOWN_ARROW: 40
}

function getNonMatcher (container) {
	if (typeof container === 'string') {
		return function (el) {
			return el && el !== document && !el.matches(container);
		};
	}

	return function (el) {
		return el && el !== document && el !== container;
	};
}

function isOutside (el, container) {
	const doesntMatch = getNonMatcher(container);

	while (doesntMatch(el)) {
		el = el.parentNode;
	}

	return !el || el === document;
}

class Typeahead {
	constructor (containerEl, listComponent) {
		this.container = containerEl;
		this.listComponent = listComponent || suggestionList;
		this.searchEl = this.container.querySelector('[data-typeahead-input]');
		this.dataSrc = `//${window.location.host}/search-api/suggestions?partial=`;
		this.categories = (this.container.getAttribute('data-typeahead-categories') || 'tags').split(',');
		this.itemTag = this.container.getAttribute('data-typeahead-item-tag') || 'a';
		this.includeViewAllLink = this.container.hasAttribute('data-typeahead-view-all');
		this.minLength = 2;
		this.init();
	}

	init () {
		this.suggestions = [];
		this.suggestionListContainer = document.createElement('div');
		this.searchEl.parentNode.insertBefore(this.suggestionListContainer, null);

		this.suggestionsView = this.listComponent(this.suggestionListContainer, {
			categories: this.categories,
			itemTag: this.itemTag,
			includeViewAllLink: this.includeViewAllLink,
			searchEl: this.searchEl
		});
		this.searchTermHistory = [];

		this.bodyDelegate = new Delegate(document.body);
		this.onType = debounce(this.onType, 150).bind(this);
		this.onFocus = this.onFocus.bind(this);

		// prevent scroll to item
		this.searchEl.addEventListener('keydown', ev => {
			if (ev.which === 40 || ev.which === 38) {
				ev.preventDefault();
			}
		})

		this.searchEl.addEventListener('keyup', ev => {
			switch(ev.which) {
				case 13 : return; // enter
				case 9 : return; // tab
				case 27: //esc
					this.hide();
				break;
				case 40 :
					this.onDownArrow(ev);
				break;
				default :
					this.onType(ev);
				break;
			}
		});

		this.suggestionListContainer.addEventListener('keyup', ev => {
			switch(ev.which) {
				case 13 : return; // enter
				case 9 : return; // tab
				case 40 :
					this.onDownArrow(ev);
				break;
				case 38 :
					this.onUpArrow(ev);
				break;
				default :
				break;
			}
		})

		this.searchEl.addEventListener('focus', this.onFocus);
		this.searchEl.addEventListener('click', this.onFocus);
	}

	// EVENT HANDLERS
	onType () {
		this.searchTerm = this.searchEl.value.trim();
		this.searchTermHistory.push(this.searchTerm);
		this.getSuggestions(this.searchTerm);
		[].forEach.call(this.suggestionListContainer.querySelectorAll('li'), function (el) {
			el.setAttribute('data-trackable-meta', '{"search-term":"' + this.searchTerm + '"}');
		}.bind(this));
	}

	onFocus (ev) {
		ev.target.setSelectionRange ? ev.target.setSelectionRange(0, ev.target.value.length) : ev.target.select();
		this.show();
	}

	onDownArrow (ev) {
		console.log(ev)
		this.suggestionLinks = Array.from(this.suggestionListContainer.querySelectorAll('.n-typeahead__link'));
		if (this.suggestionLinks.length) {
			this.suggestionLinks[0].focus();
		}
	}

	onUpArrow () {
			// 		if (ev.which === KEYS.DOWN_ARROW) {
			// 	const index = this.items.indexOf(ev.target);
			// 	const newIndex = index + 1;
			// 	if (newIndex < this.items.length) {
			// 		this.items[newIndex].focus();
			// 	} else {
			// 		this.items[0].focus();
			// 	}
			// 	ev.preventDefault(); //disable page scrolling
			// 	return;
			// }

			// if (ev.which === KEYS.UP_ARROW) {
			// 	const index = this.items.indexOf(ev.target);
			// 	const newIndex = index - 1;
			// 	if (newIndex < 0) {
			// 		this.options.searchEl.focus();
			// 	} else {
			// 		this.items[newIndex].focus();
			// 	}
			// 	ev.preventDefault(); //disable page scrolling
			// }
	}



	// INTERNALS
	getSuggestions (value) {
		if (value.length >= this.minLength) {
			fetch(this.dataSrc + encodeURIComponent(value))
				.then((response) => {
					if (!response.ok) {
						throw new Error(response.statusText);
					}
					return response.json();
				})
				.then(suggestions => this.suggest(suggestions))
				.catch((err) => {
					setTimeout(() => {
						throw err;
					});
				});
		} else {
			this.unsuggest();
		}
	}

	isTimelyResponse (term) {
		// handle race conditions between e.g. TRU returning slower than TRUMP
		const index = this.searchTermHistory.indexOf(term);
		if (index > -1) {
			this.searchTermHistory = this.searchTermHistory.slice(index);
			return true;
		}
		return false;
	}

	suggest (suggestions) {

		if (!suggestions.query || !this.isTimelyResponse(suggestions.query.partial)) {
			return;
		}
		this.suggestions = suggestions;
		this.suggestionsView.setState({
			searchTerm: this.searchTerm,
			suggestions: this.suggestions
		});
		this.show();
	}

	unsuggest () {
		this.hide();
	}

	hide () {
		this.suggestionListContainer.setAttribute('hidden', '');
		this.bodyDelegate.off();
	}

	reset () {
		this.hide();
		this.suggestions = [];
		this.suggestionLinks = [];
		this.suggestionsView.setState({
			suggestions: {
				tags: [],
				equities: []
			},
			searchTerm: ''
		});
		this.searchTermHistory = [];
		this.searchTerm = '';
		this.searchEl.value = '';
	}

	show () {
		this.suggestionListContainer.removeAttribute('hidden');
		['focus', 'touchstart', 'mousedown']
			.forEach(type => {
				this.bodyDelegate.on(type, (ev) => {
					if (isOutside(ev.target, this.container)) {
						this.hide();
					}
				});
			})
	}
}

export default Typeahead;
