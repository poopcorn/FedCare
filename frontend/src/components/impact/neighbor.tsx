import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import { BehaviorImpact, MultipleInfo, RoundRes, State } from '../../types';
import { ActionHandler, createDispatchHandler } from '../../actions/redux-action';
import { SetSuggestedAdversary, SET_SUGGESTED_ADVERSARY } from '../../actions';

const hideNodesLinks = (
  data: {
    nodes: any[];
    links: any[];
  },
  clientId: number,
  threshold: number
) => {
  const svg = d3.select(`#neighbor-${clientId}`);
  svg.selectAll('line').attr('visibility', 'hidden');
  svg.selectAll('circle').attr('visibility', 'hidden');
  svg.selectAll('text').attr('visibility', 'hidden');
  // first filter link > threshold with center node
  const links = data.links.filter(
    (v) => (v.source == clientId || v.target == clientId) && v.value >= threshold
  );
  const nodes = data.nodes.map((v) => ({
    id: v.id,
    cnt: 0
  }));
  links.forEach((link) => {
    nodes[link.source].cnt++;
    nodes[link.target].cnt++;
    svg.select(`.link-${link.source}-${link.target}`).attr('visibility', 'visible');
  });
  // second filter node with link show
  const filterNodes = nodes.filter((node) => node.cnt > 0);
  filterNodes.push({
    id: clientId,
    cnt: 1
  });
  const ids = filterNodes.map((node) => node.id);
  filterNodes.forEach((node) => {
    svg.select(`.node-${node.id}`).attr('visibility', 'visible');
    svg.select(`.text-${node.id}`).attr('visibility', 'visible');
  });
  // add links that between filterNodes which value > threshold
  data.links.forEach((link) => {
    if (!(ids.includes(link.source) && ids.includes(link.target))) {
      return;
    }
    if (link.value < threshold) {
      return;
    }
    svg.select(`.link-${link.source}-${link.target}`).attr('visibility', 'visible');
  });
  return new Set(filterNodes.map((v) => v.id));
};

export interface NeighborProps extends ActionHandler<SetSuggestedAdversary> {
  clientId: number;
  behavior: BehaviorImpact;
  threshold: number;
  roundRes: RoundRes[];
}
function NeighborPaneBase(props: NeighborProps): JSX.Element {
  const { clientId, behavior, threshold, roundRes } = props;
  const multipleInfo = behavior.multiple;

  const data: {
    nodes: any[];
    links: any[];
  } = {
    nodes: multipleInfo.map((v, i) => ({ id: i })),
    links: []
  };
  const length = multipleInfo.length;
  for (let i = 0; i < length; i++) {
    for (let j = i + 1; j < length; j++) {
      data.links.push({
        source: i,
        target: j,
        value: multipleInfo[i][j]
      });
    }
  }
  // draw all node-links diagram
  useEffect(() => {
    const svg = d3.select(`#neighbor-${clientId}`);
    svg.selectAll('g').remove();
    if (multipleInfo.length == 0) {
      return;
    }
    const width = 250;
    const height = 250;
    const g = svg.append('g');
    const links = data.links.map((d) => Object.create(d));
    const nodes = data.nodes.map((d) => Object.create(d));
    nodes.forEach((v, i) => {
      const colors = new Map<string, number>();
      roundRes.forEach((round, j) => {
        if (colors.has(round.clientsArea[i].fill)) {
          colors.set(round.clientsArea[i].fill, 1);
        } else {
          colors.set(
            round.clientsArea[i].fill,
            (colors.get(round.clientsArea[i].fill) as number) + 1
          );
        }
      });
      let color = '#fff';
      let max = 0;
      colors.forEach((v, k) => {
        if (v > max) color = k;
      });
      v.fill = color;
    });

    // @TODO Drag nodes
    const drag = (simulation: any) => {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      return d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    };

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink(links).id((d: any) => d.id)
      )
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2));
    const link = g
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('class', (v) => `link-${v.source.id}-${v.target.id}`)
      .attr('stroke-width', (d) => d.value * 5);
    const node = g
      .append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('class', (v) => `node-${v.id}`)
      .attr('r', 6)
      .attr('fill', (v) => v.fill);
    // .call(drag(simulation) as any);
    const text = g
      .append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('class', (v) => `text-${v.id}`)
      .text((v) => v.id);

    simulation.on('end', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

      text.attr('x', (d) => d.x + 10).attr('y', (d) => d.y + 6);

      const suggestedAdversary = hideNodesLinks(data, clientId, threshold);
      props.handleAction({
        type: SET_SUGGESTED_ADVERSARY,
        payload: {
          suggestedAdversary: suggestedAdversary
        }
      });
    });
  }, [clientId, behavior]);

  // hide / show nodes/links
  useEffect(() => {
    if (multipleInfo.length == 0) {
      return;
    }
    const suggestedAdversary = hideNodesLinks(data, clientId, threshold);
    props.handleAction({
      type: SET_SUGGESTED_ADVERSARY,
      payload: {
        suggestedAdversary: suggestedAdversary
      }
    });
  }, [threshold]);
  return (
    <div className="impact-sub-div">
      <div className="impact-sub-title">Group of High Relevance</div>
      <div className="impact-sub-main">
        <svg className="impact-svg" id={`neighbor-${clientId}`} />
      </div>
    </div>
  );
}

const mapStateToProps = (state: State) => ({
  behavior: state.Impact.behavior,
  threshold: state.Impact.threshold,
  roundRes: state.Impact.roundRes
});
export const NeighborPane = connect(
  mapStateToProps,
  createDispatchHandler<SetSuggestedAdversary>()
)(NeighborPaneBase);
