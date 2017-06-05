import { EventSources, IEventSourcesType, IEventProperty } from '../lib/event-sources'

interface IBitCount extends IEventSourcesType {
	coins: IEventProperty<number>
	temps: IEventProperty<number>
}

class BitCoints extends EventSources<IBitCount> {
	constructor (name: string = 'bit') {
		super(name, {
			coins: { initialValue: 100, reduce: (prev, value) => prev + value },
			temps: { initialValue: 0 }
		})

		this.addField<number>('test', { initialValue: 23 })
	}
}

const bit = new BitCoints()

bit.pushData({ coins: 2 })
bit.pushData({ coins: 10 })
bit.pushData({ coins: -2 })


console.log(bit.history())

const final = bit.retrieve()

console.log(final)