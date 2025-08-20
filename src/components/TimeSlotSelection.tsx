import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
}

const timeSlots: TimeSlot[] = [
  { time: '07:00', available: true },
  
  { time: '08:00', available: false },
  
  { time: '09:00', available: true },
  
  { time: '10:00', available: true },
  
  { time: '11:00', available: true },

  { time: '13:00', available: true },
  
  { time: '14:00', available: false },
  
  { time: '15:00', available: true },

  { time: '16:00', available: true },

  { time: '17:00', available: true },

  { time: '18:00', available: true },

  { time: '19:00', available: true },

  { time: '20:00', available: false },
  
];

const serviceNames: Record<string, string> = {
  'hair': 'Cabelo',
  'hair-beard': 'Cabelo + Barba',
  'beard': 'Barba',
  'eyebrow': 'Sobrancelha'
};

const TimeSlotSelection = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  onConfirm,
  selectedService,
  userName
}: TimeSlotSelectionProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleConfirm = () => {
    setShowConfirmation(true);
    setTimeout(() => {
      onConfirm();
      setShowConfirmation(false);
    }, 2000);
  };

  if (showConfirmation) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Agendamento Confirmado!</h2>
        <p className="text-muted-foreground">
          Seu horário foi reservado com sucesso.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Escolha Data e Horário</h2>
        <p className="text-muted-foreground">
          Serviço: <span className="font-medium">{serviceNames[selectedService]}</span>
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Calendar */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Selecione uma Data
          </h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateSelect(date)}
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0); // ignora horas
              return date < today || date.getDay() === 0;
            }}
            className="rounded-md"
          />
        </Card>

        {/* Time Slots */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">
            {selectedDate
              ? `Horários para ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}`
              : 'Selecione uma data primeiro'
            }
          </h3>

          {selectedDate ? (
            <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? 'default' : 'outline'}
                  size="sm"
                  disabled={!slot.available}
                  onClick={() => onTimeSelect(slot.time)}
                  className={`${!slot.available
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                    }`}
                >
                  {slot.time}
                </Button>
              ))}
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
            <p><span className="font-medium">Serviço:</span> {serviceNames[selectedService]}</p>
            <p><span className="font-medium">Data:</span> {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
            <p><span className="font-medium">Horário:</span> {selectedTime}</p>
          </div>
          <Button onClick={handleConfirm} className="w-full mt-4">
            Confirmar Agendamento
          </Button>
        </Card>
      )}
    </div>
  );
};

export default TimeSlotSelection;