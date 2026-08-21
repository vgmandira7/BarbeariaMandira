import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ---------------------
// DURAÇÕES DOS SERVIÇOS
// ---------------------
const serviceDurations: Record<string, number> = {
  cabelo: 60,
  "cabelo + barba": 60,
  barba: 30,
};

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSlotSelectionProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string | null) => void;
  onConfirm?: () => void;        // 👈 barbeiro
  selectedService: string;
  userName: string;
  userPhone: string;
  manualDuration?: number;
  enableWhatsApp?: boolean;     // 👈 cliente vs barbeiro
}

const apiBaseUrl =
  import.meta.env.VITE_API_BASE ||
  "https://barbearia-mandira.vercel.app/api/bookings";

const timeSlots: TimeSlot[] = [
  { time: "07:00", available: true },
  { time: "07:30", available: true },
  { time: "08:00", available: true },
  { time: "08:30", available: true },
  { time: "09:00", available: true },
  { time: "09:30", available: true },
  { time: "10:00", available: true },
  { time: "10:30", available: true },
  { time: "11:00", available: true },
  { time: "11:30", available: true },
  { time: "13:00", available: true },
  { time: "13:30", available: true },
  { time: "14:00", available: true },
  { time: "14:30", available: true },
  { time: "15:00", available: true },
  { time: "15:30", available: true },
  { time: "16:00", available: true },
  { time: "16:30", available: true },
  { time: "17:00", available: true },
  { time: "17:30", available: true },
  { time: "18:00", available: true },
  { time: "18:30", available: true },
  { time: "19:00", available: true },
  { time: "19:30", available: true },
  { time: "20:00", available: true },
];

const serviceNames: Record<string, string> = {
  cabelo: "Cabelo",
  "cabelo + barba": "Cabelo + Barba",
  barba: "Barba",
};

const MARGIN_MINUTES = 15;
const MARGIN_MS = MARGIN_MINUTES * 60 * 1000;

