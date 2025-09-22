import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import TimeSlotSelection from "./TimeSlotSelection";

// 🚨 CORREÇÃO: Variável de ambiente para a URL da API
const apiUrl = import.meta.env.VITE_API_URL;

const NovoAgendamento = () => {
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

  const handleConfirmBooking = async () => {
    if (!nome || !telefone || !servico || !data || !horario) return;

    const bookingData = {
      nome,
      telefone,
      servico,
      data: data.toISOString().split("T")[0],
      horario,
    };

    try {
      // 🚨 CORREÇÃO: Usando a variável de ambiente para a URL
      const res = await fetch(`${apiUrl}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Erro ao criar agendamento");
        return;
      }

      await res.json(); // backend já emite pelo socket

      // resetar formulário e fechar modal
      resetar();
      setOpen(false);
    } catch (err) {
      console.error("Erro ao criar agendamento", err);
      alert("Erro ao criar agendamento");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Novo Agendamento
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 md:flex-row md:gap-4">
          <div className="w-full md:flex-1 md:max-w-[280px] mx-auto md:mx-0 space-y-4">
            <div>
              <Label htmlFor="nome" className="text-sm">
                Nome do Cliente
              </Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: João Silva"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="tel" className="text-sm">
                Telefone
              </Label>
              <Input
                id="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(xx) xxxxx-xxxx"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-sm">Serviço</Label>
              <Select value={servico} onValueChange={setServico}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="cabelo">Cabelo</SelectItem>
                    <SelectItem value="cabelo + barba">Cabelo + Barba</SelectItem>
                    <SelectItem value="barba">Barba</SelectItem>
                    <SelectItem value="sobrancelha">Sobrancelha</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Dica: preencha nome/telefone/serviço antes de escolher data e horário.
            </p>
          </div>

          <div className="w-full md:flex-1">
            <TimeSlotSelection
              selectedDate={data}
              selectedTime={horario}
              onDateSelect={setData}
              onTimeSelect={setHorario}
              onConfirm={handleConfirmBooking}
              selectedService={servico}
              userName={nome}
              userPhone={telefone}
              showGoogleCalendarButton={false}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NovoAgendamento;