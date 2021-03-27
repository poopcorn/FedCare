import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import { RoundRes, State } from '../../types';
import { GradientImpact } from '../../types/impact';
import { getFixLengthPointInLine } from '../utils/math';

export interface GradientProps {
  clientId: number;
  roundRes: RoundRes[];
  gradient: GradientImpact;
}
function GradientPaneBase(props: GradientProps): JSX.Element {
  const { clientId, gradient, roundRes } = props;

  useEffect(() => {
    const svg = d3.select(`#gradient-${clientId}`);
    svg.selectAll('g').remove();

    if (gradient.position.length == 0 || roundRes.length == 0) {
      return;
    }
    const margin = 5;
    const width = 250;
    const height = 250;
    const x = d3
      .scaleLinear()
      .range([margin, width - margin])
      .domain(gradient.domain.xDomain);
    const y = d3
      .scaleLinear()
      .range([margin, height - margin])
      .domain(gradient.domain.yDomain);
    const lineGenerator = d3.line();

    // draw aggrated graident
    const avgG = svg.append('g');
    avgG
      .selectAll('circle')
      .data(gradient.avgTsne)
      .enter()
      .append('circle')
      .attr('cx', (v) => x(v[0]))
      .attr('cy', (v) => y(v[1]))
      .attr('r', 3)
      .style('fill', '#dddddd');
    const pathData: [number, number][] = gradient.avgTsne.map((v) => [x(v[0]), y(v[1])]);
    avgG
      .append('path')
      .attr('d', lineGenerator(pathData) || '')
      .style('fill', 'none')
      .style('stroke', '#dddddd');

    // draw client graident
    const clientPosition = gradient.position[clientId];
    const clientG = svg.append('g');
    clientG
      .selectAll('circle')
      .data(clientPosition)
      .enter()
      .append('circle')
      .attr('cx', (v) => x(v[0]))
      .attr('cy', (v) => y(v[1]))
      .attr('r', 3)
      .style('fill', (v, i) => roundRes[i].clientsArea[clientId].fill);
    const clientPath: [number, number][] = clientPosition.map((v) => [x(v[0]), y(v[1])]);
    clientG
      .append('path')
      .attr('d', lineGenerator(clientPath) || '')
      .style('fill', 'none')
      .style('stroke', '#999');

    // draw startpoint and endpoint
    clientG
      .append('text')
      .text(roundRes[0].round)
      .attr('x', x(clientPosition[0][0]) + 3)
      .attr('y', y(clientPosition[0][1]) + 4);
    clientG
      .append('text')
      .text(roundRes[clientPosition.length - 1].round)
      .attr('x', x(clientPosition[clientPosition.length - 1][0]) + 3)
      .attr('y', y(clientPosition[clientPosition.length - 1][1]) + 4);

    // draw arrow
    const diff = gradient.diff[clientId];
    const diffSclae = d3
      .scaleLinear()
      .domain([Math.min(...diff), Math.max(...diff)])
      .range([0, 10]);
    const diffPos = diff.map((v, i) => {
      const start = [x(clientPosition[i][0]), y(clientPosition[i][1])];
      const end = [x(gradient.avgTsne[i][0]), y(gradient.avgTsne[i][1])];
      const res = getFixLengthPointInLine(start, end, diffSclae(v));
      return [
        start,
        // res
        end
      ];
    });
    clientG
      .selectAll('path')
      .data(diffPos)
      .enter()
      .append('path')
      .attr('d', (v) => lineGenerator(v as any[]))
      .style('fill', 'none')
      .style('stroke', (v, i) => roundRes[i].clientsArea[clientId].fill)
      .style('stroke-dasharray', '4px 4px')
      .style('opacity', 0.5);
  }, [clientId, gradient, roundRes]);
  return (
    <div className="impact-sub-div">
      <div className="impact-sub-title">Gradient Trajectory</div>
      <div className="impact-sub-main">
        <svg className="impact-svg" id={`gradient-${clientId}`}></svg>
      </div>
    </div>
  );
}

const mapStateToProps = (state: State) => ({
  gradient: state.Impact.gradient,
  roundRes: state.Impact.roundRes
});
export const GradientPane = connect(mapStateToProps)(GradientPaneBase);
