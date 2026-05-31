import { ComponentType } from 'react';

export type WelcomeStat = {
  value: string;
  labelKey: string;
};

export type WelcomeFeature = {
  Icon: ComponentType<{ size?: number; color?: string }>;
  color: string;
  labelKey: string;
  subKey: string;
};

export type WelcomeComponentProps = {
  onGetStarted: () => void;
  onSignIn: () => void;
  onTerms: () => void;
  onPrivacy: () => void;
};
