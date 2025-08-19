import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface NewAppointmentFormProps {
  onSubmit: (appointment: {
    clientName: string;
    service: string;
    time: string;
    date: string;
  }) => void;
}

const services = [
  { id: 'hair', name: 'Cabelo' },
  { id: 'hair-beard', name: 'Cabelo + Barba' },
  { id: 'beard', name: 'Barba' },
  { id: 'eyebrow', name: 'Sobrancelha' }
];

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

const NewAppointmentForm = ({ onSubmit }: NewAppointmentFormProps) => {
  const [clientName, setClientName] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');

  const handleSubmit = () => {
    if (clientName && selectedService && selectedDate && selectedTime) {
      onSubmit({
        clientName,
        service: selectedService,
        time: selectedTime,
        date: format(selectedDate, 'yyyy-MM-dd')
      });
      // Reset form
      setClientName('');
      setSelectedService('');
      setSelectedDate(null);
      setSelectedTime('');
    }
  };

  const isFormValid = clientName && selectedService && selectedDate && selectedTime;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">Novo Agendamento</h2>
      
      {/* Client Name */}
      <div className="space-y-2">
        <Label htmlFor="clientName">Nome do Cliente</Label>
        <input
          id="clientName"
          type="text"
          placeholder="Digite o nome completo"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-md bg-background"
        />
      </div>

      {/* Service Selection */}
      <div className="space-y-2">
        <Label>Serviço</Label>
        <RadioGroup value={selectedService} onValueChange={setSelectedService}>
          <div className="grid grid-cols-2 gap-2">
            {services.map((service) => (
              <div key={service.id} className="flex items-center space-x-2">
                <RadioGroupItem value={service.id} id={service.id} />
                <Label htmlFor={service.id} className="text-sm">
                  {service.name}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Date Selection */}
      <div className="space-y-2">
        <Label>Data</Label>
        <Card className="p-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date() || date.getDay() === 0}
            className="rounded-md"
          />
        </Card>
      </div>

      {/* Time Selection */}
      <div className="space-y-2">
        <Label>Horário</Label>
        <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
          {timeSlots.map((time) => (
            <Button
              key={time}
              variant={selectedTime === time ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTime(time)}
            >
              {time}
            </Button>
          ))}
        </div>
      </div>

      <Button 
        onClick={handleSubmit} 
        className="w-full" 
        disabled={!isFormValid}
      >
        Confirmar Agendamento
      </Button>
    </div>
  );
};

export default NewAppointmentForm;