# n-topic-search

Search topics based on a keyword

## it

(containerEl, listComponent)

- containerEl = element containing the search input and element to put suggestions in

```

<form data-typeahead data-typeahead-categories="concepts,equities" data-typeahead-view-all>
	<input data-typeahead-input>
	<button class="o-header__search-submit" type="submit" data-trackable="search-submit">
		Search
	</button>
	<div class="n-typeahead" hidden="" data-trackable="typeahead"></div>
</form>

```

- listComponent a function implementing the following interface

	parameters
	- element
	- opts {
			categories: this.categories,
			itemTag: this.itemTag,
			includeViewAllLink: this.includeViewAllLink,
			searchEl: this.searchEl
		}

		returns object implementing

		setState

		handleSelection