const TimeSlotSelection = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  onConfirm,
  selectedService,
  userName,
  userPhone,
  manualDuration,
  enableWhatsApp = true,
}: TimeSlotSelectionProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  useEffect(() => {
    if (selectedDate) fetchBookings(selectedDate);
  }, [selectedDate]);

  const fetchBookings = async (date: Date) => {
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const res = await fetch(`${apiBaseUrl}/data/${formattedDate}`);
      const dayBookings = await res.json();

      // Mapeia todos os slots ocupados considerando se o corte agendado foi de 30 ou 60 minutos
      const occupied: string[] = [];
      dayBookings.forEach((b: any) => {
        occupied.push(b.horario);
        const bookingDuration =
          b.duracao !== undefined && b.duracao !== null
            ? Number(b.duracao)
            : serviceDurations[b.servico] ?? 60;

        if (bookingDuration >= 60) {
          const index = timeSlots.findIndex((slot) => slot.time === b.horario);
          if (index !== -1 && timeSlots[index + 1]) {
            occupied.push(timeSlots[index + 1].time);
          }
        }
      });

      setBookedTimes(occupied);
    } catch (err) {
      console.error("Erro ao buscar agendamentos", err);
    }
  };

  const handleDateSelect = (date: Date) => {
    onDateSelect(date);
    onTimeSelect(null);
  };

  const duracao =
    manualDuration !== undefined
      ? Number(manualDuration)
      : serviceDurations[selectedService] ?? 60;

  const slotsUsados = duracao >= 60 ? 2 : 1;

  const isSlotBlocked = (time: string, index: number) => {
    // 1. O próprio slot já está ocupado por outro corte no banco
    if (bookedTimes.includes(time)) return true;

    // 2. Se o corte selecionado agora for de 60 min (2 slots):
    // Bloqueia caso não tenha próximo slot ou o próximo já esteja ocupado
    if (slotsUsados === 2) {
      const next = timeSlots[index + 1]?.time;
      if (!next || bookedTimes.includes(next)) return true;
    }

    return false;
  };

  // 🔥 REDIRECIONAMENTO PARA WHATSAPP
  const redirectToWhatsApp = () => {
    const whatsappNumber = "5513997434050";

    // Formata o dia da semana (ex: "quinta-feira" -> "Quinta")
    const diaSemanaBruto = format(selectedDate!, "EEEE", { locale: ptBR });
    const diaSemana = diaSemanaBruto.split("-")[0];
    const diaSemanaFormatado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
    const dataComDiaSemana = `${diaSemanaFormatado} - ${format(selectedDate!, "dd/MM/yyyy")}`;

    const message =
      `Olá! 👋 Meu agendamento foi confirmado ✅\n\n` +
      `📌 *Detalhes do agendamento*\n` +
      `👤 Cliente: ${userName}\n` +
      `📞 Telefone: ${userPhone}\n` +
      `✂️ Serviço: ${serviceNames[selectedService] || selectedService}\n` +
      `📅 Data: ${dataComDiaSemana}\n` +
      `⏰ Horário: ${selectedTime}\n` +
      `⏳ Duração: ${duracao} minutos`;

    const encodedMessage = encodeURIComponent(message);

    const link = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;

    window.location.href = link; // 👈 ESSENCIAL PARA iOS
  };

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime) return;

    if (enableWhatsApp === false) {
      onConfirm?.();
      return;
    }

    const bookingData = {
      nome: userName,
      telefone: userPhone,
      servico: selectedService,
      data: selectedDate.toISOString().split("T")[0],
      horario: selectedTime,
      duracao,
    };

    try {
      setLoading(true);

      const res = await fetch(apiBaseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erro ao salvar agendamento");
        setLoading(false);
        return;
      }

      // 🔥 primeiro feedback visual
      setShowConfirmation(true);

      // 🔥 depois redireciona (Safari aceita)
      redirectToWhatsApp();
    } catch (err) {
      alert("Erro ao salvar agendamento");
    } finally {
      setLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Agendamento Confirmado!</h2>
        <p className="text-muted-foreground">
          Você será redirecionado para o WhatsApp 📲
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Escolha Data e Horário</h2>
        <p className="text-muted-foreground">
          Serviço:{" "}
          <strong>{serviceNames[selectedService] || selectedService}</strong>
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center">
            <Clock className="h-4 w-4 mr-2" /> Selecione uma Data
          </h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && handleDateSelect(date)}
            locale={ptBR}
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const maxDate = new Date(today);
              maxDate.setDate(today.getDate() + 7);
              return date < today || date > maxDate || date.getDay() === 0;
            }}
          />
        </Card>

        <Card className="p-4">
          {selectedDate ? (
            <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
              {timeSlots.map((slot, index) => {
                const disabled =
                  isSlotBlocked(slot.time, index) || loading;

                return (
                  <Button
                    key={slot.time}
                    size="sm"
                    variant={
                      selectedTime === slot.time ? "default" : "outline"
                    }
                    disabled={disabled}
                    onClick={() => onTimeSelect(slot.time)}
                  >
                    {slot.time}
                  </Button>
                );
              })}
            </div>
          ) : (
            <p className="text-center py-10 text-muted-foreground">
              Selecione uma data
            </p>
          )}
        </Card>
      </div>

      {selectedDate && selectedTime && (
        <Card className="max-w-md mx-auto p-4 bg-accent">
          <h3 className="font-semibold mb-3">Resumo do Agendamento</h3>

          <p><strong>Cliente:</strong> {userName}</p>
          <p><strong>Telefone:</strong> {userPhone}</p>
          <p><strong>Serviço:</strong> {serviceNames[selectedService]}</p>
          <p><strong>Data:</strong> {format(selectedDate, "dd/MM/yyyy")}</p>
          <p><strong>Horário:</strong> {selectedTime}</p>
          <p><strong>Duração:</strong> {duracao} minutos</p>

          <Button
            onClick={handleConfirmBooking}
            className="w-full mt-4 bg-black text-white"
            disabled={loading}
          >
            Confirmar Agendamento
          </Button>
        </Card>
      )}
    </div>
  );
};

export default TimeSlotSelection;
