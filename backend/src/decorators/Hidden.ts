import { BaseEntity } from 'typeorm'

const KEY = Symbol('format')

export default function () {
   return Reflect.metadata(KEY, true)
}

export function stripHidden<E extends BaseEntity>(target: E): Partial<E> {
   const hiddenFields = Object.keys(target)
      .filter(key => Reflect.getMetadata(KEY, target, key))
      .map(k => k as keyof E)

   const cloned = { ...target }
   hiddenFields.forEach(key => {
      delete cloned[key]
   })

   return cloned
}
