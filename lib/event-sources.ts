export interface IEventProperty<T> {
	readonly initialValue: T,
	reduce? (prev: T, value: T): T
}

export interface IEventSourcesType {
	[name: string]: IEventProperty<any>
}

export interface IEventSourcesData {
	[name: string]: any
}

export interface IEventSourcesDataCollection {
	readonly date: Date
	readonly index: number,
	readonly payload: IEventSourcesData
}


interface IEventSources {
	pushData (data: IEventSourcesData) : void
	validateData (data: IEventSourcesData) : void
	addField<T> (fieldName: string, schema: IEventProperty<T>) : void
	retrieve () : IEventSourcesData
	undo () : void
	history () : Array<IEventSourcesDataCollection>
}


export class EventSources<T extends IEventSourcesType> implements IEventSources {
	private _name: string
	private _schema: T
	private _collection: Array<IEventSourcesDataCollection> = []

	index: number = -1

	constructor (name: string, schema: T) {
		this._name = name
		this._schema = schema

		const firstEvent = {} as IEventSourcesData

		for (const fieldName in schema) {
			firstEvent[fieldName] = schema[fieldName].initialValue
		}
		this._collection.push({
			index: ++this.index,
			date: new Date(),
			payload: firstEvent
		})
	}

	validateData (data: IEventSourcesData) : void {
		if (Object.keys(data).length === 0)
			throw `You can't push an empty json data`
		for (const fieldName in data) {
			if (this._schema[fieldName] && typeof this._schema[fieldName].initialValue !== typeof data[fieldName])
				throw `Field '${fieldName}' must be a ${typeof this._schema[fieldName].initialValue}`
		}
	}

	pushData (data: IEventSourcesData) : void {
		this.validateData(data)
		this._collection.push({
			index: ++this.index,
			date: new Date(),
			payload: data
		})
	}

	addField<U> (fieldName: string, schema: IEventProperty<U>) : void {
		this._schema[fieldName] = schema
		this.pushData({
			[fieldName]: schema.initialValue
		})
	}

	retrieve () : IEventSourcesData {
		return this._collection.reduce((accumulator, current) => {
			const payload = current.payload

			for (const fieldName in payload) {
				const fieldConfig = this._schema[fieldName]
				const accumulatorField = accumulator[fieldName]

				if (fieldConfig && fieldConfig.reduce && typeof accumulatorField === typeof payload[fieldName])
					accumulator[fieldName] = fieldConfig.reduce (accumulatorField, payload[fieldName])
				else
					accumulator[fieldName] = payload[fieldName]
			}

			return {...payload, ...accumulator}
		}, {} as IEventSourcesData)
	}

	undo () : void {
		if (this._collection.length === 0)
			throw `Can't undo because nothing appened...`
		this._collection.pop()
	}

	history () : Array<IEventSourcesDataCollection> {
		return this._collection
	}
}
