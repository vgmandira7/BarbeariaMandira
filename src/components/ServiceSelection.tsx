import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Scissors, Crown } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  premium?: boolean;
}

interface ServiceSelectionProps {
  selectedService: string | null;
  onServiceSelect: (serviceId: string) => void;
  onNext: () => void;
}

const services: Service[] = [
  {
    id: 'hair',
    name: 'Cabelo',
    description: 'Corte de cabelo personalizado',
    price: 'R$ 25',
    duration: '30 min'
  },
  {
    id: 'hair-beard',
    name: 'Cabelo + Barba',
    description: 'Corte de cabelo + barba',
    price: 'R$ 35',
    duration: '45 min'
  },
  {
    id: 'beard',
    name: 'Barba',
    description: 'Corte e aparamento de barba',
    price: 'R$ 15',
    duration: '20 min'
  },
  {
    id: 'eyebrow',
    name: 'Sobrancelha',
    description: 'Aparamento de sobrancelha',
    price: 'R$ 10',
    duration: '15 min',
    premium: true
  }
];

const ServiceSelection = ({ selectedService, onServiceSelect, onNext }: ServiceSelectionProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Escolha o Serviço</h2>
        <p className="text-muted-foreground">Selecione o tipo de serviço desejado</p>
      </div>

      <div className="grid gap-4 max-w-2xl mx-auto">
        {services.map((service) => (
          <Card
            key={service.id}
            className={`p-4 cursor-pointer transition-all border-2 ${
              selectedService === service.id
                ? 'border-primary bg-accent'
                : 'border-border hover:border-muted-foreground'
            }`}
            onClick={() => onServiceSelect(service.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Scissors className="h-5 w-5 text-barber-primary" />
                  {service.premium && (
                    <Crown className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground flex items-center space-x-2">
                    <span>{service.name}</span>
                    {service.premium && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Premium
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm font-medium text-foreground">{service.price}</span>
                    <span className="text-sm text-muted-foreground">{service.duration}</span>
                  </div>
                </div>
              </div>
              
              {selectedService === service.id && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </div>
          </Card>
        ))}
      </div>

      {selectedService && (
        <div className="text-center">
          <Button onClick={onNext} size="lg">
            Continuar para Agendamento
          </Button>
        </div>
      )}
    </div>
  );
};

export default ServiceSelection;