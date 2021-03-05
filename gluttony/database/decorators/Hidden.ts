import { BaseEntity, Column, ColumnOptions, DeepPartial } from 'typeorm'

const KEY = Symbol('format')

export default function (options?: ColumnOptions) {
   return (target: Object, key: string | symbol) => {
      Reflect.metadata(KEY, true)(target, key)
      Column(options ?? {})(target, key)
   }
}

export function strip<E extends BaseEntity>(target: E): DeepPartial<E> {
   const hiddenFields = Object.keys(target).filter(key => Reflect.getMetadata(KEY, target, key))

   return Object.entries(target)
      .filter(([key]) => !hiddenFields.includes(key))
      .map(([key, value]) => [key, value instanceof BaseEntity ? strip(value) : value])
      .reduce((o, [key, value]) => ({ ...o, [key]: value }), {})
}
