import * as d3 from 'd3';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  AggregatedFeatureMap,
  ClientFeatureMap,
  FeatureCluster,
  LayerType,
  OneLayer,
  State
} from '../../types';
import { createDispatchHandler, ActionHandler } from '../../actions/redux-action';
import { CHANGE_IS_FOLD, FeatureAction, SetFeatureK, SET_FEATURE_K } from '../../actions';

import './feature.less';
import featureSvg from '../../assets/icons/feature.svg';
import leftSwitch from '../../assets/icons/switchLeft.svg';
import rightSwitch from '../../assets/icons/switchRight.svg';
import selectedIcon from '../../assets/icons/selected_client.svg';
import { calculate2DimAvg } from '../utils/math';

const DEFAULTE_FEATURE_COL_WIDTH = 80;
const DEFAULTE_FEATURE_ROW_HEIGHT = 70;
const DEFAULTE_FEATURE_CELL = 60;
const DEFAULTE_RECT_CELL = 12;
interface FeatureRowData {
  clientId: number;
  data: OneLayer[]; // This Round
  object: OneLayer[]; // Last Round / Aggregated Graidents
}

interface HeatMapProps {
  allData: OneLayer[];
  objectData: OneLayer[];
  cluster: number[];
  isFold: boolean;
  changeFunc: Function;
  scale: number[];
}

const featureMapType = [
  {
    name: 'Local Increment',
    value: 'LastRound'
  },
  {
    name: 'Global Increment',
    value: 'Aggregated'
  },
  {
    name: 'Original Feature Map',
    value: 'Current'
  }
];

