/** One-assessment, in-memory-only state. No persistence or clinical data at rest. */
import { create } from 'zustand';
import type { AssessmentFormState, AssessmentResponse, AttestationResponse, DeliveryChoice, FailureState, P1State, P2State } from '../types/api';
export type { ProvisionalGender, ProvisionalHer2Low, ProvisionalStatus, TreatmentIntent } from '../types/api';

interface AssessmentStore {
  form: AssessmentFormState;
  setStep1: (data: Partial<AssessmentFormState['step1']>) => void;
  setStep2: (data: Partial<AssessmentFormState['step2']>) => void;
  setStep3: (data: Partial<AssessmentFormState['step3']>) => void;
  p1: P1State; setP1: (data: Partial<P1State>) => void;
  p2: P2State; setP2: (data: Partial<P2State>) => void;
  result: AssessmentResponse | null; setResult: (result: AssessmentResponse | null) => void;
  attestation: AttestationResponse | null; setAttestation: (attestation: AttestationResponse | null) => void;
  failure: FailureState | null; setFailure: (failure: FailureState | null) => void;
  deliveryChoice: DeliveryChoice; setDeliveryChoice: (choice: DeliveryChoice) => void;
  gatewayLive: 'UNKNOWN' | 'UP' | 'DOWN'; setGatewayLive: (state: 'UNKNOWN' | 'UP' | 'DOWN') => void;
  accessReady: boolean; setAccessReady: (ready: boolean) => void;
  walkthroughOnly: boolean; setWalkthroughOnly: (enabled: boolean) => void;
  sessionId: string; setSessionId: (id: string) => void;
  reset: () => void;
  resetCycle: () => void;
}

export const initialForm: AssessmentFormState = {
  step1: { erStatus: 'positive', prStatus: 'positive', her2Status: 'negative', ki67: '25' },
  step2: { stage: 'II', grade: '2', histologicalSubtype: 'IDC', nodalStatus: 'N0', age: '52' },
  step3: { ca153: '40.0', cea: '6.0', surgeryDate: '2026-03-14', bayesianEnhanced: true },
};
export const initialP1: P1State = { tumorSize: '', gender: '' };
export const initialP2: P2State = { ecogScore: '', pdl1Status: '', her2Low: '', lvef: '', treatmentIntent: '' };

export const useAssessmentStore = create<AssessmentStore>((set) => ({
  form: initialForm,
  setStep1: (data) => set((state) => ({ form: { ...state.form, step1: { ...state.form.step1, ...data } } })),
  setStep2: (data) => set((state) => ({ form: { ...state.form, step2: { ...state.form.step2, ...data } } })),
  setStep3: (data) => set((state) => ({ form: { ...state.form, step3: { ...state.form.step3, ...data } } })),
  p1: initialP1, setP1: (data) => set((state) => ({ p1: { ...state.p1, ...data } })),
  p2: initialP2, setP2: (data) => set((state) => ({ p2: { ...state.p2, ...data } })),
  result: null, setResult: (result) => set({ result }),
  attestation: null, setAttestation: (attestation) => set({ attestation }),
  failure: null, setFailure: (failure) => set({ failure }),
  deliveryChoice: 'LIVE_PLATFORM', setDeliveryChoice: (deliveryChoice) => set({ deliveryChoice }),
  gatewayLive: 'UNKNOWN', setGatewayLive: (gatewayLive) => set({ gatewayLive }),
  accessReady: false, setAccessReady: (accessReady) => set({ accessReady }),
  walkthroughOnly: false, setWalkthroughOnly: (walkthroughOnly) => set({ walkthroughOnly }),
  sessionId: '', setSessionId: (sessionId) => set({ sessionId }),
  reset: () => set({ form: initialForm, p1: initialP1, p2: initialP2, result: null, failure: null, walkthroughOnly: false, sessionId: '' }),
  resetCycle: () => set({
    form: initialForm,
    p1: initialP1,
    p2: initialP2,
    result: null,
    attestation: null,
    failure: null,
    deliveryChoice: 'LIVE_PLATFORM',
    gatewayLive: 'UNKNOWN',
    accessReady: false,
    walkthroughOnly: false,
    sessionId: '',
  }),
}));
