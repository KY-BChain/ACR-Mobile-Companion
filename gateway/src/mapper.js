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

// The phone's histology code PAGET is sent as the website's "Paget's disease", so every client sends
// one code per value (T1 already treats both alike). Every other value passes through unchanged.
function mapHistology(value) {
  return value === 'PAGET' ? "Paget's disease" : value;
}

function mapAssessmentToPlatform(request) {
  const assessment = request.assessment;
  const patientData = {};
  for (const field of PATIENT_FIELDS) {
    if (field === 'her2Low') {
      patientData.her2Low = mapHer2Low(assessment.her2Low);
    } else if (field === 'histologicalSubtype') {
      patientData.histologicalSubtype = assessment.histologicalSubtype === undefined ? null : mapHistology(assessment.histologicalSubtype);
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

module.exports = { PATIENT_FIELDS, mapHer2Low, mapHistology, mapAssessmentToPlatform };
