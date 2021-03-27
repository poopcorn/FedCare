import React from 'react';
import * as d3 from 'd3';
import { connect } from 'react-redux';
import { State, Utils } from '../../types';
import { createDispatchHandler, ActionHandler } from '../../actions/redux-action';
import { UtilsAction } from '../../actions/utils';

import './utils.css';

const focusProjection = (ids: number[]) => {
    if (ids.length == 0) {
        d3.selectAll('.client-rect').classed('not_possible', false);
    }
    else {
        d3.selectAll('.client-rect').classed('not_possible', true).classed('possible', false);
    }
    ids.forEach(id => {
        d3.select(`#client-rect-${id}`).classed('not_possible', false).classed('possible', true);
    });
};
export interface UtilsProps extends ActionHandler<UtilsAction> {
    clientSelected: number[]
};
function UtilsPaneBase(props: UtilsProps): JSX.Element {
    const { clientSelected } = props;
    focusProjection(clientSelected);
    return <div></div>;
}

const mapStateToProps = (state: State) => ({
    clientSelected: state.Analysis.clientSelected
});
export const UtilsPane = connect(
    mapStateToProps,
    createDispatchHandler<UtilsAction>(),
)(UtilsPaneBase);