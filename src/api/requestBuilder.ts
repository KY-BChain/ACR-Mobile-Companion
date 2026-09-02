import { MOBILE_BUILD_ID } from '../config/appIdentity';
import type { AssessmentFormState, AssessmentRequest, P1State, P2State } from '../types/api';
import { isAgeValid, isEcogValid, isIsoDateValid, isKi67Valid, isLvefValid, isMarkerValid, isTumorSizeValid } from '../utils/provisionalValidation';

export class AssessmentValidationError extends Error {
  constructor(public fieldErrors: string[]) { super('Assessment fields are invalid.'); }
}
const optionalNumber = (value: string): number | null => value.trim() === '' ? null : Number(value.trim());
const optionalString = <T extends string>(value: T | ''): T | null => value === '' ? null : value;
const oneOf = (value: unknown, allowed: readonly string[]): boolean => typeof value === 'string' && allowed.includes(value);
const nullableOneOf = (value: unknown, allowed: readonly string[]): boolean => value === null || oneOf(value, allowed);

export function buildAssessmentRequest(input: { form: AssessmentFormState; p1: P1State; p2: P2State; patientId: string; requestId: string }): AssessmentRequest {
  const { form, p1, p2, patientId, requestId } = input;
  const fieldErrors: string[] = [];
  if (!oneOf(form.step1.erStatus, ['positive', 'negative'])) fieldErrors.push('erStatus');
  if (!oneOf(form.step1.prStatus, ['positive', 'negative'])) fieldErrors.push('prStatus');
  if (!oneOf(form.step1.her2Status, ['positive', 'negative'])) fieldErrors.push('her2Status');
  if (!isKi67Valid(form.step1.ki67)) fieldErrors.push('ki67');
  if (!nullableOneOf(form.step2.stage, ['0', 'I', 'IA', 'IB', 'II', 'IIA', 'IIB', 'III', 'IIIA', 'IIIB', 'IIIC', 'IV'])) fieldErrors.push('stage');
  if (!nullableOneOf(form.step2.grade, ['1', '2', '3'])) fieldErrors.push('grade');
  if (!nullableOneOf(form.step2.histologicalSubtype, ['IDC', 'ILC', 'DCIS', 'PAGET'])) fieldErrors.push('histologicalSubtype');
  if (!nullableOneOf(form.step2.nodalStatus, ['N0', 'N1', 'N2', 'N3'])) fieldErrors.push('nodalStatus');
  if (!isAgeValid(form.step2.age)) fieldErrors.push('age');
  if (!isMarkerValid(form.step3.ca153)) fieldErrors.push('ca153');
  if (!isMarkerValid(form.step3.cea)) fieldErrors.push('cea');
  if (!isIsoDateValid(form.step3.surgeryDate)) fieldErrors.push('surgeryDate');
  if (typeof form.step3.bayesianEnhanced !== 'boolean') fieldErrors.push('bayesianEnhanced');
  if (!isTumorSizeValid(p1.tumorSize)) fieldErrors.push('tumorSize');
  if (!oneOf(p1.gender, ['', 'female', 'male', 'other', 'unknown'])) fieldErrors.push('gender');
  if (!isEcogValid(p2.ecogScore)) fieldErrors.push('ecogScore');
  if (!oneOf(p2.pdl1Status, ['', 'positive', 'negative', 'not_tested'])) fieldErrors.push('pdl1Status');
  if (!oneOf(p2.her2Low, ['', 'positive', 'negative', 'unknown'])) fieldErrors.push('her2Low');
  if (!isLvefValid(p2.lvef)) fieldErrors.push('lvef');
  if (!oneOf(p2.treatmentIntent, ['', 'neoadjuvant', 'adjuvant', 'unspecified'])) fieldErrors.push('treatmentIntent');
  if (!/^mob-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(patientId)) fieldErrors.push('patientId');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) fieldErrors.push('requestId');
  if (fieldErrors.length) throw new AssessmentValidationError(fieldErrors);
  if (MOBILE_BUILD_ID !== 'mob-v0.6.0+44') throw new Error('Build identity does not match the frozen gateway contract.');
  return {
    contract: 'acr.cds.v1', requestId,
    assessment: {
      patientId, erStatus: form.step1.erStatus, prStatus: form.step1.prStatus, her2Status: form.step1.her2Status,
      ki67: Number(form.step1.ki67.trim()), stage: form.step2.stage, grade: form.step2.grade,
      histologicalSubtype: form.step2.histologicalSubtype, nodalStatus: form.step2.nodalStatus,
      age: optionalNumber(form.step2.age), ca153: optionalNumber(form.step3.ca153), cea: optionalNumber(form.step3.cea),
      surgeryDate: form.step3.surgeryDate.trim() || null, bayesianEnhanced: form.step3.bayesianEnhanced,
      tumorSize: optionalNumber(p1.tumorSize), gender: optionalString(p1.gender), ecogScore: optionalNumber(p2.ecogScore),
      pdl1Status: optionalString(p2.pdl1Status), her2Low: optionalString(p2.her2Low), lvef: optionalNumber(p2.lvef),
      treatmentIntent: optionalString(p2.treatmentIntent),
    },
    client: { channel: 'MOBILE', buildId: MOBILE_BUILD_ID, environment: 'EVALUATION' },
  };
}
