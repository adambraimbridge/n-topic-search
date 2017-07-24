import Typeahead from '../../src/typeahead';
import TopicSearch from  '../../src/renderers/topic-search';
new Typeahead(document.querySelector('.search-suggestions'));
new Typeahead(document.querySelector('.topic-suggestions'), {
	listComponent: TopicSearch,
	preSuggest: suggestions => {
		const selected = [...document.querySelectorAll('.selected-topics li')].map(el => el.dataset.id)
		suggestions.concepts = suggestions.concepts.filter(concept => !selected.includes(concept.id))
		return suggestions;
	}
});


document.querySelector('.topic-suggestions').addEventListener('n-topic-search.select', ev => {
	document.querySelector('.selected-topics').insertAdjacentHTML('beforeend', `<li data-id="${ev.target.dataset.suggestionId}">${ev.target.dataset.suggestionName}</li>`)
})
