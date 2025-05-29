"use client";
import { Avatar, AvatarFallback } from "@/_components/ui/avatar";
import { Badge } from "@/_components/ui/badge";
import { Button } from "@/_components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/_components/ui/card";
import { Dialog, DialogTrigger } from "@/_components/ui/dialog";
import { Separator } from "@/_components/ui/separator";
import { doctorsTable } from "@/db/schema";
import { CalendarIcon, ClockIcon, DollarSignIcon } from "lucide-react";
import React, { useState } from "react";
import UpsertDoctorForm from "./upsert-doctor-form";
import { getAvailability } from "../_helpers/availability";
import { formatCurrencyInCents } from "@/helpers/currency";

interface DoctorCardProps {
  doctor: typeof doctorsTable.$inferSelect;
}

const DoctorCard = ({ doctor }: DoctorCardProps) => {
  const [isUpsertDoctorDialogOpen, setIsUpsertDoctorDialogOpen] =
    useState(false);
  const doctorInitials = doctor.name
    .split(" ")
    .map((name) => name[0])
    .join("");

  const availability = getAvailability(doctor);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{doctorInitials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium">{doctor.name}</h3>
            <p className="text-muted-foreground text-sm">{doctor.speciality}</p>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-2">
        <Badge variant="outline">
          <CalendarIcon className="mr-1" />
          {availability.from.format("dddd")} à {availability.to.format("dddd")}
        </Badge>
        <Badge variant="outline">
          <ClockIcon className="mr-1" />
          {availability.from.format("HH:mm")} à{" "}
          {availability.to.format("HH:mm")}
        </Badge>
        <Badge variant="outline">
          {formatCurrencyInCents(doctor.appointmentPriceInCents / 100)}
        </Badge>
      </CardContent>
      <Separator />
      <CardFooter>
        <Dialog
          open={isUpsertDoctorDialogOpen}
          onOpenChange={setIsUpsertDoctorDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="w-full">Ver detalhes</Button>
          </DialogTrigger>
          <UpsertDoctorForm
            doctor={{
              ...doctor,
              availableFromTime: availability.from.format("HH:mm:ss"),
              availableToTime: availability.to.format("HH:mm:ss"),
            }}
            onSuccess={() => setIsUpsertDoctorDialogOpen(false)}
          />
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default DoctorCard;
