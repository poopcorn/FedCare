import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
/// <reference path='../../types/module.d.ts'/>
import * as d3Lasso from 'd3-lasso';
import * as tsnejs from '../utils/tsne';
import { connect } from 'react-redux';

import {
  MetricValue,
  RoundRes,
  State,
  AREA_COLOR,
  DEFAULT_ANOMALY_METRICS,
  DEFAULT_CONTRIBUTION_METRICS,
  ClientArea
} from '../../types';
import { ActionHandler, createDispatchHandler } from '../../actions/redux-action';
import {
  AnalysisAction,
  ADD_CLIENTS_SELECTED,
  CLEAR_CLIENTS_SELECTED,
  ClientAction,
  SET_HOVERED_CLIENT,
  REMOVE_FAVORITE_CLIENT,
  ADD_FAVORITE_CLIENT
} from '../../actions';
import { cos, sim2dist } from '../utils/math';

import projSvg from '../../assets/icons/analysis.svg';
import zoomSvg from '../../assets/icons/zoom.svg';
import lassoSvg from '../../assets/icons/lasso.svg';
import highlightLassoSvg from '../../assets/icons/lasso_highlight.svg';

import './projection.less';

const CELL = 15;

let viewBoxX = 0,
  viewBoxY = 0,
  lasso = d3Lasso.lasso(),
  draged = d3.drag(),
  svg = d3.select('.projection-svg'),
  zoom = d3.zoom();
export interface DiagnosisProps extends ActionHandler<ClientAction | AnalysisAction> {
  filterData: MetricValue[];
  roundRes: RoundRes[];
  curRound: number;
  clientAreas: ClientArea[];
  anomalyFilter: boolean[];
  contributionFilter: boolean[];
  hoveredClientId: number | null;
  favoriteClientIds: Set<number>;
}