function FeatureHeatMap(props: HeatMapProps): JSX.Element {
  const { allData, cluster, isFold, objectData, scale } = props;
  const data = cluster.map((channelId) => allData[channelId]);
  const object = cluster.map((channelId) => objectData[channelId]);
  const center = calculate2DimAvg(data);
  const PADDING = 5;
  const MARGIN = 4;
  const BORDER = 1;
  const oneCell = DEFAULTE_FEATURE_COL_WIDTH;
  const xLength = center.length;
  const yLength = center[0].length;
  const cnt = isFold ? 1 : cluster.length;
  let rects = [];
  const redColorMap = d3
    .scaleLinear()
    .domain([scale[0], 0])
    // @ts-ignore
    .range(['#f19b91', '#edb2ae', '#f4d4d3', '#f9e4e4', '#ffffff']);
  const greenColorMap = d3
    .scaleLinear()
    .domain([0, scale[1]])
    // @ts-ignore
    .range(['#ffffff', '#73b62a', '#a9d864', '#c8ed8c', '#e6f4c3']);

  let min = scale[0],
    max = scale[1];
  const clusterCenter: number[][] = new Array(xLength)
    .fill(0)
    .map((v) => new Array(yLength).fill(0));
  for (let i = 0; i < cluster.length; i++) {
    for (let x = 0; x < xLength; x++) {
      for (let y = 0; y < yLength; y++) {
        const diff =
          data[i][x][y] -
          (object && object[i] && object[i][x] && object[i][x][y] ? object[i][x][y] : 0);
        min = Math.min(diff, min);
        max = Math.max(diff, max);
        rects.push({
          x: i * oneCell + PADDING + x * DEFAULTE_RECT_CELL,
          y: PADDING + y * DEFAULTE_RECT_CELL,
          fill: diff < 0 ? redColorMap(diff) : (greenColorMap(diff) as any),
          v: diff
        });
        if (isFold) {
          clusterCenter[x][y] += diff / cluster.length;
        }
      }
    }
  }
  if (isFold) {
    rects = [];
    min = scale[0];
    max = scale[1];
    for (let x = 0; x < xLength; x++) {
      for (let y = 0; y < yLength; y++) {
        const diff = clusterCenter[x][y];
        min = Math.min(diff, min);
        max = Math.max(diff, max);
        rects.push({
          x: PADDING + x * DEFAULTE_RECT_CELL,
          y: PADDING + y * DEFAULTE_RECT_CELL,
          fill: diff < 0 ? redColorMap(diff) : (greenColorMap(diff) as any),
          v: diff
        });
      }
    }
  }
  const svgRes = (
    <svg style={{ width: oneCell * cnt }}>
      {rects.map((rect) => (
        <rect
          key={`${rect.x}-${rect.y}`}
          x={rect.x}
          y={rect.y}
          fill={rect.fill}
          width={DEFAULTE_RECT_CELL}
          height={DEFAULTE_RECT_CELL}
        />
      ))}
    </svg>
  );
  const style = {
    width: DEFAULTE_FEATURE_COL_WIDTH * cnt - (MARGIN + BORDER) * 2,
    margin: MARGIN + 'px'
  };
  return (
    <div
      className="featureMap-cluster"
      style={style}
      onClick={() => {
        props.changeFunc();
      }}
    >
      {svgRes}
    </div>
  );
}
export interface FeatureRowProps extends ActionHandler<FeatureAction> {
  clientIds: number[];
  cluster: number[][];
  scale: number[];
  isFold: boolean[];
  clientData: FeatureRowData[];
  hoveredClientId: number | null;
}
function FeatureRowPaneBase(props: FeatureRowProps): JSX.Element {
  const { clientIds, cluster, isFold, scale, clientData, hoveredClientId } = props;
  return (
    <div className="featureMap-main">
      {clientData.map((data, index) => {
        return (
          <div
            className="featureMap-row-div"
            key={data.clientId}
            style={{ background: hoveredClientId === data.clientId ? '#ececec' : '' }}
          >
            <div className="featureMap-cell">
              <img src={selectedIcon}></img>
              <p>{`C${data.clientId}`}</p>
            </div>
            {cluster.map((clusterContent, clusterId) => (
              <FeatureHeatMap
                key={`${clientIds[index]}-${clusterId}`}
                allData={data.data}
                objectData={data.object}
                cluster={clusterContent}
                isFold={isFold[clusterId]}
                scale={scale}
                changeFunc={() => {
                  props.handleAction({
                    type: CHANGE_IS_FOLD,
                    payload: {
                      clusterId: clusterId
                    }
                  });
                }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

const FeatureRowPane = connect(
  (state: State) => ({
    hoveredClientId: state.Client.hoveredClientId
  }),
  createDispatchHandler<FeatureAction>()
)(FeatureRowPaneBase);

export interface FeatureMapProps extends ActionHandler<SetFeatureK> {
  curRound: number;
  layer: LayerType;
  clientIds: number[];
  featureMapData: ClientFeatureMap[];
  lastRoundData: ClientFeatureMap[];
  aggregatedData: AggregatedFeatureMap;
  cluster: FeatureCluster;
  clients: ClientFeatureMap[];
}
function FeatureMapPaneBase(props: FeatureMapProps): JSX.Element {
  const [selectedFeatureMapType, setSelectedFeatureMapType] = useState(featureMapType[0]);
  const { layer, clientIds, featureMapData, cluster, lastRoundData, aggregatedData } = props;
  // @ts-ignore
  const clusterRes = (cluster[selectedFeatureMapType.value][layer] && cluster[selectedFeatureMapType.value][layer].cluster) || [];
  const titleName = [
    {
      type: 'Selected',
      id: 'Clients'
    }
  ];
  let cnt = 1;
  cluster.isFold.forEach((isFold, clusterId) => {
    if (isFold) {
      titleName.push({
        type: 'Cluster',
        id: clusterId + 1 + ''
      });
      cnt++;
    } else {
      clusterRes[clusterId].forEach((channelId: number) =>
        titleName.push({
          type: 'Channel',
          id: channelId + ''
        })
      );
      cnt += clusterRes[clusterId].length;
    }
  });

  const style = {
    width: Math.max(cnt * DEFAULTE_FEATURE_COL_WIDTH, 790)
  };
  const clientData: FeatureRowData[] = [];
  const emptyObject: number[][] = [];
  clientIds.forEach((clientId) => {
    clientData.push({
      clientId: clientId,
      data: featureMapData[clientId][layer],
      object:
        selectedFeatureMapType === featureMapType[0]
          ? lastRoundData[clientId][layer]
          : selectedFeatureMapType === featureMapType[1]
          ? aggregatedData[layer]
          : []
    });
  });

  useEffect(() => {
    //图例
    const svglegend = d3.select('.featuremap-legend-svg');
    const LEGEND_COLOR = ['#80b3ca', '#e5957a', '#dd3f4c', '#d9d9d9'];
    let legend = svglegend
      .append('g')
      .attr('class', 'featuremap-legend')
      .attr('width', 200)
      .attr('height', 50);
    const LEGEND_CELL = 10;
    const legendmargin = {
      top: 80,
      right: 100,
      bottom: 50,
      left: 10
    };
    const x_locate: number[] = [
      legendmargin.left + legendmargin.right + LEGEND_CELL * 2,
      legendmargin.left + legendmargin.right * 2 + LEGEND_CELL * 4,
      legendmargin.left + legendmargin.right * 3 + LEGEND_CELL * 6,
      legendmargin.left + legendmargin.right * 4 + LEGEND_CELL * 8
    ];
    const legendcoordinates: number[][] = [
      [x_locate[0], legendmargin.top],
      [x_locate[1], legendmargin.top],
      [x_locate[2], legendmargin.top],
      [x_locate[3], legendmargin.top]
    ];
    const example = legend
      .append('g')
      .style('color', '#d9d9d9')
      .style('stroke', '#d9d9d9')
      .attr('stroke-width', 2);
    let defs = example.append('defs');
    let linearGradient = defs
      .append('linearGradient')
      .attr('id', `linearColor-red`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    linearGradient
      .append('stop')
      .attr('offset', '0%')
      .style('stop-color', '#f19b91');

    linearGradient
      .append('stop')
      .attr('offset', '50%')
      .style('stop-color', '#ffffff');

    linearGradient
      .append('stop')
      .attr('offset', '100%')
      .style('stop-color', '#e6f4c3');

    legend
      .append('rect')
      .attr('x', 70)
      .attr('y', 6)
      .attr('width', 100)
      .attr('height', 10)
      .style('fill', 'url(#' + `linearColor-red` + ')');
  }, []);
  return (
    <div className="Frame FeatureMapView">
      <div className="title">
        <img src={featureSvg} className="svg-class"></img>
        <p>{'FEATURE MAP'}</p>
        <div className="k-div">
          K&nbsp;
          <input
            value={cluster.K}
            onChange={(e) => {
              props.handleAction({
                type: SET_FEATURE_K,
                payload: {
                  K: parseInt(e.target.value)
                }
              });
            }}
          />
        </div>
        <div className="switch-div">
          <select
            defaultValue="0"
            className="featuremap-type-select"
            id="featuremap-type-select"
            onChange={(e) =>
              setSelectedFeatureMapType(featureMapType[parseInt(e.target.value, 10)])
            }
          >
            <option style={{'display' : 'none'}} value=''></option>
            {featureMapType.map((v, i) => (
              <option value={i} key={v.value}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="featureMap-div">
        <div className="featureMap-title" style={style}>
          <div className="subTitle" style={style}>
            {titleName.map((title, key) => (
              <div key={'title-' + key} style={{ width: DEFAULTE_FEATURE_COL_WIDTH }}>
                {title.type}
              </div>
            ))}
          </div>
          <div className="subTitle" style={style}>
            {titleName.map((title, key) => (
              <div key={'title-' + key} style={{ width: DEFAULTE_FEATURE_COL_WIDTH }}>
                {title.id}
              </div>
            ))}
          </div>
        </div>
        <FeatureRowPane
          clientData={clientData}
          clientIds={clientIds}
          cluster={clusterRes}
          // @ts-ignore
          scale={cluster[selectedFeatureMapType.value].scale[layer]}
          isFold={cluster.isFold}
        />
      </div>
      <svg className="featuremap-legend-svg" style={{height: '30px', paddingTop: '10px'}}>
          <text fontSize="0.7em" textAnchor="start" x="10" y="15">
            Negative
          </text>
          <text fontSize="0.7em" textAnchor="start" x="180" y="15">
            Positive
          </text>
        </svg>
    </div>
  );
}

const mapStateToProps = (state: State) => ({
  curRound: state.Client.selectedRound,
  clients: state.Feature.clients,
  layer: state.Server.layer,
  clientIds: state.Analysis.clientSelected,
  featureMapData: state.Feature.clients,
  lastRoundData: state.Feature.lastRound,
  aggregatedData: state.Feature.aggregated,
  cluster: state.Feature.cluster
});
export const FeatureMapPane = connect(
  mapStateToProps,
  createDispatchHandler<SetFeatureK>()
)(FeatureMapPaneBase);
