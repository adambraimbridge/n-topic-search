import React, { Component } from 'react';

export default function TagUniqueSuggestions (SuggestionsComponent, selected) {
	return class extends Component {
		constructor (props) {
			super(props);
			this.state = {
				suggestions: {
					concepts: [],
					equities: []
				}
			};
		}
		render () {
			const selectedTags = Array.from(selected.querySelectorAll('li')).map(el => el.innerText);
			return <SuggestionsComponent
				selectedTags={selectedTags}
				{...this.state}
				{...this.props} />;
		}
	};
}