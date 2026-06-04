export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  phone?: string;
  email?: string;
  birthDate: string;
}

export interface PatientRequest {
  firstName: string;
  lastName: string;
  dni: string;
  phone?: string;
  email?: string;
  birthDate: string;
}
