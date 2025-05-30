"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";

import { Button } from "@/_components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/_components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_components/ui/select";
import { Input } from "@/_components/ui/input";
import { doctorsTable, patientsTable } from "@/db/schema";
import { Calendar } from "@/_components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/_components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { upsertAppointment } from "@/app/actions/upsert-appointment";
import { upsertAppointmentSchema } from "@/app/actions/upsert-appointment/schema";
import { useQuery } from "@tanstack/react-query";
import { getAvailableTimes } from "@/app/actions/get-available-times";
import dayjs from "dayjs";
import { datetime } from "drizzle-orm/mysql-core";

type AppointmentFormSchema = z.infer<typeof upsertAppointmentSchema>;

interface UpsertAppointmentFormProps {
  doctors: (typeof doctorsTable.$inferSelect)[];
  patients: (typeof patientsTable.$inferSelect)[];
  onSuccess?: () => void;
}

export function UpsertAppointmentForm({
  doctors,
  patients,
  onSuccess,
}: UpsertAppointmentFormProps) {
  const router = useRouter();
  const form = useForm<AppointmentFormSchema>({
    resolver: zodResolver(upsertAppointmentSchema),
    defaultValues: {
      appointmentPriceInCents: 0,
    },
  });

  const selectedDoctorId = form.watch("doctorId");
  const selectedPatientId = form.watch("patientId");
  const selectedDate = form.watch("date");

  const { data: availableTimes } = useQuery({
    queryKey: ["available-times", selectedDate, selectedDoctorId],
    queryFn: async () => {
      const result = await getAvailableTimes({
        date: dayjs(selectedDate).format("YYYY-MM-DD"),
        doctorId: selectedDoctorId,
      });
      return result;
    },
    enabled: !!selectedDate && !!selectedDoctorId,
  });

  const { execute, status } = useAction(upsertAppointment, {
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso!");
      onSuccess?.();
      router.refresh();
    },
    onError: () => {
      toast.error("Erro ao criar agendamento");
    },
  });

  const selectedDoctor = form.watch("doctorId")
    ? doctors.find((doctor) => doctor.id === form.watch("doctorId"))
    : null;

  const isPatientAndDoctorSelected = selectedDoctorId && selectedPatientId;

  async function onSubmit(data: AppointmentFormSchema) {
    execute(data);
  }

  const isDateAvailable = (date: Date) => {
    if (!selectedDoctorId) return false;

    const selectedDoctor = doctors.find(
      (doctor) => doctor.id === selectedDoctorId,
    );

    if (!selectedDoctor) return;

    const dayOfWeek = date.getDay();
    return (
      dayOfWeek >= selectedDoctor.availableFromWeekday &&
      dayOfWeek <= selectedDoctor.availableToWeekday
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paciente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um paciente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="doctorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Médico</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  const doctor = doctors.find((d) => d.id === value);
                  if (doctor) {
                    form.setValue(
                      "appointmentPriceInCents",
                      doctor.appointmentPriceInCents,
                    );
                  }
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um médico" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="appointmentPriceInCents"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor da consulta</FormLabel>
              <FormControl>
                <NumericFormat
                  customInput={Input}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  disabled={!selectedDoctor}
                  value={field.value / 100}
                  onValueChange={(values) => {
                    field.onChange(
                      values.floatValue ? values.floatValue * 100 : 0,
                    );
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                      disabled={!isPatientAndDoctorSelected}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date() || !isDateAvailable(date)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!selectedDate || !availableTimes?.data}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um horário" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Array.isArray(availableTimes?.data?.data)
                    ? availableTimes.data.data.map((time) => (
                        <SelectItem
                          key={time.value}
                          value={time.value}
                          disabled={!time.available}
                        >
                          <div className="flex w-full items-center justify-between">
                            <span>
                              {time.value.split(":").slice(0, 2).join(":")}
                            </span>
                            {!time.available && (
                              <span className="text-muted-foreground ml-2 flex items-center gap-1 text-xs">
                                <X className="h-3 w-3 text-red-500" />
                                Horário indisponível
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    : null}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={status === "executing"}
        >
          {status === "executing" ? "Criando..." : "Criar agendamento"}
        </Button>
      </form>
    </Form>
  );
}
