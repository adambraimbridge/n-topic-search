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

	handleSelection (el, ev, parent) {
		ev.stopPropagation();
		broadcast.call(el, 'n-topic-search.select', el.dataset);
		parent.reset();
	}

	createHtml () {
		const hasSuggestions = this.state.suggestions.concepts && this.state.suggestions.concepts.length;

		const suggestions = hasSuggestions ? this.state.suggestions.concepts
			.slice(0, 5)
			.map(suggestion => Object.assign({
				html: this.highlight(suggestion.prefLabel)
			}, suggestion)) : [];

		this.newHtml = `<ul
			class="n-topic-search n-topic-search--single-category"
			${ hasSuggestions ? '' : 'hidden'}
			data-trackable="typeahead">
			${ suggestions.map(suggestion =>
					`<li class="n-topic-search__item">
						<button type="button" class="n-topic-search__target search-filtering__suggestion"
							data-trackable="concept-suggestion"
							data-suggestion-id="${suggestion.id}"
							data-suggestion-name="${suggestion.prefLabel}">${suggestion.html}</button>
					</li>`
				).join('') }
		</ul>`;
	}
}


