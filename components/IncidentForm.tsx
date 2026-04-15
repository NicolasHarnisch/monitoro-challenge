'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { toast } from 'react-hot-toast';
import { Loader2, Wrench, AlertTriangle, CheckCircle2 } from 'lucide-react';

const incidentSchema = z.object({
  machineName: z.string().min(1, 'Selecione uma máquina'),
  typeOfOccurrence: z.string().min(1, 'Selecione o tipo de ocorrência'),
  description: z
    .string()
    .min(10, 'A descrição deve ter no mínimo 10 caracteres'),
  severity: z.string().min(1, 'Defina a severidade'),
});

type IncidentFormData = z.infer<typeof incidentSchema>;

const CREATE_INCIDENT = gql`
  mutation CreateIncident(
    $machineName: String!
    $typeOfOccurrence: String!
    $description: String!
    $severity: String!
  ) {
    createIncident(
      machineName: $machineName
      typeOfOccurrence: $typeOfOccurrence
      description: $description
      severity: $severity
    ) {
      id
      status
      createdAt
    }
  }
`;

const GET_LAST_INCIDENTS = gql`
  query GetLastIncidents($limit: Int) {
    lastIncidents(limit: $limit) {
      id
      description
      machineName
      severity
      status
      typeOfOccurrence
      createdAt
    }
  }
`;

const MACHINES = [
  'Corrente de rebarba (21)',
  'Torno CNC 01',
  'Maromba 12',
  'Enchedeira Volvo L60',
  'Prensa Hidráulica 03',
  'Compressor Atlas 05',
  'Esteira Transportadora 02',
];

const SEVERITIES = [
  { value: 'Baixa', color: 'peer-checked:bg-emerald-100 peer-checked:border-emerald-500 peer-checked:text-emerald-800', icon: '🟢' },
  { value: 'Média', color: 'peer-checked:bg-amber-100 peer-checked:border-amber-500 peer-checked:text-amber-800', icon: '🟡' },
  { value: 'Alta', color: 'peer-checked:bg-red-100 peer-checked:border-red-500 peer-checked:text-red-800', icon: '🔴' },
];

export function IncidentForm({ onSuccess }: { onSuccess?: () => void }) {
  const [createIncident, { loading }] = useMutation(CREATE_INCIDENT, {
    refetchQueries: [{ query: GET_LAST_INCIDENTS, variables: { limit: 5 } }],
    awaitRefetchQueries: true,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      severity: 'Média',
    },
  });

  const onSubmit = async (data: IncidentFormData) => {
    try {
      await createIncident({ variables: data });
      toast.success('✅ Incidente registrado com sucesso!', {
        style: {
          background: '#1a1a2e',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          fontWeight: '600',
        },
      });
      reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('❌ Erro ao registrar ocorrência.', {
        style: {
          background: '#1a1a2e',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          fontWeight: '600',
        },
      });
      console.error(error);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
      {/* Header do Formulário */}
      <div className="p-8 pb-6 bg-gradient-to-r from-[#1a1a2e] to-[#16213e]">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-white/10 p-2 rounded-xl">
            <Wrench className="text-white" size={18} />
          </div>
          <span className="text-white/60 text-xs font-black uppercase tracking-widest">Nova Ocorrência</span>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Registrar Incidente
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
        {/* Máquina */}
        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
            Máquina <span className="text-red-400">*</span>
          </label>
          <select
            {...register('machineName')}
            className={`w-full p-3.5 bg-gray-50 border-2 rounded-xl font-semibold text-gray-800 focus:outline-none transition-all ${
              errors.machineName
                ? 'border-red-400 focus:border-red-500'
                : 'border-gray-100 focus:border-[#1a1a2e]'
            }`}
          >
            <option value="">Selecione uma máquina...</option>
            {MACHINES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          {errors.machineName && (
            <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5 font-semibold">
              <AlertTriangle size={12} /> {errors.machineName.message}
            </p>
          )}
        </div>

        {/* Tipo de Ocorrência */}
        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
            Tipo de Ocorrência <span className="text-red-400">*</span>
          </label>
          <select
            {...register('typeOfOccurrence')}
            className={`w-full p-3.5 bg-gray-50 border-2 rounded-xl font-semibold text-gray-800 focus:outline-none transition-all ${
              errors.typeOfOccurrence
                ? 'border-red-400 focus:border-red-500'
                : 'border-gray-100 focus:border-[#1a1a2e]'
            }`}
          >
            <option value="">Selecione o tipo...</option>
            <option value="Preventiva">Preventiva</option>
            <option value="Corretiva">Corretiva</option>
            <option value="Planejada">Planejada</option>
          </select>
          {errors.typeOfOccurrence && (
            <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5 font-semibold">
              <AlertTriangle size={12} /> {errors.typeOfOccurrence.message}
            </p>
          )}
        </div>

        {/* Severidade */}
        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
            Severidade <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-3">
            {SEVERITIES.map(({ value, color, icon }) => (
              <label key={value} className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  value={value}
                  {...register('severity')}
                  className="hidden peer"
                />
                <div className={`text-center p-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-gray-500 font-black text-sm cursor-pointer transition-all ${color}`}>
                  <span className="block text-lg mb-0.5">{icon}</span>
                  {value}
                </div>
              </label>
            ))}
          </div>
          {errors.severity && (
            <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5 font-semibold">
              <AlertTriangle size={12} /> {errors.severity.message}
            </p>
          )}
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
            Descrição da Ocorrência <span className="text-red-400">*</span>
          </label>
          <textarea
            {...register('description')}
            rows={4}
            placeholder="Descreva detalhadamente o problema ou serviço a ser realizado..."
            className={`w-full p-3.5 bg-gray-50 border-2 rounded-xl resize-none font-medium text-gray-800 placeholder-gray-300 focus:outline-none transition-all ${
              errors.description
                ? 'border-red-400 focus:border-red-500'
                : 'border-gray-100 focus:border-[#1a1a2e]'
            }`}
          />
          {errors.description && (
            <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5 font-semibold">
              <AlertTriangle size={12} /> {errors.description.message}
            </p>
          )}
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 px-5 py-3.5 rounded-xl font-black text-gray-400 hover:bg-gray-100 transition-all border-2 border-gray-100 text-sm"
          >
            Limpar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-5 py-3.5 bg-gradient-to-r from-[#1a1a2e] to-[#16213e] hover:from-[#16213e] hover:to-[#0f3460] text-white font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Registrando...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Registrar Incidente
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
