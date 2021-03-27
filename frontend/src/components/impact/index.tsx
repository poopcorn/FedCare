import React from 'react';
import { connect } from 'react-redux';
import { State } from '../../types';

import './impact.less';
import impactIcon from '../../assets/icons/impact.svg';
import { ActionHandler, createDispatchHandler } from '../../actions/redux-action';
import { ImpactAction, SET_SELECTED_ID } from '../../actions';
import { GradientPane } from './gradient';
import { BehaviorPane } from './behavior';
import { NeighborPane } from './neighbor';
export interface ImpactProps extends ActionHandler<ImpactAction> {
  clientIds: number[];
  selectedId: number;
}
function ImpactPaneBase(props: ImpactProps): JSX.Element {
  const { selectedId, clientIds } = props;
  return (
    <div className="Frame ImpactView">
      <div className="title">
        <img src={impactIcon} className="svg-class" />
        <p>IMPACT</p>
        <div className="impact-tabs">
          {clientIds.map((id) => (
            <div
              onClick={() => {
                props.handleAction({
                  type: SET_SELECTED_ID,
                  payload: {
                    id: id
                  }
                });
              }}
              key={id}
              style={id === selectedId ? { borderBottom: '4px solid #2A7EC7' } : {}}
            >
              {'C' + id}
            </div>
          ))}
        </div>
      </div>
      <div className="impact-main-div">
        <GradientPane clientId={selectedId} />
        <BehaviorPane clientId={selectedId} />
        <NeighborPane clientId={selectedId} />
      </div>
    </div>
  );
}
const mapStateToProps = (state: State) => ({
  clientIds: state.Impact.clientIds,
  selectedId: state.Impact.selectedClient
});
export const ImpactPane = connect(
  mapStateToProps,
  createDispatchHandler<ImpactAction>()
)(ImpactPaneBase);
