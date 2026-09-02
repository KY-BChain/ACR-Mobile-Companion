import { gatewayClient } from './client';
import type { AssessmentRequest, DeliveryChoice } from '../types/api';
export const submitAssessment = (request: AssessmentRequest, choice: DeliveryChoice) => gatewayClient.submit(request, choice);
