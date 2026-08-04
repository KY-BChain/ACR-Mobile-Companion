/**
 * ACR Assessment Store
 * In-memory only. No persistence. No AsyncStorage.
 * ACR-DD-013 v0.7: "Entries exist in memory for one assessment only."
 */

import { create } from 'zustand';
import type {
  AssessmentFormState,
  AssessmentResponse,
  AttestationResponse,
  ErStatus,
  PrStatus,
  Her2Status,
  Grade,
  NodalStatus,
  HistologicalSubtype,
  Stage,
} from '../types/api';

interface AssessmentStore {
  // Form state
  form: AssessmentFormState;
  setStep1: (data: Partial<AssessmentFormState['step1']>) => void;
  setStep2: (data: Partial<AssessmentFormState['step2']>) => void;
  setStep3: (data: Partial<AssessmentFormState['step3']>) => void;

  // Result
  result: AssessmentResponse | null;
  setResult: (result: AssessmentResponse | null) => void;

  // Attestation
  attestation: AttestationResponse | null;
  setAttestation: (att: AttestationResponse | null) => void;

  // Session
  sessionId: string;
  setSessionId: (id: string) => void;

  // Reset
  reset: () => void;
}

const initialForm: AssessmentFormState = {
  step1: {
    erStatus: 'positive',
    prStatus: 'positive',
    her2Status: 'negative',
    ki67: '25',
  },
  step2: {
    stage: 'II',
    grade: '2',
    histologicalSubtype: 'IDC',
    nodalStatus: 'N0',
    age: '52',
  },
  step3: {
    ca153: '40.0',
    cea: '6.0',
    surgeryDate: '2026-03-14',
    bayesianEnhanced: true,
  },
};

export const useAssessmentStore = create<AssessmentStore>((set) => ({
  form: initialForm,
  setStep1: (data) => set((state) => ({ form: { ...state.form, step1: { ...state.form.step1, ...data } } })),
  setStep2: (data) => set((state) => ({ form: { ...state.form, step2: { ...state.form.step2, ...data } } })),
  setStep3: (data) => set((state) => ({ form: { ...state.form, step3: { ...state.form.step3, ...data } } })),

  result: null,
  setResult: (result) => set({ result }),

  attestation: null,
  setAttestation: (attestation) => set({ attestation }),

  sessionId: '',
  setSessionId: (sessionId) => set({ sessionId }),

  reset: () =>
    set({
      form: initialForm,
      result: null,
      attestation: null,
      sessionId: '',
    }),
}));
