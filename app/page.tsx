"use client";

import { useState } from "react";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Script from "next/script";
import { Logo } from "@/components/Logo";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const MERCADO_PAGO_API = "/api/create-payment";

const services = {
  nails: [
    { name: "Gel na tips", price: 120.0 },
    { name: "Manutenção gel", price: 60.0 },
    { name: "Banho de gel", price: 100.0 },
    { name: "Manicure", price: 25.0 },
    { name: "Pedicure", price: 25.0 },
    { name: "Combo Mani + Pedi", price: 45.0 },
  ],
  eyebrows: [
    { name: "Designer com Henna", price: 35.0 },
    { name: "Designer Natural", price: 25.0 },
  ],
};

const allTimes = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

export default function BookingPage() {
  const [selectedService, setSelectedService] = useState("");
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // Validação dos campos
      if (!name || !phone || !date || !time || !selectedService) {
        throw new Error("Todos os campos são obrigatórios!");
      }

      // Buscar dados do serviço
      const selectedServiceData = [...services.nails, ...services.eyebrows].find(
        (service) => service.name === selectedService
      );
      if (!selectedServiceData) throw new Error("Serviço não encontrado");

      // Salvar no Firestore
      const bookingRef = await addDoc(collection(db, "agendamentos"), {
        nome: name,
        telefone: phone,
        data: format(date, "yyyy-MM-dd"),
        horario: time,
        servico: selectedService,
        status: "pendente",
        createdAt: new Date().toISOString(),
        valor: selectedServiceData.price,
      });
      console.log("✅ Agendamento salvo com ID:", bookingRef.id);

      // Enviar e-mail de notificação
      const emailResponse = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "05jeelo30@gmail.com", // Substituir pelo seu e-mail
          subject: "Novo Agendamento - KatySilvaNailDesigner",
          text: `Novo agendamento:
            Nome: ${name}
            WhatsApp: ${phone}
            Serviço: ${selectedService}
            Data: ${format(date, "dd/MM/yyyy")}
            Horário: ${time}
            Valor: R$ ${selectedServiceData.price.toFixed(2)}`
        }),
      });
      if (!emailResponse.ok) throw new Error("Erro ao enviar confirmação por e-mail");

      // Criar pagamento no Mercado Pago
      const paymentResponse = await fetch(MERCADO_PAGO_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: bookingRef.id,
          title: selectedServiceData.name,
          price: selectedServiceData.price,
          date: format(date, "yyyy-MM-dd"),
          time,
          clientName: name,
          clientPhone: phone,
          clientEmail: phone + "@email.com",
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.error || "Erro ao processar pagamento");
      }

      // Redirecionar para o pagamento
      const paymentData = await paymentResponse.json();
      window.location.href = paymentData.init_point;

    } catch (error: any) {
      console.error("❌ Erro:", error);
      setErrorMessage(error.message || "Erro ao processar agendamento");
    } finally {
      setLoading(false);
    }
  };

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
              {/* Campo Nome */}
              <div>
                <Label>Nome:</Label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Seu nome completo" 
                  required 
                />
              </div>

              {/* Campo WhatsApp */}
              <div>
                <Label>WhatsApp:</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  type="tel"
                  required
                />
              </div>

              {/* Seleção de Serviço */}
              <div>
                <Label>Serviço:</Label>
                <Select value={selectedService} onValueChange={setSelectedService} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(services).map(([category, items]) => (
                      <div key={category}>
                        {items.map((service) => (
                          <SelectItem key={service.name} value={service.name}>
                            {service.name} - R${service.price.toFixed(2)}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Seleção de Data */}
              <div>
                <Label>Data:</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd/MM/yyyy") : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar 
                      mode="single" 
                      selected={date} 
                      onSelect={setDate} 
                      disabled={{ before: new Date() }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Seleção de Horário */}
              <div>
                <Label>Horário:</Label>
                <Select value={time} onValueChange={setTime} disabled={!date} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {allTimes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Botão de Submit */}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Confirmar Agendamento"
                )}
              </Button>

              {/* Mensagem de Erro */}
              {errorMessage && (
                <p className="text-red-500 text-center mt-4">{errorMessage}</p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}