import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/_components/ui/dialog";
import ClinicForm from "./components/form";

const ClinicFormPage = () => {
  return (
    <div>
      <Dialog open>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Clinica </DialogTitle>
            <DialogDescription>
              Adicione uma clínica para continuar
            </DialogDescription>
          </DialogHeader>
          <ClinicForm />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicFormPage;
