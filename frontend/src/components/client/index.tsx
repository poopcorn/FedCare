import $ from 'jquery';
import React, { useEffect, useState, useMemo } from 'react';
import { connect } from 'react-redux';
import { ClientAvgRes, ClientRes, ClientState, RoundRes, State } from '../../types';
import { createDispatchHandler, ActionHandler } from '../../actions/redux-action';
import { ClientAction, INIT_CLIENT_DATA } from '../../actions';

import './client.less';
import { LeftClientPane } from './leftClient';

import clientSvg from '../../assets/icons/client.svg';
import selectSvg from '../../assets/icons/select.svg';
import filterSvg from '../../assets/icons/filter.svg';
import checkBoxSvg from '../../assets/icons/check_box.svg';
import checkReverseSvg from '../../assets/icons/check_reverse.svg';
import rankSvg from '../../assets/icons/rank.svg';
import rankHighlightSvg from '../../assets/icons/rank_highlight.svg';
import selectedSvg from '../../assets/icons/selected_client.svg';
import unselectedSvg from '../../assets/icons/unselected_client.svg';
import suggestSvg from '../../assets/icons/suggested_client.svg';
import upArrow from '../../assets/icons/up_arrow.svg';
import downArrow from '../../assets/icons/down_arrow.svg';

import { RightClientPane } from './rightClient';
import { ArrayRemove, sum } from '../utils/math';
import { AdversaryPane } from './detection';
import * as d3 from 'd3';

export interface sortProps {
  visible: boolean;
  list: string[];
  selected: {
    id: number;
    isAscending: boolean;
  };
  setSelected: Function;
}
function SortPane(props: sortProps): JSX.Element {
  const { visible, list, selected, setSelected } = props;
  return (
    <div className="client-sort-div" style={{ visibility: visible ? 'visible' : 'hidden' }}>
      {list.map((v, i) => (
        <div
          key={i}
          className="client-utils-sub-div"
          style={{ lineHeight: '30px' }}
          onClick={() => {
            setSelected({
              id: i,
              isAscending: i != selected.id || !selected.isAscending
            });
          }}
        >
          <img
            id={`client-sort-${i}`}
            src={i == selected.id ? (selected.isAscending ? upArrow : downArrow) : rankSvg}
            className="client-utils-img"
          />
          <p>{v}</p>
        </div>
      ))}
    </div>
  );
}

export interface filterProps {
  filter: boolean[];
  visible: boolean;
  checkClick: Function;
}
function FilterPane(props: filterProps): JSX.Element {
  const { filter, visible } = props;
  return (
    <div className="client-filter-div" style={{ visibility: visible ? 'visible' : 'hidden' }}>
      {filter.map((v, i) => (
        <div
          key={i}
          className="client-utils-sub-div"
          style={{ lineHeight: '25px' }}
          onClick={() => {
            if (v == true) {
              $(`#client-check-${i}`).attr('src', checkReverseSvg);
            } else {
              $(`#client-check-${i}`).attr('src', checkBoxSvg);
            }
            props.checkClick(i);
          }}
        >
          <img
            id={`client-check-${i}`}
            src={v ? checkBoxSvg : checkReverseSvg}
            className="client-utils-img"
          />
          <p>{`C${i + 1}`}</p>
        </div>
      ))}
    </div>
  );
}
export interface ClientProps extends ActionHandler<ClientAction> {
  dataset: string;
  clientNum: number;
  roundShow: number[];
  roundRes: RoundRes[];
  weight: number[];
  clientRes: ClientRes[];
  clientState: ClientState[];
  selectedRound: number;
  extend: boolean;
  suggestedAdversary: Set<number>;
  favoriteClientIds: Set<number>;
  hoveredClientId: number | null;
}

const ROW_HEIGHT = 75;
const ROW_WIDTH = 72;

const sortFunction = (
  a: ClientAvgRes,
  b: ClientAvgRes,
  func: string,
  isAscending = true
): number => {
  const rate = isAscending ? 1 : -1;
  switch (func) {
    case 'Weight':
      return rate * (a.weight - b.weight);
    case 'ACC':
      return rate * (a.accuracy - b.accuracy);
    case 'Loss':
      return rate * (a.loss - b.loss);
    case 'Anomaly':
      return rate * (a.anomaly - b.anomaly);
    case 'Contribution':
      return rate * (a.contribution - b.contribution);
    case 'ID':
      return rate * (a.id - b.id);
    default:
      return 0;
  }
};

