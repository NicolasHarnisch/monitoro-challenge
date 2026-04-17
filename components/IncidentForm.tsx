'use client';

/** Formulário reutilizável para criar e editar ordens de serviço */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

import { GET_LAST_INCIDENTS, CREATE_INCIDENT, UPDATE_INCIDENT } from '@/lib/graphql-queries';

const incidentSchema = z.object({
  machineName:      z.string().min(1, 'Preencha este campo.'),
  reason:           z.string().min(1, 'Preencha este campo.'),
  typeOfOccurrence: z.string().min(1, 'Preencha este campo.'),
  isMachineStopped: z.boolean(),
  description:      z.string().min(1, 'Preencha este campo.'),
  severity:         z.string().min(1, 'Preencha este campo.'),
  status:           z.string().optional(),
});

type IncidentFormData = z.infer<typeof incidentSchema>;

interface IncidentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: any;
}

export function IncidentForm({ onSuccess, onCancel, initialData }: IncidentFormProps) {
  const [createIncident, { loading: isCreating }] = useMutation(CREATE_INCIDENT, {
    refetchQueries: [{ query: GET_LAST_INCIDENTS, variables: { limit: 100 } }],
    awaitRefetchQueries: true,
  });

  const [updateIncident, { loading: isUpdating }] = useMutation(UPDATE_INCIDENT, {
    refetchQueries: [{ query: GET_LAST_INCIDENTS, variables: { limit: 100 } }],
    awaitRefetchQueries: true,
  });

  const loading = isCreating || isUpdating;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: initialData ? {
      machineName:      initialData.machineName,
      reason:           initialData.reason,
      typeOfOccurrence: initialData.typeOfOccurrence,
      isMachineStopped: initialData.isMachineStopped,
      description:      initialData.description,
      severity:         initialData.severity,
      status:           initialData.status,
    } : {
      isMachineStopped: false,
      severity: 'Média',
    },
  });

  const onSubmit = async (data: IncidentFormData) => {
    try {
      if (initialData?.id) {
        await updateIncident({ variables: { id: initialData.id, ...data } });
        toast.success('Ordem de serviço atualizada com sucesso!');
      } else {
        await createIncident({ variables: data });
        toast.success('Ordem de serviço criada com sucesso!');
      }
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Erro ao salvar ordem de serviço.');
      console.error(error);
    }
  };

  return (
    <>
      <DialogHeader className="p-6 pb-2">
        <DialogTitle className="text-xl font-bold text-gray-900">
          {initialData ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
        </DialogTitle>
        <DialogDescription className="hidden">Preencha os dados do serviço.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-800">Máquina *</Label>
            <Input
              {...register('machineName')}
              placeholder="Digite o nome da máquina"
              className={`rounded-[8px] h-10 ${errors.machineName ? 'border-red-500' : 'border-gray-200'}`}
            />
            {errors.machineName && (
              <span className="bg-black text-white px-2 py-1 text-xs rounded shadow-sm inline-block">
                {errors.machineName.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-800">Motivo *</Label>
            <Input
              {...register('reason')}
              placeholder="Digite o motivo da ordem de serviço"
              className={`rounded-[8px] h-10 ${errors.reason ? 'border-red-500' : 'border-gray-200'}`}
            />
            {errors.reason && (
              <span className="bg-black text-white px-2 py-1 text-xs rounded shadow-sm inline-block">
                {errors.reason.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-800">Tipo de Serviço *</Label>
            <Select onValueChange={val => setValue('typeOfOccurrence', val || '')} defaultValue={watch('typeOfOccurrence') || undefined}>
              <SelectTrigger className={`rounded-[8px] h-10 ${errors.typeOfOccurrence ? 'border-red-500' : 'border-gray-200'}`}>
                <SelectValue placeholder="Selecione o tipo de serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Preventiva">Preventiva</SelectItem>
                <SelectItem value="Corretiva">Corretiva</SelectItem>
                <SelectItem value="Planejada">Planejada</SelectItem>
              </SelectContent>
            </Select>
            {errors.typeOfOccurrence && (
              <span className="bg-black text-white px-2 py-1 text-xs rounded shadow-sm inline-block">
                {errors.typeOfOccurrence.message}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 md:mt-8">
            <Checkbox
              id="machineStopped"
              checked={watch('isMachineStopped')}
              onCheckedChange={checked => setValue('isMachineStopped', checked === true)}
              className="border-gray-300 rounded-[4px] data-[state=checked]:bg-[#382b22] data-[state=checked]:border-[#382b22]"
            />
            <Label htmlFor="machineStopped" className="text-sm font-medium text-gray-700 cursor-pointer">
              Máquina foi parada?
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-gray-800">Descrição do Serviço *</Label>
          <Textarea
            {...register('description')}
            placeholder="Descreva detalhadamente o serviço a ser realizado"
            className={`min-h-[80px] rounded-[8px] resize-none ${errors.description ? 'border-red-500' : 'border-gray-200'}`}
          />
          {errors.description && (
            <span className="bg-[#1f2937] text-white px-2 py-1 text-xs rounded shadow-sm inline-block">
              {errors.description.message}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-800">Severidade *</Label>
            <Select onValueChange={val => setValue('severity', val || '')} defaultValue={watch('severity') || undefined}>
              <SelectTrigger className={`rounded-[8px] h-10 w-full ${errors.severity ? 'border-red-500' : 'border-gray-200'}`}>
                <SelectValue placeholder="Severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Baixa">Baixa</SelectItem>
                <SelectItem value="Média">Média</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {initialData && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-800">Status *</Label>
              <Select onValueChange={val => setValue('status', val || '')} defaultValue={watch('status') || undefined}>
                <SelectTrigger className="rounded-[8px] h-10 w-full border-gray-200">
                  <SelectValue placeholder="Selecione o Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Em Aberto">Em Aberto</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-[8px] border-gray-200 text-gray-600 font-medium"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#382b22] hover:bg-[#2c211a] text-white rounded-[8px] font-medium min-w-[160px]"
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
            {initialData ? 'Salvar Alterações' : 'Criar Ordem de Serviço'}
          </Button>
        </div>
      </form>
    </>
  );
}
