'use client';

/**
 * Formulário de criação e edição de Ordens de Serviço.
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery } from '@apollo/client/react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

import {
  GET_SERVICE_ORDERS,
  GET_MACHINES,
  CREATE_SERVICE_ORDER,
  UPDATE_SERVICE_ORDER,
} from '@/lib/graphql-queries';
import { Machine } from '@/types/service-order';

/**
 * Schema de validação — espelha os campos obrigatórios do CreateServiceOrderInput
 * do projeto de referência (machineId, reason, type, isMachineStopped, description).
 */
const serviceOrderSchema = z.object({
  machineId:        z.string().min(1, 'Selecione uma máquina.'),
  reason:           z.string().min(1, 'Preencha este campo.'),
  type:             z.string().min(1, 'Preencha este campo.'),
  isMachineStopped: z.boolean(),
  description:      z.string().min(1, 'Preencha este campo.'),
  severity:         z.string().min(1, 'Preencha este campo.'),
  status:           z.string().optional(),
});

type ServiceOrderFormData = z.infer<typeof serviceOrderSchema>;

interface IncidentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: any;
}

export function IncidentForm({ onSuccess, onCancel, initialData }: IncidentFormProps) {
  // Busca as máquinas cadastradas para popular o select.
  // Equivalente ao uso de MachineService.findAll() no projeto de referência.
  const { data: machinesData } = useQuery<{ machines: Machine[] }>(GET_MACHINES);
  const machines = machinesData?.machines ?? [];

  const [createServiceOrder, { loading: isCreating }] = useMutation(CREATE_SERVICE_ORDER, {
    refetchQueries: [{ query: GET_SERVICE_ORDERS, variables: { limit: 100 } }],
    awaitRefetchQueries: true,
  });

  const [updateServiceOrder, { loading: isUpdating }] = useMutation(UPDATE_SERVICE_ORDER, {
    refetchQueries: [{ query: GET_SERVICE_ORDERS, variables: { limit: 100 } }],
    awaitRefetchQueries: true,
  });

  const loading = isCreating || isUpdating;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ServiceOrderFormData>({
    resolver: zodResolver(serviceOrderSchema),
    defaultValues: initialData ? {
      machineId:        initialData.machine?.id ?? '',
      reason:           initialData.reason,
      type:             initialData.type,
      isMachineStopped: initialData.isMachineStopped,
      description:      initialData.description,
      severity:         initialData.severity,
      status:           initialData.status,
    } : {
      isMachineStopped: false,
      severity: 'Média',
    },
  });

  const onSubmit = async (data: ServiceOrderFormData) => {
    try {
      if (initialData?.id) {
        await updateServiceOrder({ variables: { id: initialData.id, ...data } });
        toast.success('Ordem de serviço atualizada com sucesso!');
      } else {
        await createServiceOrder({ variables: data });
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

          {/* Seleção de Máquina — baseado no machineId do CreateServiceOrderInput */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-800">Máquina *</Label>
            <Select
              onValueChange={val => setValue('machineId', val || '')}
              defaultValue={watch('machineId') || undefined}
            >
              <SelectTrigger className={`rounded-[8px] h-10 ${errors.machineId ? 'border-red-500' : 'border-gray-200'}`}>
                <SelectValue placeholder="Selecione a máquina" />
              </SelectTrigger>
              <SelectContent>
                {machines.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} ({m.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.machineId && (
              <span className="bg-black text-white px-2 py-1 text-xs rounded shadow-sm inline-block">
                {errors.machineId.message}
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
            <Select onValueChange={val => setValue('type', val || '')} defaultValue={watch('type') || undefined}>
              <SelectTrigger className={`rounded-[8px] h-10 ${errors.type ? 'border-red-500' : 'border-gray-200'}`}>
                <SelectValue placeholder="Selecione o tipo de serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Preventiva">Preventiva</SelectItem>
                <SelectItem value="Corretiva">Corretiva</SelectItem>
                <SelectItem value="Planejada">Planejada</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <span className="bg-black text-white px-2 py-1 text-xs rounded shadow-sm inline-block">
                {errors.type.message}
              </span>
            )}
          </div>

          {/* isMachineStopped — campo boolean obrigatório do CreateServiceOrderInput */}
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
