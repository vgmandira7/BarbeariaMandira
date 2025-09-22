import { useState } from 'react';
import ServiceSelection from '@/components/ServiceSelection';
import TimeSlotSelection from '@/components/TimeSlotSelection';
import AdminPanel from '@/components/AdminPanel';
import { Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

type Step = 'welcome' | 'service' | 'booking' | 'admin';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhoneInput, setUserPhoneInput] = useState('');

  const handleUserLogin = (name: string, phone: string) => {
    setCurrentUser(name);
    setUserPhone(phone);
    setIsAdmin(false);
    setCurrentStep('service');
  };

  const handleAdminLogin = () => {
    setCurrentUser('Admin');
    setIsAdmin(true);
    setCurrentStep('admin');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserPhone(null);
    setIsAdmin(false);
    setCurrentStep('welcome');
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  const handleServiceNext = () => {
    setCurrentStep('booking');
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleBookingConfirm = () => {
  if (!selectedDate || !selectedTime || !selectedService) return;

  // Criar objeto Date com data + hora escolhida
  const [hour, minute] = selectedTime.split(":").map(Number);
  const eventStart = new Date(selectedDate);
  eventStart.setHours(hour, minute, 0);

  const eventEnd = new Date(eventStart);
  eventEnd.setHours(eventStart.getHours() + 1); // duração de 1h

  // Converter para formato YYYYMMDDTHHmmssZ (UTC)
  const formatDate = (date: Date) =>
    date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const startStr = formatDate(eventStart);
  const endStr = formatDate(eventEnd);

  // Montar link do Google Calendar
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `Agendamento: ${selectedService}`
  )}&dates=${startStr}/${endStr}&details=${encodeURIComponent(
    `Cliente: ${currentUser}\nTelefone: ${userPhone}`
  )}&location=${encodeURIComponent("Barbearia Mandira")}`;

  // Salvar no estado (pra mostrar o botão depois)
  setTimeout(() => {
    setCurrentStep("service");
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
  }, 2000);

  window.open(googleCalendarUrl, "_blank"); // Abre direto no Google Calendar
};


  const handleUserLoginSubmit = () => {
    if (userName.trim() && userPhoneInput.trim()) {
      handleUserLogin(userName.trim(), userPhoneInput.trim());
      setUserName('');
      setShowUserLogin(false);
    }
  };

  const renderContent = () => {
    if (isAdmin) return <AdminPanel />;

    switch (currentStep) {
      case 'welcome':
        return (
          <div className="min-h-[80vh] flex items-center justify-center mt-12">
            <div className="text-center max-w-2xl mx-auto px-4">
              <div className="mb-8">
                <img
                  src="/logoBarbearia.jpeg"
                  alt="Logo Barbearia Mandira"
                  className="h-28 mx-auto mb-6 object-contain"
                />

                <h1 className="text-5xl font-bold text-barber-primary mb-4">
                  BARBEARIA MANDIRA
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Agende seu horário de forma rápida e prática
                </p>
              </div>

              <div className="space-y-4 text-left bg-card p-8 rounded-lg border">
                <h2 className="text-2xl font-semibold mb-6 text-center">Como Funciona</h2>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-medium">Identifique-se</h3>
                      <p className="text-sm text-muted-foreground">
                        Digite seu nome e telefone para começar o agendamento
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-medium">Escolha o Serviço</h3>
                      <p className="text-sm text-muted-foreground">
                        Selecione entre cabelo, barba, cabelo+barba ou sobrancelha
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-medium">Marque seu Horário</h3>
                      <p className="text-sm text-muted-foreground">
                        Escolha o dia e horário que melhor se adequa à sua agenda
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 text-center">
                  <Dialog open={showUserLogin} onOpenChange={setShowUserLogin}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-barber-primary text-white hover:bg-barber-primary/90">
                        Realizar Agendamento
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-center">Identificação</h2>
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Digite seu nome completo"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background"
                            onKeyDown={(e) => e.key === 'Enter' && handleUserLoginSubmit()}
                          />
                          <input
                            type="tel"
                            placeholder="Digite seu telefone"
                            value={userPhoneInput}
                            onChange={(e) => setUserPhoneInput(e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background"
                            onKeyDown={(e) => e.key === 'Enter' && handleUserLoginSubmit()}
                          />
                          <Button onClick={handleUserLoginSubmit} className="w-full">
                            Continuar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        );

      case 'service':
        return (
          <div className="container mx-auto px-4 py-8">
            <ServiceSelection
              selectedService={selectedService}
              onServiceSelect={handleServiceSelect}
              onNext={handleServiceNext}
            />
          </div>
        );

      case 'booking':
        return (
          <div className="container mx-auto px-4 py-8">
            <TimeSlotSelection
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateSelect={handleDateSelect}
              onTimeSelect={handleTimeSelect}
              onConfirm={handleBookingConfirm}
              selectedService={selectedService!}
              userName={currentUser!}
              userPhone={userPhone!}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">{renderContent()}</main>

      <footer className="text-center text-sm text-muted-foreground py-6">
        Preço sob consulta via WhatsApp.  <br />
        <span className="block"> Seg - Sáb: 7h às 20h | Dom: Fechado</span>
      </footer>
    </div>
  );
};

export default Index;
