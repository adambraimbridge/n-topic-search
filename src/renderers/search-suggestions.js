const morphdom = require('morphdom');
const delegate = require('ftdomdelegate');
const DISPLAY_ITEMS = 5;

function regExpEscape (s) {
	return s.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
}

const headingMapping = {
	concepts: 'News',
	equities: 'Securities'
}

const KEYS = {
	ENTER: 13,
	UP_ARROW: 38,
	DOWN_ARROW: 40
}


export default function (container, options) {
	return new SuggestionList(container, options)
}

class SuggestionList {
	constructor (container, options) {
		this.container = container;
		this.options = options;

		this.state = {
			suggestions: options.categories.reduce((containers, name) => {
				containers[name] = [];
				return containers
			}, {})
		}
		this.renderSuggestionGroup = this.renderSuggestionGroup.bind(this);
		this.createHtml();
		this.render();
	}

	setState (state) {
		this.state = state;
		this.createHtml();
		this.render();
	}

	highlight (text) {
		return text.replace(RegExp(regExpEscape(this.state.searchTerm), 'gi'), '<mark>$&</mark>');
	}

	renderTailLink (group) {
		if (group.tailLink) {
			const linkAttrs = `
				class="n-typeahead__link n-typeahead__link--tail"
				href="${group.tailLink.url}"
				data-trackable="${group.tailLink.trackable}"
			`
			return `<a ${linkAttrs} tabindex="0">${group.tailLink.innerHtml}</a>`
		}
	}

	renderSuggestionLink (suggestion, group) {
		return `<li class="n-typeahead__item">
			<a class="n-typeahead__link ${group.linkClassName}"
				href="${suggestion.url}"
				tabindex="0"
				data-trackable="link"
				data-suggestion-id="${suggestion.id}"
				data-suggestion-type="${suggestion.type}"
			>${suggestion.html}</a>
		</li>`;
	}

	handleKeyDown (ev) {
		if (ev.which === KEYS.ENTER) {
			ev.stopPropagation();
			// we don't prevent default as the link's url is a link to the search page
			return;
		}

		if (ev.which === KEYS.DOWN_ARROW) {
			const index = this.items.indexOf(ev.target);
			const newIndex = index + 1;
			if (newIndex < this.items.length) {
				this.items[newIndex].focus();
			} else {
				this.items[0].focus();
			}
			ev.preventDefault(); //disable page scrolling
			return;
		}

		if (ev.which === KEYS.UP_ARROW) {
			const index = this.items.indexOf(ev.target);
			const newIndex = index - 1;
			if (newIndex < 0) {
				this.options.searchEl.focus();
			} else {
				this.items[newIndex].focus();
			}
			ev.preventDefault(); //disable page scrolling
		}
	}

	renderSuggestionGroup (group) {
		let html = `<div class="n-typeahead__group ${group.className}" data-trackable="${group.trackable}">`

		html += this.options.categories.length > 1 ? `<div class="n-typeahead__heading">${group.heading}</div>` : '';

		if (group.suggestions.length || group.emptyHtml) {
			html += `<ul class="n-typeahead__item-list">
				${group.suggestions.map(suggestion => this.renderSuggestionLink(suggestion, group)).join('')}
				<li class="n-typeahead__item">
					${this.renderTailLink(group)}
				</li>
			</ul>`
		}
		html += '</div>'
		return html;
	}

	createHtml () {

		const hasConcepts = this.state.suggestions.concepts && this.state.suggestions.concepts.length;
		const hasEquities = this.state.suggestions.equities && this.state.suggestions.equities.length;
		const hasSuggestions = hasConcepts || hasEquities;
		const suggestions = [];
		this.items = [];
		if (this.options.categories.includes('concepts')) {
			suggestions.push({
				heading: headingMapping['concepts'],
				linkClassName: 'n-typeahead__link--news',
				trackable: 'news',
				suggestions: this.state.suggestions.concepts.slice(0, DISPLAY_ITEMS)
					.map(suggestion => ({
						html: this.highlight(suggestion.prefLabel),
						url: suggestion.url,
						id: suggestion.id,
						type: 'tag'
					})),
				tailLink: this.options.includeViewAllLink && {
					url: `/search?q=${this.state.searchTerm}`,
					innerHtml: `<span>See all news matching <mark>${this.state.searchTerm}</mark></span>`,
					trackable: 'see-all'
				}
			});

		}

		if (this.options.categories.includes('equities')) {
			suggestions.push({
				heading: headingMapping['equities'],
				trackable: 'equities',
				linkClassName: 'n-typeahead__link--equities',
				emptyHtml: `<div className="n-typeahead__no-results-message">No equities found</div>`,
				suggestions: this.state.suggestions.equities.slice(0, DISPLAY_ITEMS)
					.map(suggestion => ({
						html: `<span class="n-typeahead__link__equity-name">${this.highlight(suggestion.name)}</span><abbr>${this.highlight(suggestion.symbol)}</abbr>`,
						url: suggestion.url,
						id: suggestion.symbol,
						type: 'equity'
					})),
				tailLink: this.options.includeViewAllLink && {
					url: `https://markets.ft.com/data/search?query=${this.state.searchTerm}`,
					innerHtml: `<span>See all quotes matching <mark>${this.state.searchTerm}</mark></span>`,
					trackable: 'see-all'
				}
			});
		}
		this.newHtml = `<div
				class="n-typeahead"
				${ hasSuggestions ? '' : 'hidden'}
				data-trackable="typeahead"
				${ suggestions.map(this.renderSuggestionGroup) }
			</div>`
	}

	render () {
		if (this.container.innerHTML.trim()) {
			const frag = document.createDocumentFragment();
			frag.appendChild(document.createElement('div'));
			frag.firstChild.insertAdjacentHTML('beforeend', this.newHtml)
			morphdom(this.container, frag.firstChild.firstChild)
		} else {
			this.container.innerHTML = this.newHtml;
		}
		this.newHtml = '';
	}
}


