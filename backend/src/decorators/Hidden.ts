import { BaseEntity, DeepPartial } from 'typeorm'

const KEY = Symbol('format')

export default function () {
   return Reflect.metadata(KEY, true)
}

export function stripHidden<E extends BaseEntity>(target: E): DeepPartial<E> {
   const hiddenFields = Object.keys(target).filter(key => Reflect.getMetadata(KEY, target, key))

   return Object.entries(target)
      .filter(([key]) => !hiddenFields.includes(key))
      .map(([key, value]) => [key, value instanceof BaseEntity ? stripHidden(value) : value])
      .reduce((o, [key, value]) => ({ ...o, [key]: value }), {})
}
