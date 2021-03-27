import React, { useEffect } from 'react';
import { AnalysisPane } from './analysis';
import { UtilsPane } from './utils';
import { ServerPane } from './server';
import { ClientPane } from './client';
import { RecordPane } from './record';

import '../assets/css/frame.less';
import { FeatureMapPane } from './featureMap';
import { DiagnosisPane } from './analysis/projection';
import { ImpactPane } from './impact';

export default function AppPane(): JSX.Element {
  return (
    <div>
      <ServerPane />
      <AnalysisPane />
      <RecordPane />
      <DiagnosisPane />
      <ClientPane />
      <FeatureMapPane />
      <ImpactPane />
      <UtilsPane />
    </div>
  );
}
