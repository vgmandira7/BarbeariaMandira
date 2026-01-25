import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ---------------------
// DURAÇÕES PADRÃO
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
  selectedService: string;
  userName: string;
  userPhone: string;
  manualDuration?: number;
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

const TimeSlotSelection = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  selectedService,
  userName,
  userPhone,
  manualDuration,
}: TimeSlotSelectionProps) => {
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  useEffect(() => {
    if (selectedDate) fetchBookings(selectedDate);
  }, [selectedDate]);

  const fetchBookings = async (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    const res = await fetch(`${apiBaseUrl}/data/${formattedDate}`);
    const data = await res.json();
    setBookedTimes(data.map((b: any) => b.horario));
  };

  const duracao =
    manualDuration !== undefined
      ? Number(manualDuration)
      : serviceDurations[selectedService] ?? 60;

  const slotsUsados = duracao >= 60 ? 2 : 1;

  const isSlotBlocked = (time: string, index: number) => {
    const booked = bookedTimes.includes(time);
    const previous = timeSlots[index - 1]?.time;
    const previousIsBooked = previous && bookedTimes.includes(previous);

    if (slotsUsados === 2) {
      if (booked || previousIsBooked) return true;
    }

    return booked;
  };

  // 🔥 GERA LINK DO WHATSAPP
  const getWhatsAppLink = () => {
    const whatsappNumber = "5513997434050";

    const message = `
Olá! 👋 Meu agendamento foi confirmado ✅

📌 Detalhes do agendamento:
👤 Cliente: ${userName}
📞 Telefone: ${userPhone}
✂️ Serviço: ${serviceNames[selectedService] || selectedService}
📅 Data: ${format(selectedDate!, "dd/MM/yyyy")}
⏰ Horário: ${selectedTime}
⏳ Duração: ${duracao} minutos
`;

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
  };

  // ✅ CONFIRMA E REDIRECIONA
  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime) return;

    setLoading(true);

    const bookingData: any = {
      nome: userName,
      telefone: userPhone,
      servico: selectedService,
      data: selectedDate.toISOString().split("T")[0],
      horario: selectedTime,
      duracao,
    };

    const res = await fetch(apiBaseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    });

    if (!res.ok) {
      alert("Erro ao salvar agendamento");
      setLoading(false);
      return;
    }

    setShowConfirmation(true);
    setLoading(false);

    // 🚀 REDIRECIONAMENTO GARANTIDO
    setTimeout(() => {
      window.location.href = getWhatsAppLink();
    }, 500);
  };

  if (showConfirmation) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Agendamento Confirmado!</h2>
        <p className="text-muted-foreground">
          Você será redirecionado para o WhatsApp 📲
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2">
      <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
        <Card className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateSelect(date)}
            locale={ptBR}
          />
        </Card>

        <Card className="p-4">
          <div className="grid grid-cols-2 gap-2">
            {timeSlots.map((slot, index) => (
              <Button
                key={slot.time}
                disabled={isSlotBlocked(slot.time, index) || loading}
                onClick={() => onTimeSelect(slot.time)}
              >
                {slot.time}
              </Button>
            ))}
          </div>
        </Card>
      </div>

      {selectedDate && selectedTime && (
        <Card className="max-w-md mx-auto p-4">
          <Button
            onClick={handleConfirmBooking}
            disabled={loading}
            className="w-full bg-black text-white"
          >
            Confirmar Agendamento
          </Button>
        </Card>
      )}
    </div>
  );
};

export default TimeSlotSelection;
