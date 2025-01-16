"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { EventForm } from "@/components/event-form"
import { Event, EventCategory } from "@/types/event"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { format, isAfter, isBefore, startOfDay } from "date-fns"
import { tr } from "date-fns/locale"
import { CalendarPlus, MapPin, Clock, Pencil, Filter } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type FilterType = "all" | "upcoming" | "past"
type CategoryFilter = "all" | EventCategory

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [events, setEvents] = useLocalStorage<Event[]>("events", [])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [timeFilter, setTimeFilter] = useState<FilterType>("all")
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all")

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAddEvent = (eventData: Omit<Event, "id">) => {
    const newEvent: Event = {
      ...eventData,
      id: crypto.randomUUID(),
    }
    setEvents(prev => [...prev, newEvent])
  }

  const handleEditEvent = (eventData: Omit<Event, "id">) => {
    if (!selectedEvent) return
    setEvents(prev =>
      prev.map(event =>
        event.id === selectedEvent.id
          ? { ...eventData, id: event.id }
          : event
      )
    )
    setSelectedEvent(null)
  }

  if (!mounted) {
    return null
  }

  // Filtreleme ve sıralama
  const filteredEvents = events.filter(event => {
    const eventDate = startOfDay(new Date(`${event.date}T${event.time}`))
    const today = startOfDay(new Date())
    
    const matchesTimeFilter = 
      timeFilter === "all" ||
      (timeFilter === "upcoming" && !isBefore(eventDate, today)) ||
      (timeFilter === "past" && isBefore(eventDate, today))

    const matchesCategoryFilter =
      categoryFilter === "all" || event.category === categoryFilter

    return matchesTimeFilter && matchesCategoryFilter
  }).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`)
    const dateB = new Date(`${b.date}T${b.time}`)
    return dateA.getTime() - dateB.getTime()
  })

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <nav className="flex justify-between items-center mb-8 bg-card p-4 rounded-lg shadow-sm">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
          Etkinlik Planlayıcı
        </h1>
        <div className="flex items-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <CalendarPlus className="h-5 w-5" />
                <span className="hidden md:inline">Yeni Etkinlik</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Etkinlik Ekle</DialogTitle>
              </DialogHeader>
              <EventForm onSubmit={handleAddEvent} />
            </DialogContent>
          </Dialog>
          <ModeToggle />
        </div>
      </nav>

      {/* Filtreler */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Select value={timeFilter} onValueChange={(value: FilterType) => setTimeFilter(value)}>
            <SelectTrigger>
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Zaman filtresi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Etkinlikler</SelectItem>
              <SelectItem value="upcoming">Yaklaşan Etkinlikler</SelectItem>
              <SelectItem value="past">Geçmiş Etkinlikler</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select
            value={categoryFilter}
            onValueChange={(value: CategoryFilter) => setCategoryFilter(value)}
          >
            <SelectTrigger>
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Kategori filtresi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              <SelectItem value="iş">İş</SelectItem>
              <SelectItem value="kişisel">Kişisel</SelectItem>
              <SelectItem value="eğlence">Eğlence</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-6">
        {filteredEvents.length === 0 ? (
          <div className="rounded-lg border p-8 text-center bg-card">
            <CalendarPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Etkinlik Bulunamadı</h2>
            <p className="text-muted-foreground mb-4">
              {events.length === 0
                ? "Yeni etkinlik ekleyerek planlamaya başlayın"
                : "Seçili filtrelere uygun etkinlik bulunamadı"}
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <CalendarPlus className="h-5 w-5 mr-2" />
                  Etkinlik Ekle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Etkinlik Ekle</DialogTitle>
                </DialogHeader>
                <EventForm onSubmit={handleAddEvent} />
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map(event => (
              <div
                key={event.id}
                className="rounded-lg border p-4 bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold line-clamp-2">{event.title}</h3>
                    <span className="inline-flex items-center px-2 py-1 mt-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {event.category}
                    </span>
                  </div>
                  <div className="flex gap-2 -mt-2 -mr-2">
                    <Dialog onOpenChange={(open) => !open && setSelectedEvent(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Etkinliği Düzenle</DialogTitle>
                        </DialogHeader>
                        <EventForm
                          mode="edit"
                          initialData={event}
                          onSubmit={handleEditEvent}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive/90"
                      onClick={() => setEvents(prev => prev.filter(e => e.id !== event.id))}
                    >
                      Sil
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <time>
                      {format(new Date(`${event.date}T${event.time}`), "d MMMM yyyy, HH:mm", {
                        locale: tr,
                      })}
                    </time>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{event.location}</span>
                  </div>
                  {event.description && (
                    <p className="text-muted-foreground mt-2 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
