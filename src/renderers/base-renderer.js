import morphdom from 'morphdom';

function regExpEscape (s) {
	return s.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
}

export default class BaseRenderer {
	constructor (container, options) {
		this.container = container;
		// ensure there is a dom node that morphdom can act on
		this.container.appendChild(document.createElement('div'));
		this.options = options;

		this.state = {
			suggestions: options.categories.reduce((containers, name) => {
				containers[name] = [];
				return containers;
			}, {})
		};
	}

	setState (state) {
		this.state = state;
		this.createHtml();
		this.render();
	}

	highlight (text) {
		return text.replace(RegExp(regExpEscape(this.state.searchTerm), 'gi'), '<mark>$&</mark>');
	}

	render () {
		if (this.container.innerHTML.trim()) {
			// empty the suggestions div first to prevent
			// screen readers reading the old suggestions
			const empty = document.createElement('div');
			const suggestions = this.container.querySelector('.n-topic-search__suggestions');
			if (suggestions) {
				morphdom(suggestions, empty);
			}

			const frag = document.createDocumentFragment();
			frag.appendChild(document.createElement('div'));
			frag.firstChild.insertAdjacentHTML('beforeend', this.newHtml);

			morphdom(this.container.firstChild, frag.firstChild);
		} else {
			this.container.innerHTML = this.newHtml;
		}
		this.newHtml = '';
	}
};
