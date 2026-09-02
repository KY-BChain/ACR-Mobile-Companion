import React from 'react';
import { useTranslation } from 'react-i18next';
import { ACRStopBox } from './ACRStopBox';
import { useAssessmentStore } from '../store/assessmentStore';

/** Visible on every assessment screen during the result-free fixture walkthrough. */
export const WalkthroughNotice: React.FC = () => {
  const { t } = useTranslation();
  const walkthroughOnly = useAssessmentStore((state) => state.walkthroughOnly);
  if (!walkthroughOnly) return null;

  return (
    <ACRStopBox
      title={t('build44:fixtureUnavailable')}
      message={t('gatewayAccess:walkthroughNotice')}
    />
  );
};
