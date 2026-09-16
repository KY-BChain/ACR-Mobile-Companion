import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { gatewayClient, toFailureState } from '../api/client';
import { ACRButton } from '../components/ACRButton';
import { ACRCard } from '../components/ACRCard';
import { ACRInput } from '../components/ACRInput';
import { ACRSegmentedControl } from '../components/ACRSegmentedControl';
import { ACRStateBadge, spokenState } from '../components/ACRStateBadge';
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
  const [savedAccess, setSavedAccess] = useState<'UNKNOWN' | 'NONE' | 'ACTIVE' | 'EXPIRED'>('UNKNOWN');
  const [liveCheck, setLiveCheck] = useState(0);
  const {
    deliveryChoice, setDeliveryChoice, gatewayLive, setGatewayLive,
    accessReady, setAccessReady, attestation, setAttestation,
    failure, setFailure, walkthroughOnly, setWalkthroughOnly, reset, setPairingNotice,
  } = useAssessmentStore();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const textStyle = { writingDirection: getLocaleDirection(language), textAlign: getTextAlign(language) };

  useEffect(() => {
    let active = true;
    gatewayClient.checkLive().then(() => { if (active) setGatewayLive('UP'); }).catch(() => { if (active) setGatewayLive('DOWN'); });
    return () => { active = false; };
  }, [setGatewayLive, liveCheck]);

  // Build 46: whether this device holds a saved session — read from the
  // secure keystore, so it answers offline too. It gates the offline
  // walkthrough and shows the expired-invite message after 30 days.
  useEffect(() => {
    let active = true;
    gatewayClient.savedAccessStatus().then((status) => { if (active) setSavedAccess(status); }).catch(() => { if (active) setSavedAccess('NONE'); });
    return () => { active = false; };
  }, [accessReady]);

  // P3 / AUTH-03: after an app restart, restore access from the refresh token
  // held in the Keychain/Keystore, so an evaluator does not need a new
  // single-use invitation. It is attempted whenever the gateway is reachable, so
  // a launch while offline recovers once connectivity returns. A failed restore
  // simply leaves the invite form; it never switches delivery mode (AUTH-15).
  useEffect(() => {
    let active = true;
    if (gatewayLive === 'UP' && !accessReady && !walkthroughOnly) {
      // Build 47 (M11): a restore the gateway refuses clears the saved session,
      // so re-read it; the invite form then returns instead of "waiting".
      const reread = () => gatewayClient.savedAccessStatus().then((status) => { if (active) setSavedAccess(status); }).catch(() => undefined);
      gatewayClient.restoreSession().then((restored) => { if (!active) return; if (restored) setAccessReady(true); else void reread(); }).catch(() => { void reread(); });
    }
    return () => { active = false; };
  }, [gatewayLive, accessReady, walkthroughOnly, setAccessReady]);

  // Baseline evidence for an active session that has none on screen: after a
  // restore, and after "New assessment" (resetCycle clears it). Kept apart from
  // the restore effect, whose own re-run (accessReady flipping) cancelled this
  // fetch and left a verified platform reading "Live Platform offline" (Gate 12
  // device finding). Display only: ReviewScreen re-attests before every live
  // submission.
  useEffect(() => {
    let active = true;
    if (gatewayLive === 'UP' && accessReady && !walkthroughOnly && attestation === null) {
      gatewayClient.checkAttestation()
        .then((evidence) => { if (active) setAttestation(evidence); })
        .catch((error) => { if (active) setFailure(toFailureState(error)); });
    }
    return () => { active = false; };
  }, [gatewayLive, accessReady, walkthroughOnly, attestation, setAttestation, setFailure]);

  const connect = async () => {
    if (walkthroughOnly) reset();
    setConnecting(true); setFailure(null); setAttestation(null);
    const submittedInvite = inviteCode;
    setInviteCode('');
    try {
      await gatewayClient.checkLive(); setGatewayLive('UP');
      const notice = await gatewayClient.redeemInvite(submittedInvite.trim());
      setAccessReady(true); setSavedAccess('ACTIVE');
      // Baseline evidence is fetched once, by the evidence effect above, which
      // runs as soon as access is ready (Build 45 also fetched it here — twice).
      // A first pairing is confirmed by the Welcome pop-up; the paired device
      // signing in again goes straight on.
      if (notice.pairing === 'NEW') { setPairingNotice(notice); navigation.navigate('Welcome'); }
      else navigation.navigate('Step1');
    } catch (error) {
      const nextFailure = toFailureState(error);
      setAccessReady(false);
      if (nextFailure.code === 'SERVICE_UNAVAILABLE') setGatewayLive('DOWN');
      setFailure(nextFailure);
    } finally { setConnecting(false); }
  };

  const disconnect = () => {
    gatewayClient.clearSession();
    setSavedAccess('NONE');
    setAccessReady(false);
    setAttestation(null);
    setFailure(null);
  };

  // Build 46 (Kraken, 13 Sept 2026): say before disconnecting that the invite
  // code will be needed again. The paired device can re-enter its own code;
  // the expiry does not move.
  const confirmDisconnect = () => Alert.alert(t('gatewayAccess:disconnect'), t('gatewayAccess:disconnectConfirmMessage'), [
    { text: t('common:cancel'), style: 'cancel' },
    { text: t('gatewayAccess:disconnectConfirmAction'), style: 'destructive', onPress: disconnect },
  ]);

  // Build 46: only a device with a saved, unexpired session may walk through,
  // online or offline, and doing so keeps that session (Kraken, 13 Sept 2026).
  const startWalkthrough = () => {
    reset();
    setDeliveryChoice('SYNTHETIC_DEMO');
    setAccessReady(false);
    setAttestation(null);
    setFailure(null);
    setWalkthroughOnly(true);
    navigation.navigate('Step1');
  };

  // Build 47 (M11): a device holding a saved, unexpired session is signed in even
  // while the server is unreachable, so it is not shown an empty invite field.
  const waitingForServer = !accessReady && !walkthroughOnly && savedAccess === 'ACTIVE';
  const retryLive = () => { setGatewayLive('UNKNOWN'); setLiveCheck((count) => count + 1); };

  // Build 46 pairing answers are shown in the evaluator's language.
  const failureText = (code: string, message: string) => code === 'SERVICE_UNAVAILABLE' ? t('gatewayAccess:notConnected')
    : code === 'INVITE_EXPIRED' ? t('gatewayAccess:inviteExpired')
      : code === 'DEVICE_NOT_AUTHORISED' ? t('gatewayAccess:incorrectDevice')
        : message;

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
      {/* Once access is active (redeemed, or restored after a restart) the
          single-use invitation is spent; showing an empty invite field then
          reads as "access lost" (Gate 12 device finding). */}
      {!accessReady && !waitingForServer && savedAccess !== 'UNKNOWN' ? <ACRCard title={t('gatewayAccess:inviteTitle')}>
        <ACRInput value={inviteCode} onChangeText={setInviteCode} secureTextEntry autoCapitalize="none" placeholder={t('gatewayAccess:invitePlaceholder')} hint={t('gatewayAccess:inviteHint')} />
      </ACRCard> : null}
      {waitingForServer ? <ACRCard title={t('build47:signedInTitle')}>
        <Text accessibilityRole="alert" style={[styles.hint, textStyle]}>{gatewayLive === 'DOWN' ? t('build47:waitingForServer') : t('build47:reconnecting')}</Text>
        <ACRButton title={t('common:retryCheck')} variant="secondary" onPress={retryLive} disabled={gatewayLive === 'UNKNOWN'} />
        <ACRButton title={t('gatewayAccess:disconnect')} variant="secondary" onPress={confirmDisconnect} />
      </ACRCard> : null}
      {accessReady ? <>
        <ACRButton title={t('common:next')} onPress={() => navigation.navigate('Step1')} />
        <ACRButton title={t('gatewayAccess:disconnect')} variant="secondary" onPress={confirmDisconnect} />
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
        {/* value is what the screen reader speaks; the badge is what is seen. */}
        <Row label={t('gatewayAccess:attestation')} valueComponent={attestation ? <ACRStateBadge state={attestation.verificationState} /> : undefined} value={attestation ? spokenState(attestation.verificationState) : t('common:emDash')} />
        {attestation ? <Text style={[styles.evidence, textStyle]}>{`${attestation.expected.logicalRuleCount}/${attestation.expected.physicalRuleCount}/${attestation.expected.activeRuleCount}/${attestation.expected.loadedRuleCount}/${attestation.expected.queryCount}`}</Text> : null}
        <Text style={[styles.connectionDetail, textStyle]}>{t('gatewayAccess:stateNoLocalInference')}</Text>
      </ACRCard>
      {gatewayLive === 'DOWN' ? <ACRStopBox title={t('gatewayAccess:notConnected')} message={t('gatewayAccess:serverAlert')} /> : null}
      {!accessReady && deliveryChoice === 'SYNTHETIC_DEMO' ? <>
        <ACRStopBox title={t('build44:fixtureUnavailable')} message={t('gatewayAccess:walkthroughNotice')} />
        {savedAccess === 'ACTIVE'
          ? <ACRButton title={t('gatewayAccess:continueOffline')} variant="secondary" onPress={startWalkthrough} />
          : <Text style={[styles.connectionDetail, textStyle]}>{t('gatewayAccess:walkthroughNeedsInvite')}</Text>}
      </> : null}
      {failure ? <View style={styles.error}><Text accessibilityRole="alert" style={[styles.errorText, textStyle]}>{failureText(failure.code, failure.message)}</Text></View> : null}
      {!failure && !accessReady && savedAccess === 'EXPIRED'
        ? <View style={styles.error}><Text accessibilityRole="alert" style={[styles.errorText, textStyle]}>{t('gatewayAccess:inviteExpired')}</Text></View>
        : null}
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
