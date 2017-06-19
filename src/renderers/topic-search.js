const React = require('react');
import { broadcast } from 'n-ui-foundations';

function regExpEscape (s) {
	return s.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
}

const KEYS = {
	ENTER: 13,
	UP_ARROW: 38,
	DOWN_ARROW: 40
};

export class TagSuggestions extends React.Component {
	constructor (props) {
		super(props);
	}

	highlight (text) {
		return text.replace(RegExp(regExpEscape(this.props.searchTerm), 'gi'), '<mark>$&</mark>');
	}

	handleSelect (ev) {
		ev.stopPropagation();
		let target = ev.target;
		while (!target.classList.contains('n-typeahead__link')) {
			target = target.parentNode;
		}
		broadcast.call(ev.target, 'next.filter-suggestion.select', target.dataset);
	}

	handleKeyDown (ev) {
		if (ev.which === KEYS.ENTER) {
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
				this.props.searchEl.focus();
			} else {
				this.items[newIndex].focus();
			}
			ev.preventDefault(); //disable page scrolling
		}
	}

	render () {
		const hasConcepts = this.props.suggestions.concepts && this.props.suggestions.concepts.length;

		const suggestions = hasConcepts ? this.props.suggestions.concepts
			.filter(concept => !this.props.selectedTags.includes(concept.prefLabel))
			.slice(0, 5)
			.map(suggestion => Object.assign({
				html: this.highlight(suggestion.prefLabel)
			}, suggestion)) : [];
		this.items = [];

		return <ul
			className="n-typeahead search-filtering__suggestions"
			hidden={ !hasConcepts }
			data-trackable="typeahead"
			onKeyDown={this.handleKeyDown.bind(this)}
			onClick={this.handleSelect}>
			{ suggestions.map(suggestion => (
					<li className="n-typeahead__item">
						<button type="button" className="n-typeahead__link search-filtering__suggestion"
							ref={(c) => { this.items.push(c); }}
							data-trackable="concept-suggestion"
							data-suggestion-id={suggestion.id}
							data-suggestion-name={suggestion.prefLabel}
							dangerouslySetInnerHTML={{__html:suggestion.html}}></button>
					</li>
				)) }
		</ul>;
	}
}