function DiagnosisPaneBase(props: DiagnosisProps): JSX.Element {
  const {
    filterData,
    roundRes,
    curRound,
    clientAreas,
    anomalyFilter,
    contributionFilter,
    hoveredClientId,
    favoriteClientIds
  } = props;
  const timeRef = useRef(new Date());
  const clientNum = filterData.length;
  const opt = {
    epsilon: 10,
    perplexity: 30,
    dim: 2
  };
  const tsne = new tsnejs.tSNE(opt);
  const length = filterData.length;
  // const [hoveredClientId, setHoveredClientId] = useState<number | null>(null);
  const [coordinates, setCoordinates] = useState<number[][]>([]);
  const [rightClickClient, setRightClickClient] = useState<number | null>(null);
  const [isLassoMode, setIsLassoMode] = useState<boolean>(false);

  const margin = 20,
    height = 600,
    width = 600;
  const xArray = coordinates.map((v) => v[0]);
  const yArray = coordinates.map((v) => v[1]);
  const x = d3
    .scaleLinear()

    // @ts-ignore
    .domain(d3.extent(xArray))
    .nice()
    .range([margin, width - margin]);
  const y = d3
    .scaleLinear()
    // @ts-ignore
    .domain(d3.extent(yArray))
    .nice()
    .range([margin, height - margin]);

  useEffect(() => {
    svg = d3.select('.projection-svg');
    svg.selectAll('g').remove();
    if (
      coordinates.length == 0 ||
      clientNum == 0 ||
      roundRes.length == 0 ||
      clientAreas.length == 0
    )
      return;

    const clientsArea = clientAreas;
    const clientsFill = clientsArea.map((v) => v.fill);

    // CLEAR ALL CLIENTS ACITON
    svg.on('click', () => {
      const clickDate = new Date();
      setRightClickClient(null);
      const diffTime = (clickDate as any) - (timeRef.current as any);
      if (diffTime <= 200) {
        props.handleAction({
          type: CLEAR_CLIENTS_SELECTED,
          payload: {}
        });
      }
      timeRef.current = new Date();
    });
    const maxCount = Math.max(...clientsArea.map((v) => Math.max(...v.count)));

    // draw hidden circles first
    const hiddenG = svg.append('g').attr('id', 'hiddenG');
    for (let index = 0; index < length; index++) {
      const pos = [x(coordinates[index][0]), y(coordinates[index][1])];
      hiddenG
        .append('circle')
        .attr('class', 'client-rect-circle')
        .attr('id', index)
        .attr('cx', pos[0])
        .attr('cy', pos[1])
        .attr('r', 1);
    }
    const lasso_start = function() {
      const clientsIsSelected: boolean[] = new Array(clientNum).fill(false);
      showRect(clientsIsSelected);
    };

    const lasso_draw = function() {
      // Style the possible dots
      const clientsIsSelected: boolean[] = new Array(clientNum).fill(false);
      lasso
        .possibleItems()
        .nodes()
        .forEach((v: any) => (clientsIsSelected[parseInt(v.id)] = true));
      showRect(clientsIsSelected);
    };

    const lasso_end = function() {
      lasso_start();
      const clients: number[] = lasso
        .selectedItems()
        .nodes()
        .map((v: any) => parseInt(v.id));
      clients.forEach((id) => {
        g.select('#client-rect-' + id)
          .classed('not_possible', false)
          .classed('possible', true);
      });
      // Add client selected
      props.handleAction({
        type: ADD_CLIENTS_SELECTED,
        payload: {
          clients: clients
        }
      });
    };

    // Add lasso
    const circles = hiddenG.selectAll('.client-rect-circle');
    lasso = d3Lasso
      .lasso()
      .closePathSelect(true)
      .closePathDistance(100)
      .items(circles)
      .targetArea(svg)
      .on('start', lasso_start)
      .on('draw', lasso_draw)
      .on('end', lasso_end);

    const showRect = (clientsIsSelected: boolean[]) => {
      clientsIsSelected.forEach((isSelected, id) => {
        g.select('#client-rect-' + id)
          .classed('not_possible', !isSelected)
          .classed('possible', isSelected);
      });
    };

    // drag
    draged = d3.drag().on('drag', function() {
      viewBoxX -= d3.event.dx;
      viewBoxY -= d3.event.dy;
      svg.attr('viewBox', `${viewBoxX} ${viewBoxY} ${width} ${height}`);
    });

    zoom = d3
      .zoom()
      .scaleExtent([0.1, 10])
      .on('zoom', () => {
        if (!d3.event.sourceEvent) return;
        let { layerX, layerY, deltaY } = d3.event.sourceEvent;
        layerX += viewBoxX;
        layerY += viewBoxY;
        document.querySelectorAll('.client-rect').forEach((ele) => {
          if ((ele as any).transform.baseVal.length === 0) return;
          const [x, y] = [
            (ele as any).transform.baseVal[0].matrix.e,
            (ele as any).transform.baseVal[0].matrix.f
          ];
          if (deltaY < 0) {
            ele.setAttribute(
              'transform',
              `translate(${layerX + (x - layerX) * 1.1}, ${layerY + (y - layerY) * 1.1})`
            );
          } else {
            ele.setAttribute(
              'transform',
              `translate(${layerX + (x - layerX) * 0.9}, ${layerY + (y - layerY) * 0.9})`
            );
          }
        });
        document.querySelectorAll('.client-rect-circle').forEach((ele) => {
          const [cx, cy] = [(ele as any).cx.baseVal.value, (ele as any).cy.baseVal.value];
          if (deltaY < 0) {
            ele.setAttribute('cx', `${layerX + (cx - layerX) * 1.1}`);
            ele.setAttribute('cy', `${layerY + (cy - layerY) * 1.1}`);
          } else {
            ele.setAttribute('cx', `${layerX + (cx - layerX) * 0.9}`);
            ele.setAttribute('cy', `${layerY + (cy - layerY) * 0.9}`);
          }
        });
      });

    // @ts-ignore
    svg.call(draged);
    // @ts-ignore
    svg.call(zoom);

    const g = svg.append('g').attr('id', 'client_g');
    // draw all clients rect
    for (let index = 0; index < length; index++) {
      const pos = [x(coordinates[index][0]), y(coordinates[index][1])];
      const rectG = g
        .append('g')
        .attr('class', 'client-rect')
        .attr('id', `client-rect-${index}`)
        .attr('transform', `translate(${pos[0]}, ${pos[1]})`)
        .style('color', clientsFill[index])
        .style('stroke', clientsFill[index])
        .on('click', () => {
          props.handleAction({
            type: ADD_CLIENTS_SELECTED,
            payload: {
              clients: [index]
            }
          });
        })
        .on('mouseover', function() {
          const { x, y } = this.getBoundingClientRect();
          props.handleAction({
            type: SET_HOVERED_CLIENT,
            payload: {
              hoveredClientId: index
            }
          });
          d3.select('#hovered_projection_tooltip').style(
            'transform',
            `translate(${x + 40}px, ${y}px)`
          );
        })
        .on('mouseout', function() {
          props.handleAction({
            type: SET_HOVERED_CLIENT,
            payload: {
              hoveredClientId: null
            }
          });
        })
        .on('contextmenu', function() {
          d3.event.preventDefault();
          const { x, y } = d3.event;
          setRightClickClient(index);
          d3.select('.projection-favorite-menu').style('transform', `translate(${x}px, ${y}px)`);
        });

      // draw Rect
      // draw line and outRect
      rectG
        .append('rect')
        .attr('x', -CELL)
        .attr('y', -CELL)
        .attr('width', CELL * 2)
        .attr('height', CELL * 2)
        .style('fill', '#ffffff')
        .style('strokeWidth', '1px');
      rectG
        .append('line')
        .attr('x1', -CELL)
        .attr('x2', CELL)
        .attr('y1', 0)
        .attr('y2', 0);
      rectG
        .append('line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', -CELL)
        .attr('y2', CELL);
      const color = d3
        .scaleLinear()
        .domain([0, maxCount])
        // @ts-ignore
        .range(['#ffffff', clientsFill[index]]);
      for (let areaId = 0; areaId < 4; areaId++) {
        const isBottom = (areaId / 2) | 0;
        const isLeft = areaId % 2 == 0;
        let fill = color(clientsArea[index].count[areaId]);
        rectG
          .append('rect')
          .attr('class', 'client-most-area')
          .attr('x', isLeft ? -CELL : 0)
          .attr('y', isBottom ? 0 : -CELL)
          .attr('width', CELL)
          .attr('height', CELL)
          .attr('fill', fill)
          .attr('stroke', 'none');
      }
    }
  }, [coordinates]);

  useEffect(() => {
    setRightClickClient(null);
    let new_coordinates: number[][] = [];
    if (length === 0) {
      new_coordinates = [];
    } else {
      const cosMatrix = [];
      for (let i = 0; i < length; i++) {
        const row = [];
        for (let j = 0; j < length; j++) {
          row.push(cos(filterData[i].vector, filterData[j].vector));
        }
        cosMatrix.push(row);
      }

      const distMatrix = sim2dist(cosMatrix);
      tsne.initDataDist(distMatrix);
      for (let k = 0; k < 2000; k++) {
        tsne.step();
      }
      new_coordinates = tsne.getSolution();
      new_coordinates = new_coordinates.map((v, i) => v.concat(i));
    }

    setCoordinates(new_coordinates);

    //图例
    const svglegend = d3.select('.legend-svg');
    const LEGEND_COLOR = ['#80b3ca', '#e5957a', '#dd3f4c', '#d9d9d9'];
    let legend = svglegend
      .append('g')
      .attr('class', 'legend')
      .attr('width', 600)
      .attr('height', 100);
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
    const legendtext: string[] = [
      'High Contribution',
      'High Anomaly',
      'Low Contribution',
      'Low Anomaly'
    ];
    const examplepos: number[] = [35, legendmargin.top];
    const EXAMPLE_CELL = 10;
    const example = legend
      .append('g')
      .style('color', '#d9d9d9')
      .style('stroke', '#d9d9d9')
      .attr('stroke-width', 2);

    // draw example Rect
    example
      .append('rect')
      .attr('x', examplepos[0] - EXAMPLE_CELL)
      .attr('y', examplepos[1] - EXAMPLE_CELL)
      .attr('width', EXAMPLE_CELL * 2)
      .attr('height', EXAMPLE_CELL * 2)
      .style('fill', '#ffffff')
      .style('strokeWidth', '1px');
    example
      .append('line')
      .attr('x1', examplepos[0] - EXAMPLE_CELL)
      .attr('x2', examplepos[0] + EXAMPLE_CELL)
      .attr('y1', examplepos[1])
      .attr('y2', examplepos[1])
      .attr('stroke-width', 2);
    example
      .append('line')
      .attr('x1', examplepos[0])
      .attr('x2', examplepos[0])
      .attr('y1', examplepos[1] - EXAMPLE_CELL)
      .attr('y2', examplepos[1] + EXAMPLE_CELL)
      .attr('stroke-width', 2);

    let defs = example.append('defs');
    let arrowMarker = defs
      .append('marker')
      .attr('id', 'arrow')
      .attr('markerUnits', 'strokeWidth')
      .attr('markerWidth', '5')
      .attr('markerHeight', '5')
      .attr('viewBox', '0 0 12 12')
      .attr('refX', '6')
      .attr('refY', '6')
      .attr('orient', 'auto');
    let arrow_path = 'M2,2 L10,6 L2,10 L6,6 L2,2';
    arrowMarker
      .append('path')
      .attr('d', arrow_path)
      .attr('fill', '#000');
    //x轴
    example
      .append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', EXAMPLE_CELL * 3.5)
      .attr('y2', 0)
      .attr('stroke', '#d9d9d9')
      .attr('stroke-width', 2)
      .attr(
        'transform',
        'translate(' +
          (examplepos[0] - EXAMPLE_CELL * 1.6) +
          ',' +
          (examplepos[1] + EXAMPLE_CELL * 1.5) +
          ')'
      )
      .attr('marker-end', 'url(#arrow)');
    example
      .append('text')
      .attr('font-size', '0.65em')
      .attr('text-anchor', 'start')
      .attr('x', examplepos[0] + EXAMPLE_CELL * 2.5)
      .attr('y', examplepos[1] + EXAMPLE_CELL * 1.5)
      .attr('stroke-width', 0)
      .text('Anomaly');

    //y轴
    example
      .append('line')
      .attr('x1', 0)
      .attr('y1', EXAMPLE_CELL * 2.5)
      .attr('x2', 0)
      .attr('y2', 0)
      .attr('stroke', '#d9d9d9')
      .attr('stroke-width', 2)
      .attr(
        'transform',
        'translate(' +
          (examplepos[0] - EXAMPLE_CELL * 1.6) +
          ',' +
          (examplepos[1] - EXAMPLE_CELL) +
          ')'
      )
      .attr('marker-end', 'url(#arrow)');

    example
      .append('text')
      .attr('font-size', '0.65em')
      .attr('text-anchor', 'start')
      .attr('x', examplepos[0] - EXAMPLE_CELL * 3)
      .attr('y', examplepos[1] - EXAMPLE_CELL * 2)
      .attr('stroke-width', 0)
      .text('Contribution');

    // draw all legends rect
    for (let index = 0; index < 4; index++) {
      const pos = [legendcoordinates[index][0], legendcoordinates[index][1]];
      const rectG = legend
        .append('g')
        .attr('class', 'legend-rect')
        .attr('id', `legend-rect-${index}`)
        .style('color', LEGEND_COLOR[index])
        .style('stroke', LEGEND_COLOR[index])
        .attr('stroke-width', 2);

      rectG
        .append('rect')
        .attr('x', pos[0] - LEGEND_CELL)
        .attr('y', pos[1] - LEGEND_CELL)
        .attr('width', LEGEND_CELL * 2)
        .attr('height', LEGEND_CELL * 2)
        .style('fill', '#ffffff')
        .style('strokeWidth', '1px');
      rectG
        .append('line')
        .attr('x1', pos[0] - LEGEND_CELL)
        .attr('x2', pos[0] + LEGEND_CELL)
        .attr('y1', pos[1])
        .attr('y2', pos[1])
        .attr('stroke-width', 2);
      rectG
        .append('line')
        .attr('x1', pos[0])
        .attr('x2', pos[0])
        .attr('y1', pos[1] - LEGEND_CELL)
        .attr('y2', pos[1] + LEGEND_CELL)
        .attr('stroke-width', 2);

      const isRight = index == 1 || index == 2 ? 1 : 0;
      const isBottom = index == 2 || index == 3 ? 1 : 0;
      let fill = LEGEND_COLOR[index];
      rectG
        .append('rect')
        .attr('x', isRight ? pos[0] : pos[0] - LEGEND_CELL)
        .attr('y', isBottom ? pos[1] : pos[1] - LEGEND_CELL)
        .attr('width', LEGEND_CELL)
        .attr('height', LEGEND_CELL)
        .attr('fill', fill)
        .attr('stroke', 'none');

      //contribution
      legend
        .append('text')
        .attr('font-size', '0.6em')
        .attr('text-anchor', 'start')
        .attr('x', pos[0] + LEGEND_CELL + 5)
        .attr('y', pos[1] - LEGEND_CELL / 2)
        .text(isBottom ? legendtext[2] : legendtext[0]);

      //anomaly
      legend
        .append('text')
        .attr('font-size', '0.6em')
        .attr('text-anchor', 'start')
        .attr('x', pos[0] + LEGEND_CELL + 5)
        .attr('y', pos[1] + LEGEND_CELL * 1.5)
        .text(isRight ? legendtext[1] : legendtext[3]);

      //color legend
      let linearGradient = defs
        .append('linearGradient')
        .attr('id', `linearColor-${index}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');

      linearGradient
        .append('stop')
        .attr('offset', '0%')
        .style('stop-color', '#ffffff');

      linearGradient
        .append('stop')
        .attr('offset', '100%')
        .style('stop-color', fill);
      legend
        .append('rect')
        .attr('x', pos[0] - LEGEND_CELL)
        .attr('y', pos[1] + LEGEND_CELL * 3)
        .attr('width', 100)
        .attr('height', 10)
        .style('fill', 'url(#' + `linearColor-${index}` + ')');

      //高低标记
      legend
        .append('text')
        .attr('font-size', '0.68em')
        .attr('text-anchor', 'start')
        .attr('x', pos[0] - LEGEND_CELL * 1.2)
        .attr('y', pos[1] + LEGEND_CELL * 5)
        .text('low');
      legend
        .append('text')
        .attr('font-size', '0.68em')
        .attr('text-anchor', 'start')
        .attr('x', pos[0] + LEGEND_CELL * 7)
        .attr('y', pos[1] + LEGEND_CELL * 5)
        .text('high');
    }
    legend
      .append('text')
      .attr('font-size', '0.7em')
      .attr('text-anchor', 'start')
      .attr('x', examplepos[0] - EXAMPLE_CELL * 1.6 - 1)
      .attr('y', examplepos[1] + LEGEND_CELL * 4)
      .text('Color Legend');
  }, [filterData, roundRes, curRound, anomalyFilter, contributionFilter]);

  const anomalyData = DEFAULT_ANOMALY_METRICS.filter((v, i) => anomalyFilter[i]);

  const contributionData = DEFAULT_CONTRIBUTION_METRICS.filter((v, i) => contributionFilter[i]);

  const favoriteClickHandler = () => {
    if (favoriteClientIds.has(rightClickClient as number)) {
      props.handleAction({
        type: REMOVE_FAVORITE_CLIENT,
        payload: {
          clientId: rightClickClient as number
        }
      });
    } else {
      props.handleAction({
        type: ADD_FAVORITE_CLIENT,
        payload: {
          clientId: rightClickClient as number
        }
      });
    }
    setRightClickClient(null);
  };

  useEffect(() => {
    Array.from(favoriteClientIds).map((clientId) => {
      if (document.querySelector('#client-rect-' + clientId) !== null) {
        const { x, y } = (document.querySelector(
          '#client-rect-' + clientId
        ) as Element).getBoundingClientRect();
        d3.select('#projection_tooltip_' + clientId).style(
          'transform',
          `translate(${x + 40}px, ${y}px)`
        );
      }
    });
  }, [favoriteClientIds]);

  useEffect(() => {
    if (isLassoMode) {
      svg.on('.zoom', null);
      // @ts-ignore
      svg.call(lasso);
      // @ts-ignore
      svg.call(zoom);
    } else {
      svg.on('.zoom', null);
      // @ts-ignore
      svg.call(draged);
      // @ts-ignore
      svg.call(zoom);
    }
  }, [isLassoMode]);
  return (
    <div className="Frame DiagnosisView">
      <div className="title">
        <img src={projSvg} className="svg-class"></img>
        <p>PROJECTION VIEW</p>
      </div>
      <div className="projection-utils">
        <div className="projection-sub-utils">
          <img
            src={isLassoMode ? highlightLassoSvg : lassoSvg}
            onClick={() => setIsLassoMode(!isLassoMode)}
            className="projection-img-utils"
          />
        </div>
        {/* <div className='projection-sub-utils' style={{borderRight: 'none'}}>
          <img src={zoomSvg} className='projection-img-utils' />
        </div> */}
      </div>
      <svg className="projection-svg">
        <defs>
          <pattern
            id="contribution-pattern"
            x="0"
            y="0"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
          >
            <path d="M-1,1 l2,-2  M0,6 l6,-6  M5,7 l2,-2" stroke="#8fbed6" strokeWidth="1"></path>
          </pattern>
          <pattern
            id="anomaly-pattern"
            x="0"
            y="0"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
          >
            <path d="M-1,1 l2,-2  M0,6 l6,-6  M5,7 l2,-2" stroke="#efb4ae" strokeWidth="1"></path>
          </pattern>
        </defs>
      </svg>
      <svg className="legend-svg"></svg>
      {hoveredClientId !== null && (
        <div className="projection-tooltip" id="hovered_projection_tooltip">
          <div className="projection-tooltip-title">Client ID: {hoveredClientId}</div>
          <div className="projection-tooltip-content">
            <div className="projection-tooltip-column">
              <p className="projection-tooltip-subtitle">Anomaly</p>
              {anomalyData
                .map((v, i) => [v, filterData[hoveredClientId as number].vector[i]])
                .map((v, i) => (
                  <p key={i}>
                    {v[0]}: {(v[1] as number).toFixed(2)}
                  </p>
                ))}
            </div>
            <div className="segment-div" />
            <div className="projection-tooltip-column">
              <p className="projection-tooltip-subtitle">Contribution</p>
              {contributionData
                .map((v, i) => [
                  v,
                  filterData[hoveredClientId as number].vector[i + anomalyData.length]
                ])
                .map((v, i) => (
                  <p key={i}>
                    {v[0]}: {(v[1] as number).toFixed(2)}
                  </p>
                ))}
            </div>
          </div>
        </div>
      )}
      {rightClickClient !== null && (
        <div className="projection-favorite-menu">
          <input
            type="button"
            onClick={favoriteClickHandler}
            className="favorite-button"
            value={favoriteClientIds.has(rightClickClient) ? 'Unfavorite' : 'Favorite'}
          />
        </div>
      )}

      {Array.from(favoriteClientIds).map((id) => (
        <div key={id} className="projection-tooltip" id={'projection_tooltip_' + id}>
          <div className="projection-tooltip-title">Client ID: {id}</div>
          <div className="projection-tooltip-content">
            <div className="projection-tooltip-column">
              <p className="projection-tooltip-subtitle">Anomaly</p>
              {anomalyData
                .map((v, i) => [v, filterData[id as number].vector[i]])
                .map((v, i) => (
                  <p key={i}>
                    {v[0]}: {(v[1] as number).toFixed(2)}
                  </p>
                ))}
            </div>
            <div className="segment-div" />
            <div className="projection-tooltip-column">
              <p className="projection-tooltip-subtitle">Contribution</p>
              {contributionData
                .map((v, i) => [v, filterData[id as number].vector[i + anomalyData.length]])
                .map((v, i) => (
                  <p key={i}>
                    {v[0]}: {(v[1] as number).toFixed(2)}
                  </p>
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const mapStateToProps = (state: State) => ({
  filterData: state.Analysis.filterConcat,
  roundRes: state.Client.roundRes,
  curRound: state.Client.selectedRound,
  anomalyFilter: state.Analysis.anomalyFilter,
  contributionFilter: state.Analysis.contributionFilter,
  hoveredClientId: state.Client.hoveredClientId,
  favoriteClientIds: state.Client.favoriteClietnIds,
  clientAreas: state.Analysis.clientAreas
});
export const DiagnosisPane = connect(
  mapStateToProps,
  createDispatchHandler<ClientAction | AnalysisAction>()
)(DiagnosisPaneBase);
