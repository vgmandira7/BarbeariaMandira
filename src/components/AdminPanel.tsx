import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import NewAppointmentForm from './NewAppointmentForm';

interface Appointment {
  id: string;
  clientName: string;
  service: string;
  time: string;
  date: string;
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    clientName: 'João Silva',
    service: 'Cabelo + Barba',
    time: '09:00',
    date: '2024-01-20'
  },
  {
    id: '2',
    clientName: 'Pedro Santos',
    service: 'Cabelo',
    time: '10:30',
    date: '2024-01-20'
  },
  {
    id: '3',
    clientName: 'Carlos Lima',
    service: 'Barba',
    time: '14:00',
    date: '2024-01-20'
  }
];

const serviceNames: Record<string, string> = {
  'hair': 'Cabelo',
  'hair-beard': 'Cabelo + Barba',
  'beard': 'Barba',
  'eyebrow': 'Sobrancelha'
};

const AdminPanel = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayAppointments = appointments.filter(apt => apt.date === selectedDateStr);

  const handleNewAppointment = (appointment: Omit<Appointment, 'id'>) => {
    const newAppointment = {
      ...appointment,
      id: Date.now().toString()
    };
    setAppointments([...appointments, newAppointment]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Painel do Barbeiro</h1>
          <p className="text-muted-foreground">Gerencie seus agendamentos</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <NewAppointmentForm onSubmit={handleNewAppointment} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Selecionar Data
          </h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md"
          />
        </Card>

        {/* Daily Schedule */}
        <Card className="lg:col-span-2 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Agendamentos - {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </h3>
            <Badge variant="secondary">
              {dayAppointments.length} agendamento(s)
            </Badge>
          </div>

          {dayAppointments.length > 0 ? (
            <div className="space-y-3">
              {dayAppointments
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((appointment) => (
                <Card key={appointment.id} className="p-3 bg-accent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{appointment.time}</span>
                      </div>
                      <div>
                        <p className="font-medium">{appointment.clientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {serviceNames[appointment.service] || appointment.service}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {serviceNames[appointment.service] || appointment.service}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Nenhum agendamento para esta data
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hoje</p>
              <p className="text-xl font-bold">
                {appointments.filter(apt => apt.date === format(new Date(), 'yyyy-MM-dd')).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-success/10 p-2 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Esta Semana</p>
              <p className="text-xl font-bold">{appointments.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-accent p-2 rounded-lg">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Próximo</p>
              <p className="text-sm font-medium">
                {dayAppointments.length > 0 
                  ? `${dayAppointments[0].time} - ${dayAppointments[0].clientName}`
                  : 'Nenhum agendamento'
                }
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;