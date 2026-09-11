import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { gatewayClient, toFailureState } from '../api/client';
import { ACRButton } from '../components/ACRButton';
import { ACRCard } from '../components/ACRCard';
import { ACRInput } from '../components/ACRInput';
import { ACRSegmentedControl } from '../components/ACRSegmentedControl';
import { ACRStateBadge } from '../components/ACRStateBadge';
import { ACRStopBox } from '../components/ACRStopBox';
import { ScreenLayout } from '../components/ScreenLayout';
import { useAssessmentStore } from '../store/assessmentStore';
import { capabilitiesFor, deriveConnectionState } from './connectionState';
import { ACRColors, ACRTypography } from '../theme/colors';
import { getLocaleDirection, getTextAlign } from '../utils/rtl';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const GatewayAccessScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<Nav>();
  const [inviteCode, setInviteCode] = useState('');
  const [connecting, setConnecting] = useState(false);
  const {
    deliveryChoice, setDeliveryChoice, gatewayLive, setGatewayLive,
    accessReady, setAccessReady, attestation, setAttestation,
    failure, setFailure, walkthroughOnly, setWalkthroughOnly, reset,
  } = useAssessmentStore();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const textStyle = { writingDirection: getLocaleDirection(language), textAlign: getTextAlign(language) };

  useEffect(() => {
    let active = true;
    gatewayClient.checkLive().then(() => { if (active) setGatewayLive('UP'); }).catch(() => { if (active) setGatewayLive('DOWN'); });
    return () => { active = false; };
  }, [setGatewayLive]);

  // P3 / AUTH-03: after an app restart, restore access from the refresh token
  // held in the Keychain/Keystore, so an evaluator does not need a new
  // single-use invitation. A failed restore simply leaves the invite form; it
  // never switches delivery mode (AUTH-15).
  useEffect(() => {
    let active = true;
    if (!accessReady && !walkthroughOnly) {
      gatewayClient.restoreSession().then((restored) => { if (active && restored) setAccessReady(true); }).catch(() => undefined);
    }
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = async () => {
    if (walkthroughOnly) reset();
    setConnecting(true); setFailure(null); setAttestation(null);
    const submittedInvite = inviteCode;
    setInviteCode('');
    try {
      await gatewayClient.checkLive(); setGatewayLive('UP');
      await gatewayClient.redeemInvite(submittedInvite.trim()); setAccessReady(true);
      try { setAttestation(await gatewayClient.checkAttestation()); }
      catch (error) { setAttestation(null); setFailure(toFailureState(error)); }
      navigation.navigate('Step1');
    } catch (error) {
      const nextFailure = toFailureState(error);
      setAccessReady(false);
      if (nextFailure.code === 'SERVICE_UNAVAILABLE') setGatewayLive('DOWN');
      setFailure(nextFailure);
    } finally { setConnecting(false); }
  };

  const disconnect = () => {
    gatewayClient.clearSession();
    setAccessReady(false);
    setAttestation(null);
    setFailure(null);
  };

  const startWalkthrough = () => {
    gatewayClient.clearSession();
    reset();
    setDeliveryChoice('SYNTHETIC_DEMO');
    setAccessReady(false);
    setAttestation(null);
    setFailure(null);
    setWalkthroughOnly(true);
    navigation.navigate('Step1');
  };

  // T45-10 composite connection state, fail-closed by construction.
  const connectionState = deriveConnectionState(gatewayLive, attestation ? attestation.verificationState : null);
  const connectionCapabilities = capabilitiesFor(connectionState);

  return (
    <ScreenLayout title={t('gatewayAccess:title')} subtitle={t('gatewayAccess:subtitle')} bannerText={t('assessment:clinicalTransparencyBanner')}
      footer={<><ACRButton title={t('common:back')} variant="secondary" onPress={() => navigation.navigate('Welcome')} />
        <ACRButton title={t('gatewayAccess:connect')} onPress={() => { void connect(); }} disabled={connecting || inviteCode.trim() === ''} /></>}>
      <ACRCard title={t('gatewayAccess:modeTitle')}>
        <ACRSegmentedControl options={['LIVE_PLATFORM', 'SYNTHETIC_DEMO']} labels={[t('gatewayAccess:liveMode'), t('gatewayAccess:demoMode')]}
          selected={deliveryChoice} onSelect={(value) => {
            setWalkthroughOnly(false);
            setDeliveryChoice(value as 'LIVE_PLATFORM' | 'SYNTHETIC_DEMO');
          }} />
        <Text style={[styles.hint, textStyle]}>{deliveryChoice === 'LIVE_PLATFORM' ? t('gatewayAccess:liveHint') : t('gatewayAccess:demoHint')}</Text>
      </ACRCard>
      <ACRCard title={t('gatewayAccess:inviteTitle')}>
        <ACRInput value={inviteCode} onChangeText={setInviteCode} secureTextEntry autoCapitalize="none" placeholder={t('gatewayAccess:invitePlaceholder')} hint={t('gatewayAccess:inviteHint')} />
      </ACRCard>
      {accessReady ? <>
        <ACRButton title={t('common:next')} onPress={() => navigation.navigate('Step1')} />
        <ACRButton title={t('gatewayAccess:disconnect')} variant="secondary" onPress={disconnect} />
      </> : null}
      <ACRCard title={t('gatewayAccess:statusTitle')}>
        {/* T45-10: gateway reachability and live-platform availability are one
            explicitly named composite state, not two rows the reader must
            combine. The per-component rows remain below as detail. */}
        <Text accessibilityRole="header" style={[styles.connectionState, textStyle]}>
          {t(`gatewayAccess:${connectionCapabilities.labelKey}`)}
        </Text>
        {!connectionCapabilities.liveSubmissionAllowed && connectionState !== 'CHECKING'
          ? <Text style={[styles.connectionDetail, textStyle]}>{t('gatewayAccess:stateLiveBlocked')}</Text>
          : null}
        {!connectionCapabilities.liveSubmissionAllowed && connectionCapabilities.syntheticReplayAvailable
          ? <Text style={[styles.connectionDetail, textStyle]}>{t('gatewayAccess:stateReplayAvailable')}</Text>
          : null}
        <Row label={t('gatewayAccess:gateway')} value={gatewayLive === 'UP' ? t('gatewayAccess:connected') : gatewayLive === 'DOWN' ? t('gatewayAccess:notConnected') : t('gatewayAccess:checking')} />
        <Row label={t('gatewayAccess:attestation')} valueComponent={attestation ? <ACRStateBadge state={attestation.verificationState} /> : undefined} value={attestation ? undefined : t('common:emDash')} />
        {attestation ? <Text style={[styles.evidence, textStyle]}>{`${attestation.expected.logicalRuleCount}/${attestation.expected.physicalRuleCount}/${attestation.expected.activeRuleCount}/${attestation.expected.loadedRuleCount}/${attestation.expected.queryCount}`}</Text> : null}
        <Text style={[styles.connectionDetail, textStyle]}>{t('gatewayAccess:stateNoLocalInference')}</Text>
      </ACRCard>
      {gatewayLive === 'DOWN' ? <ACRStopBox title={t('gatewayAccess:notConnected')} message={t('gatewayAccess:serverAlert')} /> : null}
      {!accessReady && deliveryChoice === 'SYNTHETIC_DEMO' ? <>
        <ACRStopBox title={t('build44:fixtureUnavailable')} message={t('gatewayAccess:walkthroughNotice')} />
        <ACRButton title={t('gatewayAccess:continueOffline')} variant="secondary" onPress={startWalkthrough} />
      </> : null}
      {failure ? <View style={styles.error}><Text accessibilityRole="alert" style={[styles.errorText, textStyle]}>{failure.code === 'SERVICE_UNAVAILABLE' ? t('gatewayAccess:notConnected') : failure.message}</Text></View> : null}
      <Text style={[styles.privacy, textStyle]}>{t('gatewayAccess:privacy')}</Text>
    </ScreenLayout>
  );
};

const Row: React.FC<{ label: string; value?: string; valueComponent?: React.ReactNode }> = ({ label, value, valueComponent }) => {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const localText = { writingDirection: getLocaleDirection(language), textAlign: getTextAlign(language) };
  return <View accessible accessibilityRole="text" accessibilityLabel={`${label}: ${value ?? ''}`} style={styles.row}><Text style={[styles.label, localText]}>{label}</Text>{valueComponent ?? <Text style={[styles.value, localText]}>{value}</Text>}</View>;
};
const styles = StyleSheet.create({
  connectionState: { color: ACRColors.ink, fontSize: 12, fontWeight: '700', marginBottom: 6 },
  connectionDetail: { ...ACRTypography.hint, color: ACRColors.muted, marginBottom: 4 },
  hint: { ...ACRTypography.hint, color: ACRColors.muted, marginTop: 8 }, evidence: { ...ACRTypography.monospace, color: ACRColors.muted, marginTop: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }, label: { color: ACRColors.ink, fontSize: 11 }, value: { color: ACRColors.ink, fontSize: 11, fontWeight: '600' },
  error: { padding: 10, backgroundColor: ACRColors.stopBg, borderRadius: 8 }, errorText: { color: ACRColors.stopBorder, fontSize: 11 },
  privacy: { ...ACRTypography.hint, color: ACRColors.muted, marginTop: 8 },
});
