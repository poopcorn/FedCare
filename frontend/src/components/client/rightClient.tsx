import * as d3 from 'd3';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { ClientRes, ClientState, COMPUTE_TIME_MAX, RoundRes } from '../../types';
import { createDispatchHandler, ActionHandler } from '../../actions/redux-action';
import { ClientAction } from '../../actions';

import './rightClient.less';

const drawComputeLine = (time: number, width: number, height: number): string => {
  const perimeter = (width + height) * 2;
  const length = time / COMPUTE_TIME_MAX * perimeter;
  if (length > width * 2 + height) {
    const diff = length - width * 2 - height;
    return `M0 0 H ${width} V ${height} H 0 V ${height - diff}`;
  }
  if (length > width + height) {
    const diff = length - width - height;
    return `M0 0 H ${width} V ${height} H ${width - diff}`;
  }
  if (length > width) {
    const diff = length - width;
    return `M0 0 H ${width} V ${diff}`;
  }
  return `M0 0 H ${length}`;
}

export interface RightClientProps extends ActionHandler<ClientAction> {
  clientRes: ClientRes[];
  clientFilter: boolean[];
  roundRes: RoundRes[];
  clientSort: number[];
  clientState: ClientState[];
  rounds: number[];
  curRound: number;
  height: number;
  width: number;
  setOffsetY: Function;
  extend: boolean;
  favoriteClientIds: Set<number>;
  hoveredClientId: number | null;
  dataset: string;
}
function RightClientPaneBase(props: RightClientProps): JSX.Element {
  const {
    clientRes,
    clientFilter,
    clientSort,
    clientState,
    roundRes,
    rounds,
    curRound,
    height,
    width,
    favoriteClientIds,
    extend,
    hoveredClientId,
    dataset
  } = props;
  const [scrollLeft, setScrollLeft] = useState(0);

  const roundsNum = rounds.length;
  const rowWidth = Math.max(340, roundsNum * width);

  const PADDING = 7;
  const BACKGOURND_FILL = '#2a7ec7';
  const cellWidth = width - PADDING * 2;
  const cellHeight = height - PADDING * 2;

  const ACC_DOMAIN = dataset === 'FEMNIST' ? [0, 0.95] : [0, 0.85];
  const LOSS_DOMAIN =  dataset === 'FEMNIST' ? [0, 5.2] : [0, 4.1];
  const accuracy = d3
    .scaleLinear()
    .domain(ACC_DOMAIN)
    .range([0, cellHeight]);
  const loss = d3
    .scaleLinear()
    .domain(LOSS_DOMAIN)
    .range([0, cellHeight]);
  const subWidth = cellWidth / 5;

  return (
    <div className="right-client-div">
      <div className="right-client-title" style={{ width: rowWidth, marginLeft: scrollLeft }}>
        {rounds.map((round) => (
          <div
            key={round}
            className="right-client-sub-title"
            style={{
              background: round == curRound ? BACKGOURND_FILL : '',
              fontWeight: round == curRound ? 'bold' : 'normal',
              color: round == curRound ? '#ffffff' : ''
            }}
            onClick={() => {
              props.handleAction({
                type: 'SET_ANALYSIS_ROUND',
                payload: {
                  round
                }
              });
            }}
          >
            {round}
          </div>
        ))}
      </div>
      <div
        className="right-client-main-div"
        style={{ height: extend ? '365px' : '465px' }}
        onScroll={(e: any) => {
          const scrollTop = e.currentTarget.scrollTop;
          props.setOffsetY(-scrollTop);
          setScrollLeft(-e.currentTarget.scrollLeft);
        }}
      >
        {clientSort.map((clientId) => {
          if (clientFilter[clientId] == false) {
            return null;
          }
          const style = {
            height: height,
            width: rowWidth,
            background:
              favoriteClientIds.has(clientId) || hoveredClientId === clientId ? '#ececec' : ''
          };
          return (
            <div key={clientId} className="right-client-col" style={style}>
              <svg
                className="right-client-svg"
                id={`right-client-svg-${clientId}`}
                style={{
                  height: height,
                  width: rowWidth
                }}
              >
                {rounds.map((round, col) => {
                  const offsetX = col * width + PADDING;
                  const transform = `translate(${offsetX}px, ${PADDING}px)`;
                  const accuracyHeight = accuracy(
                    clientRes[clientId].performanceRes[col].train.accuracy
                  );
                  const lossHeight = loss(clientRes[clientId].performanceRes[col].train.loss);
                  const color = roundRes[col].clientsArea[clientId].fill;
                  const time = clientRes[clientId].performanceRes[col].communicationTime;
                  const computeTimeLine = drawComputeLine(time, cellWidth, cellHeight);
                  return (
                    <g key={round} style={{ transform }}>
                      <rect
                        width={cellWidth}
                        height={cellHeight}
                        style={{
                          stroke: color,
                          fill: 'none',
                          strokeWidth: '1px'
                        }}
                      />
                      <path d={computeTimeLine} style={{
                        stroke: color,
                        fill: 'none',
                        strokeWidth: '4px'
                      }} />
                      <rect
                        x={subWidth}
                        y={cellHeight - accuracyHeight}
                        width={subWidth}
                        height={accuracyHeight < 60 ? accuracyHeight : 60}
                        fill="#f4b95e"
                        stroke="none"
                      />
                      <rect
                        x={subWidth * 3}
                        y={cellHeight - lossHeight}
                        width={subWidth}
                        height={lossHeight < 60 ? lossHeight : 60}
                        fill="#bbb6d7"
                        stroke="none"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const RightClientPane = connect(
  null,
  createDispatchHandler<ClientAction>()
)(RightClientPaneBase);
