import Typeahead from '../../src/typeahead';
import TopicSearch from  '../../src/renderers/topic-search';
new Typeahead(document.querySelector('.search-suggestions'));
new Typeahead(document.querySelector('.topic-suggestions'), TopicSearch);
