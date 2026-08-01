import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Patient } from '@/types/patient.types';

interface PatientCardProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onClinicalHistory: (patient: Patient) => void;
  onDelete: (id: number) => void;
}

export function PatientCard({ patient, onEdit, onClinicalHistory, onDelete }: PatientCardProps) {
  const formattedBirthDate = patient.birthDate
    ? patient.birthDate.split('-').reverse().join('/')
    : '';

  return (
    <View className="bg-white/[0.045] rounded-[24px] p-5 border-[1.5px] border-white/8 mb-4 shadow-black elevation-8">
      <View className="flex-row justify-between items-start mb-3.5">
        <View className="flex-1 pr-2">
          <Text className="text-white text-lg font-sans-bold mb-1 tracking-[0.2px]">
            {patient.lastName}, {patient.firstName}
          </Text>
          <View className="flex-row items-center gap-1.5 bg-sky-500/10 rounded-[12px] px-2.5 py-1.5 self-start border border-sky-500/25">
            <Text className="text-sky-400 text-xs font-sans-semibold tracking-[0.2px]">DNI: {patient.dni}</Text>
          </View>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            className="w-10 h-10 bg-sky-500/10 rounded-full items-center justify-center border border-sky-500/25"
            onPress={() => onClinicalHistory(patient)}
            activeOpacity={0.7}
          >
            <Ionicons name="document-text-outline" size={18} color="#7DD3FC" />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-10 h-10 bg-white/5 rounded-full items-center justify-center border border-white/10"
            onPress={() => onEdit(patient)}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={18} color="#60A5FA" />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-10 h-10 bg-red-500/10 rounded-full items-center justify-center border border-red-500/20"
            onPress={() => onDelete(patient.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color="#F87171" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="border-t border-white/5 pt-3.5 gap-2.5">
        {patient.phone ? (
          <View className="flex-row items-center gap-2.5">
            <Ionicons name="call-outline" size={15} color="rgba(255, 255, 255, 0.45)" />
            <Text className="text-white/60 text-sm font-sans tracking-[0.2px]">{patient.phone}</Text>
          </View>
        ) : null}
        {patient.email ? (
          <View className="flex-row items-center gap-2.5">
            <Ionicons name="mail-outline" size={15} color="rgba(255, 255, 255, 0.45)" />
            <Text className="text-white/60 text-sm font-sans tracking-[0.2px]">{patient.email}</Text>
          </View>
        ) : null}
        <View className="flex-row items-center gap-2.5">
          <Ionicons name="calendar-outline" size={15} color="rgba(255, 255, 255, 0.45)" />
          <Text className="text-white/60 text-sm font-sans tracking-[0.2px]">
            Fecha Nacimiento: {formattedBirthDate}
          </Text>
        </View>
      </View>
    </View>
  );
}
