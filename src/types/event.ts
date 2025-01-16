export type EventCategory = "iş" | "kişisel" | "eğlence"

export interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  description: string
  category: EventCategory
} 