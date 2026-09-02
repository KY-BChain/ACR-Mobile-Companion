'use strict';

const PATIENT_FIELDS = Object.freeze([
  'patientId', 'erStatus', 'prStatus', 'her2Status', 'ki67', 'stage', 'grade',
  'histologicalSubtype', 'nodalStatus', 'age', 'ca153', 'cea', 'surgeryDate',
  'tumorSize', 'gender', 'ecogScore', 'pdl1Status', 'her2Low', 'lvef', 'treatmentIntent',
]);

function mapHer2Low(value) {
  if (value === 'positive') return true;
  if (value === 'negative') return false;
  return null;
}

function mapAssessmentToPlatform(request) {
  const assessment = request.assessment;
  const patientData = {};
  for (const field of PATIENT_FIELDS) {
    if (field === 'her2Low') {
      patientData.her2Low = mapHer2Low(assessment.her2Low);
    } else {
      patientData[field] = assessment[field] === undefined ? null : assessment[field];
    }
  }
  return {
    patientData,
    bayesianEnhanced: assessment.bayesianEnhanced,
    analysisVersion: '2.2',
  };
}

module.exports = { PATIENT_FIELDS, mapHer2Low, mapAssessmentToPlatform };
