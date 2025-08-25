import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import NovoAgendamento from './newSchedule';

interface Appointment {
  id: string;
  nome: string;
  telefone: string;
  servico: string;
  horario: string;
  data: string;
}

const serviceNames: Record<string, string> = {
  'cabelo': 'Cabelo',
  'cabelo + barba': 'Cabelo + Barba',
  'barba': 'Barba',
  'sobrancelha': 'Sobrancelha',
};

const AdminPanel = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayAppointments = appointments.filter(apt => apt.data === selectedDateStr);

  // Pegar agendamentos do backend
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/bookings");
        const data = await res.json();
        setAppointments(data);
      } catch (err) {
        console.error("Erro ao buscar agendamentos", err);
      }
    };
    fetchAppointments();
  }, []);

  // Atualizar lista após novo agendamento
  const refreshAppointments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/bookings");
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error("Erro ao atualizar agendamentos", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Cabeçalho e Botão Novo Agendamento */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Painel do Barbeiro</h1>
          <p className="text-muted-foreground">Gerencie seus agendamentos</p>
        </div>

        <NovoAgendamento onAgendamentoCriado={refreshAppointments} />
      </div>

      {/* Calendário e Agendamentos do Dia */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 shadow-md">
          <h3 className="font-semibold mb-4 flex items-center text-lg">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Selecionar Data
          </h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md"
          />
        </Card>

        <Card className="lg:col-span-2 p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center text-lg">
              <Users className="h-5 w-5 mr-2" />
              Agendamentos - {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </h3>
            <Badge variant="secondary">{dayAppointments.length} agendamento(s)</Badge>
          </div>

          {dayAppointments.length > 0 ? (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
              {dayAppointments
                .sort((a, b) => a.horario.localeCompare(b.horario))
                .map((apt) => (
                  <Card key={apt.id} className="p-4 bg-accent shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{apt.horario}</span>
                        </div>
                        <div>
                          <p className="font-medium">{apt.nome}</p>
                          <p className="text-sm text-muted-foreground">{apt.telefone}</p>
                          <p className="text-sm text-muted-foreground">
                            {serviceNames[apt.servico] || apt.servico}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{serviceNames[apt.servico] || apt.servico}</Badge>
                    </div>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum agendamento para esta data</p>
            </div>
          )}
        </Card>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hoje</p>
              <p className="text-xl font-bold">
                {appointments.filter(apt => apt.data === format(new Date(), 'yyyy-MM-dd')).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-md">
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

        <Card className="p-6 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="bg-accent p-2 rounded-lg">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Próximo</p>
              <p className="text-sm font-medium">
                {dayAppointments.length > 0
                  ? `${dayAppointments[0].horario} - ${dayAppointments[0].nome}`
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
