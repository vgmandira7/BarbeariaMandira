import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ---------------------
// TABELA DE DURAÇÕES (CLIENTE)
// ---------------------
const serviceDurations: Record<string, number> = {
  "cabelo": 60,
  "cabelo + barba": 60,
  "barba": 30,
  "sobrancelha": 30,
};

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSlotSelectionProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string) => void;
  onConfirm: () => void;
  selectedService: string;
  userName: string;
  userPhone: string;
  showGoogleCalendarButton?: boolean;

  // 🔥 NOVO: duração manual (painel do barbeiro)
  manualDuration?: number;
}

// IMPORTANTE: aqui já é a rota completa
const apiBaseUrl =
  import.meta.env.VITE_API_BASE || "https://barbearia-mandira.vercel.app/api/bookings";

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
  sobrancelha: "Sobrancelha",
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
  showGoogleCalendarButton = true,
}: TimeSlotSelectionProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  // Carrega agendamentos ao mudar a data
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

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedService) return;

    const bookingData: any = {
      nome: userName,
      telefone: userPhone,
      servico: selectedService,
      data: selectedDate.toISOString().split("T")[0],
      horario: selectedTime,
    };

    // 🔥 Se tiver duração manual (admin), manda pro backend
    if (manualDuration !== undefined && manualDuration !== null) {
      bookingData.duracao = Number(manualDuration);
    }

    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const response = await res.json();

      if (!res.ok) {
        alert(response.error || "Erro ao salvar agendamento");
        setLoading(false);
        return;
      }

      await fetchBookings(selectedDate);
      setShowConfirmation(true);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar agendamento");
      setLoading(false);
    }
  };

  // ------------------------------
  // DURAÇÃO REAL USADA NO CÁLCULO
  // ------------------------------
  const duracao =
    manualDuration !== undefined && manualDuration !== null
      ? Number(manualDuration)
      : serviceDurations[selectedService] ?? 60;

  const slotsUsados = duracao >= 60 ? 2 : 1;

  const isSlotBlocked = (time: string, index: number) => {
    const booked = bookedTimes.includes(time);

    // Verifica se o horário anterior está reservado
    const previous = timeSlots[index - 1]?.time;
    const previousIsBooked = previous && bookedTimes.includes(previous);

    // Se o serviço ocupa 1h → não deixa usar o slot seguinte
    if (slotsUsados === 2) {
      if (booked) return true;           // próprio horário reservado
      if (previousIsBooked) return true; // anterior reservado (ele comeu esse também)
    }

    // Se o serviço ocupa só 30min → bloqueia apenas o próprio horário
    return booked;
  };

  if (showConfirmation) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Agendamento Confirmado!</h2>
        <p className="text-muted-foreground">Seu horário foi reservado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Escolha Data e Horário</h2>
        <p className="text-muted-foreground">
          Serviço:{" "}
          <span className="font-medium">
            {serviceNames[selectedService] || selectedService}
          </span>
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
        {/* CALENDÁRIO */}
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

        {/* HORÁRIOS */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">
            {selectedDate
              ? `Horários para ${format(selectedDate, "dd 'de' MMMM", {
                  locale: ptBR,
                })}`
              : "Selecione uma data"}
          </h3>

          {selectedDate ? (
            <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-2">
              {timeSlots.map((slot, index) => {
                const disabled = isSlotBlocked(slot.time, index);

                // Regra anti-horário passado (opcional, se quiser manter)
                let isPast = false;
                if (selectedDate) {
                  const now = new Date();
                  const slotDateTime = new Date(selectedDate);
                  const [hour, minute] = slot.time.split(":").map(Number);
                  slotDateTime.setHours(hour, minute, 0, 0);
                  if (
                    slotDateTime.toDateString() === now.toDateString() &&
                    slotDateTime.getTime() <= now.getTime() + MARGIN_MS
                  ) {
                    isPast = true;
                  }
                }

                const finalDisabled = disabled || isPast || loading;

                return (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    size="sm"
                    disabled={finalDisabled}
                    onClick={() => onTimeSelect(slot.time)}
                    className={`${
                      finalDisabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {slot.time}
                  </Button>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Selecione uma data para ver os horários
            </p>
          )}
        </Card>
      </div>

      {/* RESUMO */}
      {selectedDate && selectedTime && (
        <Card className="max-w-md mx-auto p-4 bg-accent">
          <h3 className="font-semibold mb-3">Resumo do Agendamento</h3>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Cliente:</strong> {userName}
            </p>
            <p>
              <strong>Telefone:</strong> {userPhone}
            </p>
            <p>
              <strong>Serviço:</strong>{" "}
              {serviceNames[selectedService] || selectedService}
            </p>
            <p>
              <strong>Data:</strong>{" "}
              {format(selectedDate, "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </p>
            <p>
              <strong>Horário:</strong> {selectedTime}
            </p>
            <p>
              <strong>Duração:</strong> {duracao} minutos
            </p>
          </div>

          <Button
            onClick={handleConfirmBooking}
            className="w-full mt-4 bg-black text-white hover:bg-gray-800"
          >
            Confirmar Agendamento
          </Button>
        </Card>
      )}
    </div>
  );
};

export default TimeSlotSelection;
