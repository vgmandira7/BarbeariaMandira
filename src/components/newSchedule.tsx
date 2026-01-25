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



// Usando VITE_API_BASE

const apiBaseUrl = import.meta.env.VITE_API_BASE || 'http://localhost:8081';



const NovoAgendamento = () => {

  const [open, setOpen] = useState(false);

  const [nome, setNome] = useState("");

  const [telefone, setTelefone] = useState("");

  const [servico, setServico] = useState("cabelo");

  const [duracao, setDuracao] = useState("60"); // NOVO

  const [data, setData] = useState<Date | null>(null);

  const [horario, setHorario] = useState<string | null>(null);



  const resetar = () => {

    setNome("");

    setTelefone("");

    setServico("cabelo");

    setDuracao("60");

    setData(null);

    setHorario(null);

  };



  const handleConfirmBooking = async () => {

    if (!nome || !telefone || !servico || !data || !horario) return;



    const bookingData = {

      nome,

      telefone,

      servico,

      duracao: Number(duracao), // NOVO

      data: data.toISOString().split("T")[0],

      horario,

    };



    try {

      const res = await fetch(${apiBaseUrl}/api/bookings, {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(bookingData),

      });



      if (!res.ok) {

        const error = await res.json();

        alert(error.error || "Erro ao criar agendamento");

        return;

      }



      resetar();

      setOpen(false);



    } catch (err) {

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

          

          {/* FORM */}

          <div className="w-full md:flex-1 md:max-w-[280px] mx-auto md:mx-0 space-y-4">



            <div>

              <Label htmlFor="nome">Nome do Cliente</Label>

              <Input value={nome} onChange={(e) => setNome(e.target.value)} />

            </div>



            <div>

              <Label>Telefone</Label>

              <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} />

            </div>



            <div>

              <Label>Serviço</Label>

              <Select value={servico} onValueChange={setServico}>

                <SelectTrigger>

                  <SelectValue placeholder="Escolha um serviço" />

                </SelectTrigger>

                <SelectContent>

                  <SelectItem value="cabelo">Cabelo</SelectItem>

                  <SelectItem value="cabelo + barba">Cabelo + Barba</SelectItem>

                  <SelectItem value="barba">Barba</SelectItem>

                  

                </SelectContent>

              </Select>

            </div>



            {/* NOVA DURAÇÃO DO SERVIÇO */}

            <div>

              <Label>Duração</Label>

              <Select value={duracao} onValueChange={setDuracao}>

                <SelectTrigger>

                  <SelectValue placeholder="Selecione" />

                </SelectTrigger>

                <SelectContent>

                  <SelectItem value="30">30 minutos</SelectItem>

                  <SelectItem value="60">60 minutos</SelectItem>

                </SelectContent>

              </Select>

            </div>



          </div>



          {/* HORÁRIOS */}

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

            manualDuration={Number(duracao)}   // 👈 ISSO AQUI É O SEGREDO

            showGoogleCalendarButton={false}

          />



          </div>



        </div>

      </DialogContent>

    </Dialog>

  );

};



export default NovoAgendamento;
