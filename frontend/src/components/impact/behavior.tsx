import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import { BehaviorImpact, RoundRes, State } from '../../types';

export interface BehaviorProps {
  clientId: number;
  roundRes: RoundRes[];
  behavior: BehaviorImpact;
}
function BehaviorPaneBase(props: BehaviorProps): JSX.Element {
  const { clientId, behavior, roundRes } = props;
  useEffect(() => {
    const svg = d3.select(`#behavior-${clientId}`);
    svg.selectAll('g').remove();
    if (behavior.position.length == 0 || roundRes.length == 0) {
      return;
    }
    const margin = 5;
    const width = 250;
    const height = 250;
    const x = d3
      .scaleLinear()
      .range([margin, width - margin])
      .domain(behavior.domain.xDomain);
    const y = d3
      .scaleLinear()
      .range([margin, height - margin])
      .domain(behavior.domain.yDomain);
    const lineGenerator = d3.line();

    // draw aggrated graident
    const avgG = svg.append('g');
    avgG
      .selectAll('circle')
      .data(behavior.avgTsne)
      .enter()
      .append('circle')
      .attr('cx', (v) => x(v[0]))
      .attr('cy', (v) => y(v[1]))
      .attr('r', 3)
      .style('fill', '#dddddd');
    const pathData: [number, number][] = behavior.avgTsne.map((v) => [x(v[0]), y(v[1])]);
    avgG
      .append('path')
      .attr('d', lineGenerator(pathData) || '')
      .style('fill', 'none')
      .style('stroke', '#dddddd');

    // draw client graident
    const clientPosition = behavior.position[clientId];
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
    const diffPos = clientPosition.map((v, i) => {
      const start = [x(v[0]), y(v[1])];
      const end = [x(behavior.avgTsne[i][0]), y(behavior.avgTsne[i][1])];
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
  }, [clientId, behavior, roundRes]);

  return (
    <div className="impact-sub-div">
      <div className="impact-sub-title">Status Trajectory</div>
      <div className="impact-sub-main">
        <svg className="impact-svg" id={`behavior-${clientId}`}></svg>
      </div>
    </div>
  );
}

const mapStateToProps = (state: State) => ({
  behavior: state.Impact.behavior,
  roundRes: state.Impact.roundRes
});
export const BehaviorPane = connect(mapStateToProps)(BehaviorPaneBase);
