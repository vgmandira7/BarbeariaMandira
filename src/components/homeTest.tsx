import { useState } from 'react';
import Header from '@/components/Header';
import ServiceSelection from '@/components/ServiceSelection';
import TimeSlotSelection from '@/components/TimeSlotSelection';
import AdminPanel from '@/components/AdminPanel';
import { Scissors } from 'lucide-react';


type Step = 'welcome' | 'service' | 'booking' | 'admin';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleUserLogin = (name: string) => {
    setCurrentUser(name);
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
    // Here you would save the appointment to the database
    // For now, we'll just reset to service selection
    setTimeout(() => {
      setCurrentStep('service');
      setSelectedService(null);
      setSelectedDate(null);
      setSelectedTime(null);
    }, 2000);
  };

  const renderContent = () => {
    if (isAdmin) {
      return <AdminPanel />;
    }

    switch (currentStep) {
      case 'welcome':
        return (
          <div className="min-h-[80vh] flex items-center justify-center">
            <div className="text-center max-w-2xl mx-auto px-4">
              <div className="mb-8">
                {/* Logo da barbearia */}
                <Scissors className="h-20 w-20 text-barber-primary mx-auto mb-6" />
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
                        Digite seu nome para começar o agendamento
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
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        currentUser={currentUser}
        isAdmin={isAdmin}
        onUserLogin={handleUserLogin}
        onAdminLogin={handleAdminLogin}
        onLogout={handleLogout}
      />
      
      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;