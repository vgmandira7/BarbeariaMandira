import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import TimeSlotSelection from "./TimeSlotSelection";

interface NovoAgendamentoProps {
  onAgendamentoCriado?: () => void | Promise<void>;
}

const NovoAgendamento = ({ onAgendamentoCriado }: NovoAgendamentoProps) => {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [servico, setServico] = useState("cabelo");
  const [data, setData] = useState<Date | null>(null);
  const [horario, setHorario] = useState<string | null>(null);

  const resetar = () => {
    setNome("");
    setTelefone("");
    setServico("cabelo");
    setData(null);
    setHorario(null);
  };

  // Chamado depois que o TimeSlotSelection salvar com sucesso (onConfirm)
  const handleConfirmou = async () => {
    setOpen(false);
    resetar();
    try {
      await onAgendamentoCriado?.();
    } catch {
      // se der erro no refresh, só ignora para não travar o fluxo do barbeiro
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-1 space-y-4">
            <div>
              <Label htmlFor="nome">Nome do Cliente</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: João Silva"
              />
            </div>
            <div>
              <Label htmlFor="tel">Telefone</Label>
              <Input
                id="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(xx) xxxxx-xxxx"
              />
            </div>
            <div>
              <Label>Serviço</Label>
              <Select value={servico} onValueChange={setServico}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cabelo">Cabelo</SelectItem>
                  <SelectItem value="cabelo + barba">Cabelo + Barba</SelectItem>
                  <SelectItem value="barba">Barba</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Dica: preencha nome/telefone/serviço antes de escolher data e horário.
            </p>
          </div>

          <div className="md:col-span-2">
            <TimeSlotSelection
              selectedDate={data}
              selectedTime={horario}
              onDateSelect={setData}
              onTimeSelect={setHorario}
              onConfirm={handleConfirmou}
              selectedService={servico}
              userName={nome}
              userPhone={telefone}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NovoAgendamento;
