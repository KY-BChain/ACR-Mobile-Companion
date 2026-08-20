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

export type ProvisionalGender = '' | 'female' | 'male' | 'other' | 'unknown';
export type ProvisionalStatus = '' | 'positive' | 'negative' | 'not_tested';
export type ProvisionalHer2Low = '' | 'positive' | 'negative' | 'unknown';
export type TreatmentIntent = '' | 'neoadjuvant' | 'adjuvant' | 'unspecified';

export interface P1State {
  tumorSize: string;
  gender: ProvisionalGender;
}

export interface P2State {
  ecogScore: string;
  pdl1Status: ProvisionalStatus;
  her2Low: ProvisionalHer2Low;
  lvef: string;
  treatmentIntent: TreatmentIntent;
}

interface AssessmentStore {
  // Form state
  form: AssessmentFormState;
  setStep1: (data: Partial<AssessmentFormState['step1']>) => void;
  setStep2: (data: Partial<AssessmentFormState['step2']>) => void;
  setStep3: (data: Partial<AssessmentFormState['step3']>) => void;
  p1: P1State;
  setP1: (data: Partial<P1State>) => void;
  p2: P2State;
  setP2: (data: Partial<P2State>) => void;

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

const initialP1: P1State = { tumorSize: '', gender: '' };
const initialP2: P2State = { ecogScore: '', pdl1Status: '', her2Low: '', lvef: '', treatmentIntent: '' };

export const useAssessmentStore = create<AssessmentStore>((set) => ({
  form: initialForm,
  setStep1: (data) => set((state) => ({ form: { ...state.form, step1: { ...state.form.step1, ...data } } })),
  setStep2: (data) => set((state) => ({ form: { ...state.form, step2: { ...state.form.step2, ...data } } })),
  setStep3: (data) => set((state) => ({ form: { ...state.form, step3: { ...state.form.step3, ...data } } })),
  p1: initialP1,
  setP1: (data) => set((state) => ({ p1: { ...state.p1, ...data } })),
  p2: initialP2,
  setP2: (data) => set((state) => ({ p2: { ...state.p2, ...data } })),

  result: null,
  setResult: (result) => set({ result }),

  attestation: null,
  setAttestation: (attestation) => set({ attestation }),

  sessionId: '',
  setSessionId: (sessionId) => set({ sessionId }),

  reset: () =>
    set({
      form: initialForm,
      p1: initialP1,
      p2: initialP2,
      result: null,
      attestation: null,
      sessionId: '',
    }),
}));
