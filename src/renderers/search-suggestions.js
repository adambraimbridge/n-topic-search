const DISPLAY_ITEMS = 5;
import BaseRenderer from './base-renderer';

const headingMapping = {
	concepts: 'News',
	equities: 'Securities'
};

export default function (container, options) {
	return new SuggestionList(container, options);
}

class SuggestionList extends BaseRenderer {
	constructor (container, options) {
		super(container, options);
		this.renderSuggestionGroup = this.renderSuggestionGroup.bind(this);
		this.createHtml();
		this.render();
	}

	renderTailLink (group) {
		if (group.tailLink) {
			const linkAttrs = `
				class="n-topic-search__target n-topic-search__target--tail"
				href="${group.tailLink.url}"
				data-trackable="${group.tailLink.trackable}""
			`;
			return `<a ${linkAttrs} tabindex="0">${group.tailLink.innerHtml}</a>`;
		}
	}

	renderSuggestionLink (suggestion, group) {
		return `<li class="n-topic-search__item">
			<a class="n-topic-search__target ${group.linkClassName}"
				href="${suggestion.url}"
				tabindex="0"
				data-trackable="link"
				data-suggestion-id="${suggestion.id}"
				data-suggestion-type="${suggestion.type}"
			>${suggestion.html}</a>
		</li>`;
	}

	renderSuggestionGroup (group) {
		let html = `<div class="n-topic-search__group ${group.className}" data-trackable="${group.trackable}">`;

		html += this.options.categories.length > 1 ? `<div class="n-topic-search__heading">${group.heading}</div>` : '';

		if (group.suggestions.length || group.emptyHtml) {
			html += `<ul class="n-topic-search__item-list">
				${group.suggestions.map(suggestion => this.renderSuggestionLink(suggestion, group)).join('')}
				<li class="n-topic-search__item">
					${this.renderTailLink(group)}
				</li>
			</ul>`;
		}
		html += '</div>';
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
				linkClassName: 'n-topic-search__target--news',
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
				linkClassName: 'n-topic-search__target--equities',
				emptyHtml: '<div className="n-topic-search__no-results-message">No equities found</div>',
				suggestions: this.state.suggestions.equities.slice(0, DISPLAY_ITEMS)
					.map(suggestion => ({
						html: `<span class="n-topic-search__target__equity-name">${this.highlight(suggestion.name)}</span><abbr>${this.highlight(suggestion.symbol)}</abbr>`,
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
		this.newHtml = `
			${ hasSuggestions ? `<div
				aria-live="assertive"
				class="o-normalise-visually-hidden">
				Search results have been displayed. These will update automatically as you change your search term.
			</div>` : '' }
			<div
				class="n-topic-search"
				${ hasSuggestions ? '' : 'hidden'}
				data-trackable="typeahead"
			>
				${ suggestions.map(this.renderSuggestionGroup).join('') }
			</div>`;
	}

	handleSelection (el, ev) {
		ev.stopPropagation();
		// we don't prevent default as the link's url is a link to the relevant stream page
		return;
	}
}
