import { broadcast } from 'n-ui-foundations';
import BaseRenderer from './base-renderer';

function regExpEscape (s) {
	return s.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
}

const KEYS = {
	ENTER: 13,
	UP_ARROW: 38,
	DOWN_ARROW: 40
};


export default function (container, options) {
	return new TopicSearch(container, options)
}

class TopicSearch extends BaseRenderer {
	constructor (container, options) {
		super(container, options);
		this.createHtml();
		this.render();
	}

	handleSelection (el, ev) {
		ev.stopPropagation();
		broadcast.call(el, 'next.filter-suggestion.select', el.dataset);
	}

	createHtml () {
		const hasSuggestions = this.state.suggestions.concepts && this.state.suggestions.concepts.length;

		const suggestions = hasSuggestions ? this.state.suggestions.concepts
			// .filter(concept => !this.options.selectedTags.includes(concept.prefLabel))
			.slice(0, 5)
			.map(suggestion => Object.assign({
				html: this.highlight(suggestion.prefLabel)
			}, suggestion)) : [];
		this.items = [];

		this.newHtml = `<ul
			class="n-typeahead search-filtering__suggestions"
			${ hasSuggestions ? '' : 'hidden'}
			data-trackable="typeahead">
			${ suggestions.map(suggestion =>
					`<li class="n-typeahead__item">
						<button type="button" class="n-typeahead__target search-filtering__suggestion"
							data-trackable="concept-suggestion"
							data-suggestion-id=${suggestion.id}
							data-suggestion-name=${suggestion.prefLabel}>${suggestion.html}</button>
					</li>`
				).join('') }
		</ul>`;
	}
}


