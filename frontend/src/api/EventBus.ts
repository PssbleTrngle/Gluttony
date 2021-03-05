type Subsciber<T> = (value: T) => unknown

type Events = Record<string, any>

export default class EventBus<E extends Events> {

   private current = new Map<keyof E, E[keyof E]>()
   private subscibers = new Map<keyof E, Set<Subsciber<any>>>()

   public subscribe<Event extends keyof E>(event: Event, sub: Subsciber<E[Event]>, initial = true) {
      const subs = this.subscibers.get(event) ?? new Set<Subsciber<E[Event]>>()
      subs.add(sub)
      this.subscibers.set(event, subs)

      if (initial) {
         const current = this.current.get(event) as E[Event]
         if (current) sub(current)
      }

      return () => {
         subs.delete(sub)
      }
   }

   protected emit<Event extends keyof E>(event: Event, payload: E[Event], onlyChanged = true) {
      if (onlyChanged && this.current.get(event) === payload) return;
      this.current.set(event, payload)
      this.subscibers.get(event)?.forEach(sub => sub(payload))
   }

}