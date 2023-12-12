import type { PropsWithChildren, ReactNode } from 'react';

export type OnboardingStep = 'enter' | 'unfold' | 'edgeless-switch';
export type ArticleId = '0' | '1' | '2' | '3' | '4';
export type EdgelessSwitchMode = 'edgeless' | 'page';

/**
 * Paper enter animation options
 */
export interface PaperEnterOptions {
  // animation-curve
  curveCenter: number;
  curve: number;

  // animation-move
  fromZ: number;
  fromX: number;
  fromY: number;
  fromRotateX: number;
  fromRotateY: number;
  fromRotateZ: number;
  toZ: number;
  toRotateZ: number;

  // move-in animation config
  duration: number | string;
  delay: number;
  easing: string;
}

export interface ArticleOption {
  /** article id */
  id: ArticleId;

  /** paper enter animation content */
  brief: ReactNode;

  /** paper enter animation configuration */
  enterOptions: PaperEnterOptions;

  /** Locate paper */
  location: {
    /** offset X */
    x: number;
    /** offset Y */
    y: number;
  };

  /** content that contains edgeless info */
  blocks: OnboardingBlockOption[];
}

export interface OnboardingBlockOption extends PropsWithChildren {
  /**
   * if set, will apply special background styled for edgeless mode
   */
  bg?: string;
  /**
   * only show in edgeless mode
   */
  edgelessOnly?: boolean;
  /** apply transform */
  offset?: { x?: number; y?: number };
  /** apply absolute position for edgeless mode */
  position?: { x?: number; y?: number };
  /** apply absolute position for page mode */
  fromPosition?: { x?: number; y?: number };
  /** enter delay in ms */
  enterDelay?: number;
  /** leave delay in ms */
  leaveDelay?: number;
}
