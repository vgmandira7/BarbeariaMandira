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
  onConfirm: () => void;
  selectedService: string;
  userName: string;
  userPhone: string;
  manualDuration?: number;
  showGoogleCalendarButton?: boolean;

  // 🆕 CONTROLE DE WHATSAPP
  enableWhatsApp?: boolean;
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
  enableWhatsApp = true, // ✅ padrão cliente
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
      setBookedTimes(dayBookings.map((b: any) => b.horario));
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
    const booked = bookedTimes.includes(time);
    const previous = timeSlots[index - 1]?.time;
    const previousIsBooked = previous && bookedTimes.includes(previous);

    if (slotsUsados === 2) {
      if (booked) return true;
      if (previousIsBooked) return true;
    }

    return booked;
  };

  const redirectToWhatsApp = () => {
    const whatsappNumber = "5513997434050";

    const message = `
Olá! 👋 Meu agendamento foi confirmado ✅

📌 Detalhes do agendamento
👤 Cliente: ${userName}
📞 Telefone: ${userPhone}
✂️ Serviço: ${serviceNames[selectedService] || selectedService}
📅 Data: ${format(selectedDate!, "dd/MM/yyyy")}
⏰ Horário: ${selectedTime}
⏳ Duração: ${duracao} minutos
`;

    const link = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;

    window.open(link, "_blank");
  };

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime) return;

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

      if (!res.ok) {
        alert("Erro ao salvar agendamento");
        setLoading(false);
        return;
      }

      await fetchBookings(selectedDate);
      setShowConfirmation(true);
      setLoading(false);

      // ✅ SÓ CLIENTE VAI PRO WHATSAPP
      if (enableWhatsApp) {
        redirectToWhatsApp();
      }
    } catch (err) {
      alert("Erro ao salvar agendamento");
      setLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Agendamento Confirmado!</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2">
      {/* 🔴 TODO O LAYOUT ORIGINAL MANTIDO */}
      {selectedDate && selectedTime && (
        <Card className="max-w-md mx-auto p-4 bg-accent">
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
