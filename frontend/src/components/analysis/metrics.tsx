import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import { Metric, State } from '../../types';
import { createDispatchHandler, ActionHandler } from '../../actions/redux-action';
import { AnalysisAction, SET_ANOMALY_FILTER, SET_CONTRIBUTION_FILTER } from '../../actions';
import { computeBoxPlot, euclideanDis } from '../utils/math';

import './metrics.less';

export interface MetricsProps extends ActionHandler<AnalysisAction> {
  round: number;
  type: 'Anomaly' | 'Contribution';
  data: Metric;
  filter: boolean[];
  hoveredClientId: number | null;
}
function MetricsPaneBase(props: MetricsProps): JSX.Element {
  const [threshold, setThreshold] = useState('1.0');
  const { round, type, data, filter, hoveredClientId } = props;
  const count = filter.length;

  const filterList = useMemo(
    () =>
      filter.map((v, i) => {
        return (
          <div key={data.metrics[i]} className="input-list">
            <input
              type="checkbox"
              id={data.metrics[i] + '-checkbox'}
              checked={v}
              onChange={() => {
                const newFilter = filter.concat([]);
                newFilter[i] = !filter[i];
                props.handleAction({
                  type: type === 'Anomaly' ? SET_ANOMALY_FILTER : SET_CONTRIBUTION_FILTER,
                  payload: {
                    filter: newFilter
                  }
                });
              }}
            ></input>
            <label htmlFor={data.metrics[i] + '-checkbox'}>{data.metrics[i]}</label>
          </div>
        );
      }),
    [props.filter]
  );

  // calculate distance
  const dis = useMemo(() => {
    const metricVector = filter.map((v, metricId) => {
      return data.value.map((oneMetricData) => oneMetricData.vector[metricId]);
    });
    const dis = [];
    for (let i = 0; i < count; i++) {
      const rowDis = [];
      for (let j = i + 1; j < count; j++) {
        rowDis.push({
          dis: euclideanDis(metricVector[i], metricVector[j]),
          objectId: j
        });
      }
      dis.push(rowDis);
    }
    return dis;
  }, [round]);
  const LEFT_WIDTH = 62;
  const BOX_WIDTH = 220;
  const BOX_HEIGHT = 30;
  const PADDING = 0;
  const margin = { left: 0, top: 20 + BOX_HEIGHT };

  // draw Chord diagrom
  useEffect(() => {
    if (data.value.length == 0) {
      return;
    }
    const svg = d3.select(`#${type}-svg`);
    svg.selectAll('.chord-g').remove();

    // get chord line
    const connections: [number, number][][] = [];
    dis.forEach((rowDis, rowId) => {
      rowDis.forEach((v, colId) => {
        if (v.dis <= parseFloat(threshold)) {
          connections.push([
            [LEFT_WIDTH, (rowId + 0.5) * BOX_HEIGHT],
            [PADDING, ((rowId + v.objectId) / 2 + 0.5) * BOX_HEIGHT],
            [LEFT_WIDTH, (v.objectId + 0.5) * BOX_HEIGHT],
            [v.dis, v.dis]
          ]);
        }
      });
    });
    // draw
    const chordG = svg
      .append('g')
      .attr('class', 'chord-g')
      .style('transform', `translate(${margin.left}px, ${margin.top}px)`);
    // draw line
    chordG
      .append('line')
      .attr('x1', LEFT_WIDTH)
      .attr('y1', BOX_HEIGHT * 0.5)
      .attr('x2', LEFT_WIDTH)
      .attr('y2', (count - 0.5) * BOX_HEIGHT);

    // draw circle
    chordG
      .selectAll('circle')
      .data(filter)
      .enter()
      .append('circle')
      .attr('cx', LEFT_WIDTH)
      .attr('cy', (v, i) => (i + 0.5) * BOX_HEIGHT)
      .attr('r', 3);

    const lineGenerator = (v: number[][]) => {
      const start = v[0]; // X position of start node on the X axis
      const end = v[2]; // X position of end node
      return [
        'M',
        start[0],
        start[1], // the arc starts at the coordinate x=start, y=height-30 (where the starting node is)
        'A', // This means we're gonna build an elliptical arc
        (start[1] - end[1]) / 2,
        ',', // Next 2 lines are the coordinates of the inflexion point. Height of this point is proportional with start - end distance
        (start[1] - end[1]) / 2,
        0,
        0,
        ',',
        0,
        end[0],
        end[1]
      ] // We always want the arc on top. So if end is before start, putting 0 here turn the arc upside down.
        .join(' ');
    };

    //draw curve
    chordG
      .selectAll('path')
      .data(connections)
      .enter()
      .append('path')
      .attr('stroke-width', v => (1 / v[3][0] as number) > 4 ? 4 : (1 / v[3][0] as number))
      .attr('d', (v) => lineGenerator(v));
  }, [round, threshold]);

  // draw boxPlot
  useEffect(() => {
    const svg = d3.select(`#${type}-svg`);
    svg.selectAll('.curve-g').remove();
    if (data.value.length == 0) {
      return;
    }

    // get All boxData and Min/Max
    const domain = [1000, -1000];
    const metricLineList = filter.map((f, metricId) => {
      const metricList = data.value.map((v) => v.vector[metricId]);
      const res = computeBoxPlot(metricList);
      domain[0] = Math.min(...[...res.outliers, ...res.range], domain[0]);
      domain[1] = Math.max(...[...res.outliers, ...res.range], domain[1]);
      return res;
    });
    const x = d3
      .scaleLinear()
      .domain(domain)
      .nice()
      .range([PADDING, BOX_WIDTH - PADDING]);

    // draw xAxis
    const curveG = svg
      .append('g')
      .attr('class', 'curve-g')
      .style('transform', `translate(${margin.left + LEFT_WIDTH}px, ${margin.top}px)`)
      .call(d3.axisTop(x).ticks(6));
    curveG.select('.domain').remove();
    curveG
      .selectAll('.tick')
      .style('stroke', '#585959')
      .style('fill', '#585959');
    curveG
      .selectAll('.tick')
      .selectAll('text')
      .style('stroke-width', '0px');

    // draw boxPlot
    metricLineList.map((boxData, metricId) => {
      const yOffset = metricId * BOX_HEIGHT;
      const yBaseLine = (metricId + 0.5) * BOX_HEIGHT;
      const boxplotG = curveG
        .append('g')
        .attr('class', `${data.metrics[metricId]}-g`)
        .style('transform', `translate(0, ${yOffset})`);

      // min
      boxplotG
        .append('line')
        .attr('x1', x(boxData.range[0]))
        .attr('x2', x(boxData.range[0]))
        .attr('y1', yBaseLine - BOX_HEIGHT / 5)
        .attr('y2', yBaseLine + BOX_HEIGHT / 5);
      // max
      boxplotG
        .append('line')
        .attr('x1', x(boxData.range[1]))
        .attr('x2', x(boxData.range[1]))
        .attr('y1', yBaseLine - BOX_HEIGHT / 5)
        .attr('y2', yBaseLine + BOX_HEIGHT / 5);
      // vertical line
      boxplotG
        .append('line')
        .attr('x1', x(boxData.range[0]))
        .attr('x2', x(boxData.range[1]))
        .attr('y1', yBaseLine)
        .attr('y2', yBaseLine);
      // quantiles
      boxplotG
        .append('rect')
        .attr('x', x(boxData.quantiles[0]))
        .attr('y', yBaseLine - BOX_HEIGHT / 4)
        .attr('width', x(boxData.quantiles[2]) - x(boxData.quantiles[0]))
        .attr('height', BOX_HEIGHT / 2)
        .style('fill', '#ffffff');
      boxplotG
        .append('line')
        .attr('x1', x(boxData.quantiles[1]))
        .attr('x2', x(boxData.quantiles[1]))
        .attr('y1', yBaseLine - BOX_HEIGHT / 4)
        .attr('y2', yBaseLine + BOX_HEIGHT / 4);
      // outliers
      boxplotG
        .selectAll('circle')
        .data(boxData.outliers)
        .enter()
        .append('circle')
        .attr('cx', (d) => x(d))
        .attr('cy', yBaseLine)
        .attr('r', 1);
    });
  }, [round, data.value]);

  useEffect(() => {
    if (hoveredClientId === null) {
      data.metrics.forEach((metric) => {
        d3.select(`.${metric}-g`).style('opacity', 1);
      });
      d3.selectAll('.cursor-g').remove();
    } else {
      const domain = [1000, -1000];
      const metricLineList = filter.map((f, metricId) => {
        const metricList = data.value.map((v) => v.vector[metricId]);
        const res = computeBoxPlot(metricList);
        domain[0] = Math.min(...[...res.outliers, ...res.range], domain[0]);
        domain[1] = Math.max(...[...res.outliers, ...res.range], domain[1]);
        return res;
      });
      const x = d3
        .scaleLinear()
        .domain(domain)
        .nice()
        .range([PADDING, BOX_WIDTH - PADDING]);
      const cursorG = d3
        .selectAll(`#${type}-svg .curve-g`)
        .append('g')
        .attr('class', 'cursor-g');

      data.metrics.forEach((metric, metricId) => {
        const yBaseLine = (metricId + 0.5) * BOX_HEIGHT;
        d3.select(`.${metric}-g`).style('opacity', 0.2);
        cursorG
          .append('line')
          .attr('x1', x(data.value[hoveredClientId].vector[metricId]))
          .attr('x2', x(data.value[hoveredClientId].vector[metricId]))
          .attr('y1', yBaseLine - BOX_HEIGHT / 5)
          .attr('y2', yBaseLine + BOX_HEIGHT / 5)
          .style('stroke-width', '2px');
      });
    }
  }, [hoveredClientId]);

  const isSelectAll = filter.reduce((pre, cur) => pre && cur);
  return (
    <div className="metric-div">
      <div className="metric-title">
        <p>{type + ' Metrics'}</p>
        <div className="metric-threshold-div">
          Similarity Threshold
          <input
            value={threshold}
            onChange={(e) => {
              setThreshold(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="check-list">
        <div className="left-input" id={type + '-left'}>
          <div className="input-list">
            <input
              type="checkbox"
              checked={isSelectAll}
              onChange={() => {
                if (isSelectAll) {
                  return;
                }
                const newFilter = new Array(filter.length).fill(true);
                props.handleAction({
                  type: type === 'Anomaly' ? SET_ANOMALY_FILTER : SET_CONTRIBUTION_FILTER,
                  payload: {
                    filter: newFilter
                  }
                });
              }}
            ></input>
            <label>Select All</label>
          </div>
          {filterList}
        </div>
        <svg className="metric-svg" id={type + '-svg'}></svg>
      </div>
    </div>
  );
}
export const MetricsPane = connect(null, createDispatchHandler<AnalysisAction>())(MetricsPaneBase);
