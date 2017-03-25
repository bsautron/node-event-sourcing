const _ = require('lodash');

class EventSources {
	constructor(name, schema) {
		this.name = name;
		this.index = 0;
		this.collection = [];
		this.schema = schema;
		this.add(_.mapValues(schema, 'value'));
	}

	add(data) {
		this.collection.push({
			index: ++this.index,
			payload: data
		});
	}

	retrieve() {
		return _.reduce(this.collection, (accumulator, {payload}) => {
			return _.assign(
				_.mapValues(this.schema, 'value'),
				accumulator,
				_.mapValues(payload, (value, prop) => {
					return (this.schema[prop] && this.schema[prop].reduce && accumulator[prop]) ? this.schema[prop].reduce(accumulator[prop], value) : value;
				})
			);
		}, {});
	}
}

class Trader extends EventSources {
	constructor() {
		super('trader', {
			'coins': { value: 0, reduce: (prev, value) => prev + value },
			'temp': { value: 10 }
		});
	}
}

const trader = new Trader();
