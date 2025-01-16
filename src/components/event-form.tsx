"use client"

import { useState, useEffect } from "react"
import { Event, EventCategory } from "@/types/event"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DialogClose } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

interface EventFormProps {
  onSubmit: (event: Omit<Event, "id">) => void
  initialData?: Event
  mode?: "create" | "edit"
}

const categories: { value: EventCategory; label: string }[] = [
  { value: "iş", label: "İş" },
  { value: "kişisel", label: "Kişisel" },
  { value: "eğlence", label: "Eğlence" },
]

export function EventForm({ onSubmit, initialData, mode = "create" }: EventFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: format(new Date(), "HH:mm"),
    location: "",
    description: "",
    category: "kişisel" as EventCategory,
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        date: initialData.date,
        time: initialData.time,
        location: initialData.location,
        description: initialData.description,
        category: initialData.category,
      })
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const today = new Date()
  const maxDate = new Date()
  maxDate.setFullYear(today.getFullYear() + 2)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Başlık</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Etkinlik başlığı"
          required
          maxLength={100}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Tarih</Label>
          <Input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={mode === "create" ? format(today, "yyyy-MM-dd") : undefined}
            max={format(maxDate, "yyyy-MM-dd")}
            required
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Saat</Label>
          <Input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Kategori</Label>
        <Select
          value={formData.category}
          onValueChange={(value: EventCategory) =>
            setFormData(prev => ({ ...prev, category: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Kategori seçin" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Konum</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Etkinlik konumu"
          required
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Açıklama</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Etkinlik detayları..."
          rows={3}
          className="w-full resize-none"
        />
      </div>

      <div className="flex justify-end gap-4">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            İptal
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button type="submit">
            {mode === "create" ? "Ekle" : "Güncelle"}
          </Button>
        </DialogClose>
      </div>
    </form>
  )
} 