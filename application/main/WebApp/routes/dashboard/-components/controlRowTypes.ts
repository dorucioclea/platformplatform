export type ControlRowProps = {
  suffix: string;
  label?: boolean;
  tooltip?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  showIcon?: boolean;
};

export type ControlRowDerivedProps = ControlRowProps & {
  hasValues: boolean;
  tooltipText: string | undefined;
  errorMessage: string | undefined;
};
