import { ClientAction } from './client';
import { AnalysisAction } from './analysis';
import { UtilsAction } from './utils';
import { ServerAction } from './server';
import { FeatureAction } from './feature';
import { ImpactAction } from './impact';
import { RecordAction } from './record';

export * from './client';
export * from './analysis';
export * from './utils';
export * from './server';
export * from './feature';
export * from './impact';
export * from './record';

export type Action = (
    ClientAction |
    AnalysisAction |
    FeatureAction |
    UtilsAction |
    ServerAction |
    ImpactAction |
    RecordAction
);
