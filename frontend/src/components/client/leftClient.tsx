import $ from 'jquery';
import * as d3 from 'd3';
import React from 'react';
import { connect } from 'react-redux';
import { createDispatchHandler, ActionHandler } from '../../actions/redux-action';
import { ClientAction } from '../../actions';
import selectedSvg from '../../assets/icons/selected_client.svg';
import unselectedSvg from '../../assets/icons/unselected_client.svg';
import suggestSvg from '../../assets/icons/suggested_client.svg';

import './leftClient.less';
import { ClientState } from '../../types';

export interface LeftClientProps extends ActionHandler<ClientAction> {
  clientFilter: boolean[];
  clientSort: number[];
  clientState: ClientState[];
  weight: number[];
  height: number;
  offsetY: number;
  extend: boolean;
  suggestedAdversary: Set<number>;
  favoriteClientIds: Set<number>;
  hoveredClientId: number | null;
}
function LeftClientPaneBase(props: LeftClientProps): JSX.Element {
  const {
    clientFilter,
    clientSort,
    clientState,
    height,
    offsetY,
    weight,
    extend,
    suggestedAdversary,
    favoriteClientIds,
    hoveredClientId
  } = props;
  const allWeight = weight.length > 0 ? weight.reduce((a, b) => a + b) : 0;
  return (
    <div className="left-client-div" style={{ height: extend ? '380px' : '490px' }}>
      <div className="left-client-title">
        <div className="left-client-sub-row"></div>
        <div className="left-client-sub-row">Weight</div>
        <div className="left-client-sub-row">Id</div>
      </div>
      <div className="left-client-main-div">
        {clientSort.map((clientId, id) => {
          if (clientFilter[clientId] == false) {
            return null;
          }
          const arc =
            d3.arc()({
              innerRadius: 0,
              outerRadius: 10,
              startAngle: 0,
              endAngle: (weight[clientId] / allWeight) * Math.PI * 2 || 0
            }) || '';
          const style = {
            height: height,
            top: offsetY,
            background: favoriteClientIds.has(clientId) || hoveredClientId === clientId ? '#ececec' : ''
          };
          return (
            <div key={clientId} className="left-client-col" style={style}>
              <div className="left-client-sub-col">
                <img
                  src={
                    suggestedAdversary.has(clientId)
                      ? suggestSvg
                      : clientState[clientId]?.isSelected
                      ? selectedSvg
                      : unselectedSvg
                  }
                  id={`left-client-hidden-${clientId}`}
                  className="let-client-hidden-img"
                  style={{ margin: '27.5px 0', width: '20px' }}
                />
              </div>

              <div className="left-client-sub-col">
                <svg>
                  <circle cx={20} cy={37.5} r={10} />
                  <path d={arc} transform="translate(20, 37.5)" />
                </svg>
              </div>

              <div className="left-client-sub-col" style={{ lineHeight: height + 'px' }}>
                {clientId}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const LeftClientPane = connect(
  null,
  createDispatchHandler<ClientAction>()
)(LeftClientPaneBase);