function ClientPaneBase(props: ClientProps): JSX.Element {
  const {
    clientNum,
    roundShow,
    roundRes,
    clientRes,
    clientState,
    selectedRound,
    weight,
    extend,
    suggestedAdversary,
    favoriteClientIds,
    hoveredClientId,
    dataset
  } = props;
  const [clientFilter, setclientFilter] = useState(new Array(clientNum).fill(true));
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [sortSelect, setSortSelect] = useState({
    id: 0,
    isAscending: true
  });
  const [leftOffsetY, setOffsetY] = useState(0);
  const setOffsetYFunc = (y: number) => setOffsetY(y);

  // reset
  useEffect(() => {
    setclientFilter(new Array(clientNum).fill(true));
  }, [roundShow]);

  // calculate new sort
  // @TODO finish sort
  const sortFunc = ['ID', 'ACC', 'Anomaly', 'Weight', 'Loss', 'Contribution'];
  const clientAvgRes = useMemo(() => {
    if (!(weight.length && roundRes.length && clientRes.length)) {
      return new Array(clientNum).fill(0).map((v, i) => ({
        id: i,
        accuracy: 0,
        loss: 0,
        anomaly: 0,
        contribution: 0
      }));
    }
    const clientAvgRes: ClientAvgRes[] = [];
    for (let i = 0; i < clientNum; i++) {
      clientAvgRes.push({
        id: i,
        accuracy: sum(clientRes[i].performanceRes.map((v) => v.train.accuracy)),
        loss: sum(clientRes[i].performanceRes.map((v) => v.train.loss)),
        weight: weight[i],
        anomaly: sum(roundRes.map((v) => sum(v.anomaly.value[i].vector))),
        contribution: sum(roundRes.map((v) => sum(v.contribution.value[i].vector)))
      });
    }
    clientAvgRes.sort((a, b) =>
      sortFunction(a, b, sortFunc[sortSelect.id], sortSelect.isAscending)
    );
    return clientAvgRes;
  }, [clientNum, clientRes, roundRes, sortSelect, weight]);

  let clientSort = clientAvgRes.map((v) => v.id);
  if (favoriteClientIds.size > 0) {
    Array.from(favoriteClientIds).forEach((id) => {
      const index = clientSort.indexOf(id);
      clientSort = ArrayRemove(clientSort, index);
      clientSort.unshift(id);
    });
  }
  const clientHiddenClick = (id: number) => {
    clientFilter[id] = !clientFilter[id];
    setclientFilter(clientFilter.concat());
  };

  const setSelectedClick = (v: { id: number; isAscending: boolean }) => setSortSelect({ ...v });

  //图例

  const svg = d3
    .select('.client-legendsvg')
    .attr('width', '490px')
    .attr('height', '20px');
  svg.selectAll('*').remove();

  let accuracylegend = svg
    .append('g')
    .classed('accuracylegend', true)
    .attr('transform', `translate(7,5)`);

  accuracylegend
    .append('rect')
    .attr('stroke-width', 2)
    .attr('stroke', '#f4b95e')
    .attr('fill', '#f4b95e')
    .attr('transform', `translate(0,1)`)
    .attr('width', 10)
    .attr('height', 8);

  accuracylegend
    .append('text')
    .attr('font-size', '0.75em')
    .attr('text-anchor', 'start')
    .attr('dy', 9.5)
    .attr('dx', 19)
    .text('Accuracy');

  let losslegend = svg
    .append('g')
    .classed('losslegend', true)
    .attr('transform', `translate(167,5)`);

  losslegend
    .append('rect')
    .attr('stroke-width', 2)
    .attr('stroke', '#bbb6d7')
    .attr('fill', '#bbb6d7')
    .attr('transform', `translate(0,1)`)
    .attr('width', 10)
    .attr('height', 8);

  losslegend
    .append('text')
    .attr('font-size', '0.75em')
    .attr('text-anchor', 'start')
    .attr('dy', 9.5)
    .attr('dx', 19)
    .text('Loss');

  return (
    <div className="Frame ClientView">
      <div className="title">
        <img src={clientSvg} className="svg-class"></img>
        <p>CLIENT</p>
        <div className="right-title">
          <img src={selectSvg} onClick={() => setShowFilter(!showFilter)} />
          <img src={filterSvg} onClick={() => setShowSort(!showSort)} />
        </div>
      </div>

      <div className="client-main-div" style={{ height: extend ? '380px' : '490px' }}>
        <LeftClientPane
          clientFilter={clientFilter}
          clientSort={clientSort}
          clientState={clientState}
          height={ROW_HEIGHT}
          weight={weight}
          offsetY={leftOffsetY}
          extend={extend}
          suggestedAdversary={suggestedAdversary}
          favoriteClientIds={favoriteClientIds}
          hoveredClientId={hoveredClientId}
        />
        <RightClientPane
          clientRes={clientRes}
          clientFilter={clientFilter}
          clientSort={clientSort}
          clientState={clientState}
          roundRes={roundRes}
          rounds={roundShow}
          curRound={selectedRound}
          height={ROW_HEIGHT}
          width={ROW_WIDTH}
          setOffsetY={setOffsetYFunc}
          extend={extend}
          favoriteClientIds={favoriteClientIds}
          hoveredClientId={hoveredClientId}
          dataset={dataset}
        />
      </div>
      <div className="client-legend-div2">
        <svg className="client-legendsvg"></svg>
      </div>
      <div className="client-legend-div">
        <div className="client-sub-legend-div">
          <img src={selectedSvg} />
          <p>Selected Client </p>
        </div>
        <div className="client-sub-legend-div">
          <img src={unselectedSvg} />
          <p>Unselected Client </p>
        </div>
        <div className="client-sub-legend-div">
          <img src={suggestSvg} />
          <p>Relevant Clients</p>
        </div>
      </div>
      <div className="client-adversary">
        <AdversaryPane />
      </div>
      <FilterPane visible={showFilter} filter={clientFilter} checkClick={clientHiddenClick} />
      <SortPane
        visible={showSort}
        list={sortFunc}
        selected={sortSelect}
        setSelected={setSelectedClick}
      />
    </div>
  );
}

const mapStateToProps = (state: State) => ({
  dataset: state.Server.dataset,
  clientNum: state.Server.clientNum,
  roundShow: state.Client.roundShow,
  roundRes: state.Client.roundRes,
  weight: state.Client.weight,
  clientRes: state.Client.clientRes,
  clientState: state.Client.clientState,
  selectedRound: state.Client.selectedRound,
  favoriteClientIds: state.Client.favoriteClietnIds,
  hoveredClientId: state.Client.hoveredClientId,
  extend: state.Client.extend,
  suggestedAdversary: state.Client.suggestedAdversary
});
export const ClientPane = connect(
  mapStateToProps,
  createDispatchHandler<ClientAction>()
)(ClientPaneBase);
