import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { ServerPlotPane } from './serverplot';
import { BrushPane } from './brushplot';
import serverSvg from '../../assets/icons/server.svg';
import performanceSvg from '../../assets/icons/performance.svg';
import { PerformancePane } from './performance';
import { ActionHandler, createDispatchHandler } from '../../actions/redux-action';
import { ServerAction } from '../../actions';
import { PerformanceRes, State } from '../../types';

export interface ServerProps extends ActionHandler<ServerAction> {
  curRound: number;
  roundDisplay: number[];
  performanceRes: PerformanceRes[];
  showRoundNum: number;
  totalround: number;
}
// @ts-ignore
window.TIME_INTERVAL = 60000;
let lastUpdate = new Date();

export function ServerPaneBase(props: ServerProps): JSX.Element {
  const { curRound, roundDisplay, performanceRes, showRoundNum, totalround } = props;
  const [currentTotalRound, setCurrentTotalRound] = useState<number>(20);
  const currentTotalRoundRef = useRef(currentTotalRound);
  currentTotalRoundRef.current = currentTotalRound;
  const roundDisplayRef = useRef(roundDisplay);
  roundDisplayRef.current = roundDisplay;
  const CHART_HEIGHT = 230;
  const CHART_WIDTH = 450;

  useEffect(() => {
    setInterval(() => {
      // @ts-ignore
      if (roundDisplayRef.current.length > 0 && currentTotalRoundRef.current < totalround && (new Date() - lastUpdate) > window.TIME_INTERVAL){
        setCurrentTotalRound(currentTotalRoundRef.current + 1);
        lastUpdate = new Date();
      }
      // @ts-ignore
    }, 100);
  }, []);

  return (
    <div>
      <div className="Frame ServerView">
        <div className="title">
          <img src={serverSvg} className="svg-class"></img>
          <p>SERVER</p>
        </div>
        <ServerPlotPane />
      </div>
      <div className="Frame PerformanceView">
        <div className="title">
          <img src={performanceSvg} className="svg-class1"></img>
          <p>PERFORMANCE</p>
        </div>
        <PerformancePane
          curRound={curRound}
          rounds={roundDisplay}
          performanceRes={performanceRes}
          height={CHART_HEIGHT}
          width={CHART_WIDTH}
          showRoundNum={showRoundNum}
          totalround={currentTotalRoundRef.current}
        />
        <BrushPane
          width={CHART_WIDTH}
          performanceRes={performanceRes}
          totalround={currentTotalRoundRef.current}
        />
      </div>
    </div>
  );
}

const mapStateToProps = (state: State) => ({
  curRound: state.Server.round,
  roundDisplay: state.Server.roundDisplay,
  performanceRes: state.Server.performanceRes,
  showRoundNum: state.Server.showRoundNum,
  totalround: state.Server.totalround
});
export const ServerPane = connect(
  mapStateToProps,
  createDispatchHandler<ServerAction>()
)(ServerPaneBase);
