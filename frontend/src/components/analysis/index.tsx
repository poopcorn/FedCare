import React from 'react';
import { connect } from 'react-redux';
import { State, Metric } from '../../types';
import { createDispatchHandler } from "../../actions/redux-action";
import { AnalysisAction, ServerAction } from '../../actions';
import analysisSvg from '../../assets/icons/method.svg';

import './analysis.css';
import { MetricsPane } from './metrics';
export interface AnalysisProps  {
  curRound: number,
  clientNum: number,
  anomaly: Metric,
  anomalyFilter: boolean[],
  contribution: Metric,
  contributionFilter: boolean[],
  hoveredClientId: number | null,
};
function AnalysisPaneBase(props: AnalysisProps): JSX.Element {
  return (
    <div className='Frame AnalysisView'>
      <div className='title'>
        <img src={analysisSvg} className='svg-class'></img>
        <p>METRIC VIEW</p>
      </div>
      <div className='analysisi-main'>
        <MetricsPane
          type={'Anomaly'}
          data={props.anomaly}
          filter={props.anomalyFilter}
          round={props.curRound}
          hoveredClientId={props.hoveredClientId}
        />
        <div className='segment-div'></div>
        <MetricsPane
          type={'Contribution'}
          data={props.contribution}
          filter={props.contributionFilter}
          round={props.curRound}
          hoveredClientId={props.hoveredClientId}
        />
      </div>
    </div>
  );
}

const mapStateToProps = (state: State) => ({
  clientNum: state.Server.clientNum,
  curRound: state.Client.selectedRound,
  anomaly: state.Analysis.anomaly,
  anomalyFilter: state.Analysis.anomalyFilter,
  contribution: state.Analysis.contribution,
  contributionFilter: state.Analysis.contributionFilter,
  hoveredClientId: state.Client.hoveredClientId
});
export const AnalysisPane = connect(
  mapStateToProps,
  createDispatchHandler<AnalysisAction | ServerAction>()
)(AnalysisPaneBase);
