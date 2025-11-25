import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ---------------------
// TABELA DE DURAÇÕES
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
}

const apiBaseUrl = import.meta.env.VITE_API_BASE || 'https://barbearia-mandira.vercel.app/api/bookings';

const timeSlots: TimeSlot[] = [
  { time: '07:00', available: true },
  { time: '07:30', available: true },
  { time: '08:00', available: true },
  { time: '08:30', available: true },
  { time: '09:00', available: true },
  { time: '09:30', available: true },
  { time: '10:00', available: true },
  { time: '10:30', available: true },
  { time: '11:00', available: true },
  { time: '11:30', available: true },
  { time: '13:00', available: true },
  { time: '13:30', available: true },
  { time: '14:00', available: true },
  { time: '14:30', available: true },
  { time: '15:00', available: true },
  { time: '15:30', available: true },
  { time: '16:00', available: true },
  { time: '16:30', available: true },
  { time: '17:00', available: true },
  { time: '17:30', available: true },
  { time: '18:00', available: true },
  { time: '18:30', available: true },
  { time: '19:00', available: true },
  { time: '19:30', available: true },
  { time: '20:00', available: true },
];

const serviceNames: Record<string, string> = {
  'cabelo': 'Cabelo',
  'cabelo + barba': 'Cabelo + Barba',
  'barba': 'Barba',
  'sobrancelha': 'Sobrancelha'
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
  showGoogleCalendarButton = true,
}: TimeSlotSelectionProps) => {

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  useEffect(() => {
    if (selectedDate) fetchBookings(selectedDate);
  }, [selectedDate]);

  const fetchBookings = async (date: Date) => {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
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

    const bookingData = {
      nome: userName,
      telefone: userPhone,
      servico: selectedService,
      data: selectedDate.toISOString().split("T")[0],
      horario: selectedTime
    };

    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });

      const response = await res.json();

      if (!res.ok) {
        alert(response.error || "Erro ao salvar agendamento");
        setLoading(false);
        return;
      }

      fetchBookings(selectedDate);
      setShowConfirmation(true);
      setLoading(false);

    } catch (err) {
      alert("Erro ao salvar");
      setLoading(false);
    }
  };

  // --------------------------------------------
  // BLOQUEIO DE HORÁRIOS — LÓGICA PRINCIPAL
  // --------------------------------------------
  const duracao = serviceDurations[selectedService] ?? 60;
  const slotsUsados = duracao === 60 ? 2 : 1;

  const getNextSlot = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const newMin = h * 60 + m + 30;
    const hh = String(Math.floor(newMin / 60)).padStart(2, "0");
    const mm = String(newMin % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  };

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
          Serviço: <span className="font-medium">{serviceNames[selectedService]}</span>
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
              ? `Horários para ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}`
              : "Selecione uma data"}
          </h3>

          {selectedDate ? (
            <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-2">
              {timeSlots.map((slot, index) => {
                const disabled = isSlotBlocked(slot.time, index);

                return (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    size="sm"
                    disabled={disabled || loading}
                    onClick={() => onTimeSelect(slot.time)}
                    className={`${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
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
            <p><strong>Cliente:</strong> {userName}</p>
            <p><strong>Telefone:</strong> {userPhone}</p>
            <p><strong>Serviço:</strong> {serviceNames[selectedService]}</p>
            <p><strong>Data:</strong> {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
            <p><strong>Horário:</strong> {selectedTime}</p>
          </div>

          <Button
            onClick={handleConfirmBooking}
            className="w-full mt-4 bg-black text-white hover:bg-gray-800"
          >
            Confirmar Agendamento
          </Button>

          {showGoogleCalendarButton && (
            <Button
              onClick={() => {}}
              className="w-full mt-2 bg-black text-white hover:bg-gray-800"
            >
              Adicionar ao Google Calendário
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default TimeSlotSelection;
