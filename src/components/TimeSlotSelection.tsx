import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
// ❌ Socket.IO removido, pois não é mais usado

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

// ✅ AJUSTE FINAL: Usamos VITE_API_BASE (o domínio público) e adicionamos /api nas chamadas.
// O fallback para desenvolvimento é 'http://localhost:8081' (porta comum para Node/Express).
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
  'sobrancelha': 'Sobrancelha',
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

  // Carrega os agendamentos sempre que a data selecionada muda
  useEffect(() => {
    if (selectedDate) {
      fetchBookings(selectedDate);
    }
  }, [selectedDate]); // Depende apenas da data selecionada

  const fetchBookings = async (date: Date) => {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      // ✅ Requisição GET: Usando apiBaseUrl + /api/bookings/...
      const res = await fetch(`${apiBaseUrl}/data/${formattedDate}`);
      if (!res.ok) {
        throw new Error("Failed to fetch bookings");
      }
      const dayBookings = await res.json();
      setBookedTimes(dayBookings.map((b: any) => b.horario));
    } catch (err) {
      // Este erro ocorrerá se o backend não estiver acessível, mas o frontend não travará
      console.error("Erro ao buscar agendamentos", err);
      // Opcional: alertar o usuário ou setar bookedTimes como vazio.
      // setBookedTimes([]); 
    }
  };

  const handleDateSelect = async (date: Date) => {
    onDateSelect(date);
    // Não é necessário chamar fetchBookings aqui, o useEffect fará isso
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
      // ✅ Requisição POST: Usando apiBaseUrl + /api/bookings
      const res = await fetch(`${apiBaseUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Erro ao salvar agendamento");
        setLoading(false);
        return;
      }

      // Após salvar, atualiza a lista de horários agendados (força um re-fetch)
      await fetchBookings(selectedDate);
      
      setShowConfirmation(true);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao salvar agendamento", err);
      alert("Erro ao salvar agendamento");
      setLoading(false);
    }
  };

  const handleAddToGoogleCalendar = () => {
    if (!selectedDate || !selectedTime || !selectedService) return;

    const [hour, minute] = selectedTime.split(":").map(Number);
    const eventStart = new Date(selectedDate);
    eventStart.setHours(hour, minute, 0);
    const eventEnd = new Date(eventStart);
    eventEnd.setHours(eventStart.getHours() + 1);

    const formatDate = (date: Date) =>
      date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const startStr = formatDate(eventStart);
    const endStr = formatDate(eventEnd);

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      `Agendamento: ${serviceNames[selectedService]}`
    )}&dates=${startStr}/${endStr}&details=${encodeURIComponent(
      `Cliente: ${userName}\nTelefone: ${userPhone}`
    )}&location=${encodeURIComponent("Barbearia Mandira")}`;

    window.open(googleCalendarUrl, "_blank");
  };

  // ❌ Lógica do Socket.IO removida
  // useEffect(() => { ... }, [selectedDate]);

  if (showConfirmation) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Agendamento Confirmado!</h2>
        <p className="text-muted-foreground">Seu horário foi reservado com sucesso.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Escolha Data e Horário</h2>
        <p className="text-muted-foreground">
          Serviço: <span className="font-medium">{serviceNames[selectedService]}</span>
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
        locale={ptBR} // ✅ Adiciona a localização PT-BR
        disabled={(date) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const maxDate = new Date(today);
          maxDate.setDate(today.getDate() + 7); // ✅ Limite de 7 dias

          return date < today || date > maxDate || date.getDay() === 0;
        }}
        className="rounded-md"
      />

        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">
            {selectedDate
              ? `Horários para ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}`
              : 'Selecione uma data primeiro'}
          </h3>
          {selectedDate ? (
            <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-2">
              {timeSlots.map((slot) => {
                const isBooked = bookedTimes.includes(slot.time);
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
                return (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? 'default' : 'outline'}
                    size="sm"
                    disabled={isBooked || isPast || loading}
                    onClick={() => onTimeSelect(slot.time)}
                    className={`${(isBooked || isPast) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {slot.time}
                  </Button>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Selecione uma data para ver os horários disponíveis
            </p>
          )}
        </Card>
      </div>

      {selectedDate && selectedTime && (
        <Card className="max-w-md mx-auto p-4 bg-accent">
          <h3 className="font-semibold mb-3">Resumo do Agendamento</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Cliente:</span> {userName}</p>
            <p><span className="font-medium">Telefone:</span> {userPhone}</p>
            <p><span className="font-medium">Serviço:</span> {serviceNames[selectedService]}</p>
            <p><span className="font-medium">Data:</span> {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
            <p><span className="font-medium">Horário:</span> {selectedTime}</p>
          </div>

          <Button
            onClick={handleConfirmBooking}
            className="w-full mt-4 bg-black text-white hover:bg-gray-800"
          >
            Confirmar Agendamento
          </Button>

          {showGoogleCalendarButton && (
            <Button
              onClick={handleAddToGoogleCalendar}
              className="w-full mt-2 bg-black text-white hover:bg-gray-800"
            >
              Adicionar ao Google Calendario
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default TimeSlotSelection;
