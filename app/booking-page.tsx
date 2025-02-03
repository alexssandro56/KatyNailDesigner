"use client"

import { useState } from "react"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Script from "next/script"
import { Logo } from "@/components/Logo"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

const MERCADO_PAGO_API = "/api/create-preference"
const SAVE_TO_SHEETS_API = "/api/save-to-sheets"

const services = {
  nails: [
    { name: "Gel na tips", price: 120.0 },
    { name: "Manutenção gel", price: 60.0 },
    { name: "Banho de gel", price: 100.0 },
    { name: "Manicure", price: 35.0 },
    { name: "Pedicure", price: 35.0 },
    { name: "Combo Mani + Pedi", price: 60.0 },
  ],
  eyebrows: [
    { name: "Designer com Henna", price: 35.0 },
    { name: "Designer Natural", price: 25.0 },
  ],
}

const allTimes = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]

declare global {
  interface Window {
    MercadoPago: any
  }
}

export default function BookingPage() {
  const [selectedService, setSelectedService] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("credit")
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccessMessage("")
    setErrorMessage("")

    try {
      if (!name || !phone || !date || !time || !selectedService) {
        throw new Error("Todos os campos são obrigatórios!")
      }

      const selectedServiceData = [...services.nails, ...services.eyebrows].find(
        (service) => service.name === selectedService,
      )

      if (!selectedServiceData) {
        throw new Error("Serviço não encontrado")
      }

      // Save to Google Sheets first
      const sheetResponse = await fetch(SAVE_TO_SHEETS_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: name,
          telefone: phone,
          data: format(date, "yyyy-MM-dd"),
          horario: time,
          servico: selectedService,
          status: "Pendente",
        }),
      })

      if (!sheetResponse.ok) {
        const errorData = await sheetResponse.json()
        throw new Error(errorData.error || "Falha ao salvar o agendamento. Por favor, tente novamente.")
      }

      // Create payment preference
      const paymentResponse = await fetch(MERCADO_PAGO_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: selectedServiceData.name,
          price: selectedServiceData.price,
          paymentMethod,
          date: format(date, "yyyy-MM-dd"),
          time,
          clientName: name,
          clientPhone: phone,
        }),
      })

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json()
        throw new Error(errorData.error || "Erro ao criar pagamento. Por favor, tente novamente.")
      }

      const paymentData = await paymentResponse.json()

      console.log("✅ Pagamento criado com sucesso!")
      window.location.href = paymentData.init_point
    } catch (error: any) {
      console.error("❌ Erro ao processar agendamento:", error)
      setErrorMessage(
        `Erro: ${error.message || "Ocorreu um erro ao processar o agendamento. Por favor, tente novamente."}`,
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Script src="https://sdk.mercadopago.com/js/v2" strategy="lazyOnload" />
      <div className="min-h-screen bg-pink-50 p-4">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CalendarIcon className="h-6 w-6 text-pink-600" />
              Agendamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Label>Nome:</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />

              <Label>WhatsApp:</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} required type="tel" />

              <Label>Serviço:</Label>
              <Select onValueChange={setSelectedService} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(services).map(([category, items]) => (
                    <div key={category}>
                      <SelectItem value={`section-${category}`} disabled className="font-semibold">
                        {category === "nails" ? "Unhas" : "Sobrancelhas"}
                      </SelectItem>
                      {items.map((service) => (
                        <SelectItem key={service.name} value={service.name}>
                          {service.name} - R${service.price.toFixed(2)}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>

              <Label>Data:</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} disabled={{ before: new Date() }} />
                </PopoverContent>
              </Popover>

              <Label>Horário:</Label>
              <Select value={time} onValueChange={setTime} disabled={!date}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o horário" />
                </SelectTrigger>
                <SelectContent>
                  {allTimes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirmar Agendamento"}
              </Button>

              {successMessage && <div className="mt-4 text-green-600 font-semibold">{successMessage}</div>}
              {errorMessage && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  <p className="font-semibold">Erro:</p>
                  <p>{errorMessage}</p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

