/** One-assessment, in-memory-only state. No persistence or clinical data at rest. */
import { create } from 'zustand';
import type { AssessmentFormState, AssessmentResponse, AttestationResponse, DeliveryChoice, FailureState, P1State, P2State, PairingNotice } from '../types/api';
import { BLANK_P1, BLANK_P2, DEMO_P1, DEMO_P2, SAMPLE_FORM } from './sampleCase';
export type { ProvisionalGender, ProvisionalHer2Low, ProvisionalStatus, TreatmentIntent } from '../types/api';

interface AssessmentStore {
  form: AssessmentFormState;
  setStep1: (data: Partial<AssessmentFormState['step1']>) => void;
  setStep2: (data: Partial<AssessmentFormState['step2']>) => void;
  setStep3: (data: Partial<AssessmentFormState['step3']>) => void;
  p1: P1State; setP1: (data: Partial<P1State>) => void;
  p2: P2State; setP2: (data: Partial<P2State>) => void;
  /** Build 47 (M9): Steps 1–3 fields the clinician has set; the rest still hold the sample. */
  edited: string[];
  result: AssessmentResponse | null; setResult: (result: AssessmentResponse | null) => void;
  attestation: AttestationResponse | null; setAttestation: (attestation: AttestationResponse | null) => void;
  failure: FailureState | null; setFailure: (failure: FailureState | null) => void;
  deliveryChoice: DeliveryChoice; setDeliveryChoice: (choice: DeliveryChoice) => void;
  gatewayLive: 'UNKNOWN' | 'UP' | 'DOWN'; setGatewayLive: (state: 'UNKNOWN' | 'UP' | 'DOWN') => void;
  accessReady: boolean; setAccessReady: (ready: boolean) => void;
  walkthroughOnly: boolean; setWalkthroughOnly: (enabled: boolean) => void;
  sessionId: string; setSessionId: (id: string) => void;
  /** Build 46: shown once as the Welcome pop-up after a first pairing; not clinical data. */
  pairingNotice: PairingNotice | null; setPairingNotice: (notice: PairingNotice | null) => void;
  reset: () => void;
  resetCycle: () => void;
}

export const initialForm: AssessmentFormState = SAMPLE_FORM;
export const initialP1: P1State = BLANK_P1;
export const initialP2: P2State = BLANK_P2;

const markEdited = (edited: string[], data: object) => [...new Set([...edited, ...Object.keys(data)])];

export const useAssessmentStore = create<AssessmentStore>((set) => ({
  form: initialForm,
  setStep1: (data) => set((state) => ({ form: { ...state.form, step1: { ...state.form.step1, ...data } }, edited: markEdited(state.edited, data) })),
  setStep2: (data) => set((state) => ({ form: { ...state.form, step2: { ...state.form.step2, ...data } }, edited: markEdited(state.edited, data) })),
  setStep3: (data) => set((state) => ({ form: { ...state.form, step3: { ...state.form.step3, ...data } }, edited: markEdited(state.edited, data) })),
  p1: initialP1, setP1: (data) => set((state) => ({ p1: { ...state.p1, ...data } })),
  p2: initialP2, setP2: (data) => set((state) => ({ p2: { ...state.p2, ...data } })),
  edited: [],
  result: null, setResult: (result) => set({ result }),
  attestation: null, setAttestation: (attestation) => set({ attestation }),
  failure: null, setFailure: (failure) => set({ failure }),
  // Build 47 (M12): choosing a delivery mode starts its case — the synthetic
  // demonstration case for "Synthetic demo", the sample with blank P1/P2 for live.
  deliveryChoice: 'LIVE_PLATFORM', setDeliveryChoice: (deliveryChoice) => set(deliveryChoice === 'SYNTHETIC_DEMO'
    ? { deliveryChoice, form: initialForm, p1: DEMO_P1, p2: DEMO_P2, edited: [] }
    : { deliveryChoice, form: initialForm, p1: initialP1, p2: initialP2, edited: [] }),
  gatewayLive: 'UNKNOWN', setGatewayLive: (gatewayLive) => set({ gatewayLive }),
  accessReady: false, setAccessReady: (accessReady) => set({ accessReady }),
  walkthroughOnly: false, setWalkthroughOnly: (walkthroughOnly) => set({ walkthroughOnly }),
  sessionId: '', setSessionId: (sessionId) => set({ sessionId }),
  pairingNotice: null, setPairingNotice: (pairingNotice) => set({ pairingNotice }),
  reset: () => set({ form: initialForm, p1: initialP1, p2: initialP2, edited: [], result: null, failure: null, walkthroughOnly: false, sessionId: '' }),
  resetCycle: () => set({
    form: initialForm,
    p1: initialP1,
    p2: initialP2,
    edited: [],
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
