export interface IEventProperty<T> {
	readonly initialValue: T,
	reduce? (prev: T, value: T): T
}

export interface IEventSourcesType {
	[name: string]: IEventProperty<any>
}

interface IEventSources {
	readonly name: string
	index: number
	pushData (data: IEventSourcesData) : void
	validateData (data: IEventSourcesData) : void
	addField<T> (fieldName: string, schema: IEventProperty<T>) : void
	retrieve () : IEventSourcesData
}

interface IEventSourcesData {
	[name: string]: any
}

interface IEventSourcesDataCollection {
	readonly date: Date
	readonly index: number,
	readonly payload: IEventSourcesData
}

export class EventSources<T extends IEventSourcesType> implements IEventSources {
	readonly name: string
	index: number = -1
	private schema: T

	readonly collection: Array<IEventSourcesDataCollection> = []

	constructor (name: string, schema: T) {
		this.name = name
		this.schema = schema

		const firstEvent = {} as IEventSourcesData

		for (const fieldName in schema) {
			firstEvent[fieldName] = schema[fieldName].initialValue
		}
		this.collection.push({
			index: ++this.index,
			date: new Date(),
			payload: firstEvent
		})
	}

	validateData (data: IEventSourcesData) : void {
		if (Object.keys(data).length === 0)
			throw `You can't push an empty json data`
		for (const fieldName in data) {
			if (this.schema[fieldName] && typeof this.schema[fieldName].initialValue !== typeof data[fieldName])
				throw `Field '${fieldName}' must be a ${typeof this.schema[fieldName].initialValue}`
		}
	}

	pushData (data: IEventSourcesData) : void {
		this.validateData(data)
		this.collection.push({
			index: ++this.index,
			date: new Date(),
			payload: data
		})
	}

	addField<U> (fieldName: string, schema: IEventProperty<U>) : void {
		this.schema[fieldName] = schema
		this.pushData({
			[fieldName]: schema.initialValue
		})
	}

	retrieve () : IEventSourcesData {
		return this.collection.reduce((accumulator, current) => {
			const payload = current.payload

			for (const fieldName in payload) {
				const fieldConfig = this.schema[fieldName]
				const accumulatorField = accumulator[fieldName]

				if (fieldConfig && fieldConfig.reduce && typeof accumulatorField === typeof payload[fieldName])
					accumulator[fieldName] = fieldConfig.reduce (accumulatorField, payload[fieldName])
				else
					accumulator[fieldName] = payload[fieldName]
			}

			return {...payload, ...accumulator}
		}, {} as IEventSourcesData)
	}

}
