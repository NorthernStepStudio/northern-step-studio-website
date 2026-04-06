import { useState } from 'react';
import { ProfilePanel } from './ProfilePanel';
import { TwilioSetupPanel } from './TwilioSetupPanel';
import type { 
  ProfileDraft, 
  TwilioDraft, 
  RevenueWorkspace, 
  RequestState, 
  ValidationState,
  BusinessHoursSchedule
} from '../types';

interface OnboardingWizardProps {
  profileDraft: ProfileDraft;
  onProfileChange: React.Dispatch<React.SetStateAction<ProfileDraft>>;
  profileHours: BusinessHoursSchedule | undefined;
  onProfileHoursChange: React.Dispatch<React.SetStateAction<BusinessHoursSchedule | undefined>>;
  twilioDraft: TwilioDraft;
  onTwilioChange: React.Dispatch<React.SetStateAction<TwilioDraft>>;
  workspace: RevenueWorkspace | null;
  requestState: RequestState;
  validation: ValidationState;
  onAutoFill: () => Promise<void>;
  onGenerateAi: () => void;
  onApplyAi: () => void;
  onSaveBusiness: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onValidateTwilio: () => Promise<void>;
  onBootstrapTwilio: () => Promise<void>;
  connection: any;
  twilioLive: boolean;
  twilioSetupLocked: boolean;
  twilioMaintenanceMode: boolean;
  twilioSectionTitle: string;
  twilioSectionCopy: string;
  onCopyWebhook: () => Promise<void>;
  onSendTestMissedCall: () => Promise<void>;
  setTwilioMaintenanceUnlocked: React.Dispatch<React.SetStateAction<boolean>>;
  setValidation: React.Dispatch<React.SetStateAction<ValidationState>>;
  webhookUrl: string;
  twilioRequirements: string[];
  twilioSetupGuide: any[];
  twilioTrialChecklist: string[];
  firstLiveTestChecklist: string[];
}

export function OnboardingWizard(props: OnboardingWizardProps) {
  const [step, setStep] = useState(1);

  return (
    <div className="wizard-container">
      <div className="setup-tabs">
        <button 
          className={`tab-button ${step === 1 ? 'active' : ''}`} 
          onClick={() => setStep(1)}
        >
          1. Profile
        </button>
        <button 
          className={`tab-button ${step === 2 ? 'active' : ''}`} 
          onClick={() => setStep(2)}
        >
          2. Connectivity
        </button>
      </div>

      <div className="setup-content">
        {step === 1 && (
          <ProfilePanel
            profileDraft={props.profileDraft}
            setProfileDraft={props.onProfileChange}
            setProfileDraftWithReplySync={(updater, sync) => {
              const current = props.profileDraft;
              const next = updater(current);
              props.onProfileChange(next);
            }}
            requestState={props.requestState}
            workspace={props.workspace}
            businessNumberLocked={false}
            onSaveBusiness={props.onSaveBusiness}
            onAutoFillFromWebsite={props.onAutoFill}
            discoveryResult={null}
          />
        )}
        {step === 2 && (
          <TwilioSetupPanel
            twilioDraft={props.twilioDraft}
            setTwilioDraft={props.onTwilioChange}
            validation={props.validation}
            requestState={props.requestState}
            workspace={props.workspace}
            connection={props.connection}
            twilioLive={props.twilioLive}
            twilioSetupLocked={props.twilioSetupLocked}
            twilioMaintenanceMode={props.twilioMaintenanceMode}
            twilioSectionTitle={props.twilioSectionTitle}
            twilioSectionCopy={props.twilioSectionCopy}
            onValidateTwilio={props.onValidateTwilio}
            onConnectTwilio={props.onBootstrapTwilio}
            onCopyWebhook={props.onCopyWebhook}
            onSendTestMissedCall={props.onSendTestMissedCall}
            setTwilioMaintenanceUnlocked={props.setTwilioMaintenanceUnlocked}
            setValidation={props.setValidation}
            webhookUrl={props.webhookUrl}
            twilioRequirements={props.twilioRequirements}
            twilioSetupGuide={props.twilioRequirements}
            twilioTrialChecklist={props.twilioTrialChecklist}
            firstLiveTestChecklist={props.firstLiveTestChecklist}
          />
        )}
      </div>

      <div className="wizard-footer">
        {step > 1 && (
          <button className="action-button" onClick={() => setStep(step - 1)}>
            Back
          </button>
        )}
        {step < 2 && (
          <button className="action-button primary" onClick={() => setStep(step + 1)}>
            Next Step
          </button>
        )}
      </div>
    </div>
  );
}
