export type NatureType = ''|'Malicious' | 'Non-Malicious';
export type DecisionType = ''|'Add to Blacklist' | 'Adjust Weight';

export interface Record {
  nature: NatureType,
  decision: DecisionType,
  warningVisible: boolean
};

export const DEFAULT_RECORD: Record = {
  nature: '',
  decision: '',
  warningVisible: false
};
