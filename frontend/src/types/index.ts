import {Client} from './client';
import {Analysis} from './analysis';
import { Utils } from './utils';
import { Server } from './server';
import { FeatureMap } from './feature';
import { Impact } from './impact';
import { Record } from './record';

export * from './client';
export * from './analysis';
export * from './utils';
export * from './feature';
export * from './server';
export * from './impact';
export * from './record';

/**
 * Application state.
 */
export interface State {
    Server: Server,
    Client: Client,
    Analysis: Analysis,
    Utils: Utils,
    Feature: FeatureMap,
    Impact: Impact,
    Record: Record;
};
