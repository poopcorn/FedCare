import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { PerformanceRes, DatasetType } from '../../types';
import { createDispatchHandler, ActionHandler } from '../../actions/redux-action';
import * as d3 from 'd3';
/// <reference path='../../types/module.d.ts'/>
import './serverplot.css';
import './performance.css';
import { ServerAction } from '../../actions';

// props声明和对应组件写在一起
interface PerformancePaneProps extends ActionHandler<ServerAction> {
  curRound: number;
  rounds: number[];
  performanceRes: PerformanceRes[];
  height: number;
  width: number;
  totalround: number;
  showRoundNum: number;
}

function PerformancePaneBase(this: any, props: PerformancePaneProps): JSX.Element {
  const { curRound, rounds, performanceRes, height, width, showRoundNum, totalround } = props;
  const margin = {
    top: 5,
    right: 30,
    bottom: 50,
    left: 60
  };
  useEffect(() => {
    if (
      performanceRes.length === 0 ||
      performanceRes.length < totalround ||
      rounds.length < totalround
    ) {
      return;
    }

    const xticksDIGIT = [1, 20, 40, 60, 80, 100].filter(v => v < totalround);
    const xticksFEMNIST = [1, 30, 60, 90, 120, 150].filter(v => v < totalround);
    //生成画布
    const svg = d3
      .select('#lineChart')
      .attr('width', width + 'px')
      .attr('height', height + 'px');
    svg.selectAll('*').remove();

    const maxValueOfAcc = Math.max(...performanceRes.map((o) => o.trainWAG.accuracy), 0);
    const maxValueOfLoss = Math.max(...performanceRes.map((o) => o.trainWAG.loss), 0);
    // 创建x轴的比例尺(线性比例尺)
    const xScale = d3
      .scaleLinear()
      .domain([1, totalround == 150 ? totalround : totalround + 1]) //数据
      .range([margin.left, width - margin.right]); //画布
    const accScale = d3
      .scaleLinear()
      .domain([0, maxValueOfAcc])
      .nice()
      .range([height - margin.bottom, margin.top]);
    const lossScale = d3
      .scaleLinear()
      .domain([0, maxValueOfLoss])
      .nice()
      .range([height - margin.bottom, margin.top]);

    //highlight
    svg
      .append('rect')
      .attr(
        'transform',
        'translate(' + xScale(curRound - showRoundNum + 1) + ',' + margin.top + ')'
      )
      .attr('fill', '#f2f2f1')
      .attr('width', xScale(curRound) - xScale(curRound - showRoundNum + 1))
      .attr('height', height - margin.bottom - margin.top);

    // 创建x轴
    svg
      .append('g')
      .attr('id', 'xAxis')
      .style('transform', 'translate(0, 180px)')
      .call(d3.axisBottom(xScale).tickValues(totalround == 150 ? xticksFEMNIST : xticksDIGIT));
    svg
      .append('text')
      .attr('font-size', '0.65em')
      .attr('text-anchor', 'start')
      .style('transform', 'translate(435px, 196px)')
      .text('Round');

    //left
    svg
      .append('g')
      .attr('id', 'accAxis')
      .style('transform', 'translate(60px, 0)')
      .call(d3.axisLeft(accScale).ticks(3));
    let accuracytitle = svg
      .append('g')
      .attr('width', 20)
      .attr('height', 50)
      .style('transform', 'translate(20px, 123px)');
    accuracytitle
      .append('text')
      .attr('font-size', '14px')
      .attr('text-anchor', 'start')
      //.style('transform', 'translate(60px, 50px)')
      .style('transform', 'rotate(-90deg)')
      .text('Accuracy');

    //right
    svg
      .append('g')
      .attr('id', 'lossAxis')
      .style('transform', 'translate(420px, 0)')
      .call(d3.axisRight(lossScale).ticks(3));
    let Losstitle = svg
      .append('g')
      .attr('width', 20)
      .attr('height', 50)
      .style('transform', 'translate(448px, 75px)');
    Losstitle.append('text')
      .attr('font-size', '14px')
      .attr('text-anchor', 'start')
      .style('transform', 'rotate(90deg)')
      .text('Loss');

    //accuracy
    const lineAcc = d3
      .line<PerformanceRes>()
      .x((d: PerformanceRes) => {
        return xScale(d.round) || 0;
      })
      .y((d: PerformanceRes) => {
        return accScale(d.trainWAG.accuracy) || 0;
      });
    svg
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', '#f4b95e')
      .attr('stroke-width', 1)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', lineAcc(performanceRes.slice(0, totalround)) || '');

    //loss
    const lineLoss = d3
      .line<PerformanceRes>()
      .x((d: PerformanceRes) => {
        return xScale(d.round);
      })
      .y((d: PerformanceRes) => {
        return lossScale(d.trainWAG.loss) || 0;
      });
    svg
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', '#bbb6d7')
      .attr('stroke-width', 1)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', lineLoss(performanceRes.slice(0, totalround)) || '');

    // //curRound数据点
    // svg.append('circle')
    //   .attr('id','curacc')
    //   .attr('fill', '#f4b95e')
    //   .attr('stroke', '#f4b95e')
    //   .data(performanceRes)
    //   .attr('r', 3)
    //   .attr('cx', xScale(curRound))
    //   .attr('cy', accScale(performanceRes[(showRoundNum-1)].trainWAG.accuracy));

    // svg.append('rect')
    //   .attr('id','curloss')
    //   .attr('fill', '#bbb6d7')
    //   .attr('stroke', '#bbb6d7')
    //   .data(performanceRes)
    //   .attr('width', 6)
    //   .attr('height', 6)
    //   .attr('transform', 'translate('
    //     + (xScale(curRound) - 3) + ','
    //     + (lossScale(performanceRes[(showRoundNum - 1)].trainWAG.loss) - 3)
    //     + ')');

    //鼠标focus事件
    let focus = svg.append('g').style('display', 'none');

    focus
      .append('line')
      .attr('id', 'focusLineY')
      .attr('fill', 'none')
      .attr('stroke', '#aeabab')
      .attr('stroke-dasharray', '5,5')
      .attr('stroke-width', '0.5px');
    //accuracy
    focus
      .append('circle')
      .attr('id', 'focusAcc')
      .attr('r', 3)
      .attr('fill', 'none')
      .attr('stroke-width', '1.5px')
      .attr('stroke', '#f4b95e');
    focus
      .append('text')
      .attr('id', 'AccText')
      .attr('font-size', '0.75em')
      .attr('text-anchor', 'start');

    //loss
    focus
      .append('circle')
      .attr('id', 'focusLoss')
      .attr('r', 3)
      .attr('fill', 'none')
      .attr('stroke-width', '1.5px')
      .attr('stroke', '#bbb6d7');

    focus
      .append('text')
      .attr('id', 'LossText')
      .attr('font-size', '0.75em')
      .attr('text-anchor', 'start');

    //round
    focus
      .append('text')
      .attr('id', 'RoundText')
      .attr('font-size', '0.63em')
      .attr('text-anchor', 'start');

    // d3.bisector() 获取当前曲线上x坐标对应数据中的点序号
    const bisect = d3.bisector(function(d: PerformanceRes) {
      return d.round;
    }).left;

    svg
      .append('rect')
      .attr('class', 'overPlane')
      .attr('width', width)
      .attr('height', height)
      .attr('opacity', 0)
      .on('mouseover', function() {
        focus.style('display', null);
        svg.selectAll('path').style('opacity', 1);
        d3.select('#xAxis').style('opacity', 1);
        d3.select('#accAxis').style('opacity', 1);
        d3.select('#lossAxis').style('opacity', 1);
        d3.select('#curacc').style('opacity', 1);
        d3.select('#curloss').style('opacity', 1);
      })
      .on('mouseout', function() {
        focus.style('display', 'none');
        svg.selectAll('path').style('opacity', 1);
        d3.select('#xAxis').style('opacity', 1);
        d3.select('#accAxis').style('opacity', 1);
        d3.select('#lossAxis').style('opacity', 1);
        d3.select('#curacc').style('opacity', 1);
        d3.select('#curloss').style('opacity', 1);
      })
      .on('mousemove', function() {
        const mouse = d3.mouse(this);
        const mouseDate = xScale.invert(mouse[0]);
        const i = bisect(performanceRes, mouseDate); // returns the index to the current data item

        const d0 = performanceRes[i - 1 >= 0 ? i - 1 : 0];
        const d1 = performanceRes[i <= totalround - 1 ? i : totalround - 1];
        const d = mouseDate - d0.round > d1.round - mouseDate ? d1 : d0;
        const x = xScale(d.round);
        const yAcc = accScale(d.trainWAG.accuracy);
        const yLoss = lossScale(d.trainWAG.loss);

        focus
          .select('#focusAcc')
          .attr('cx', x)
          .attr('cy', yAcc);
        focus
          .select('#AccText')
          .attr('transform', 'translate(' + (x + 6) + ',' + (yAcc + 3) + ')')
          .text(Math.round(d.trainWAG.accuracy * 10000) / 10000);
        //.text(d.trainWAG.accuracy)

        focus
          .select('#focusLoss')
          .attr('cx', x)
          .attr('cy', yLoss);
        focus
          .select('#LossText')
          .attr('transform', 'translate(' + (x + 6) + ',' + (yLoss + 4) + ')')
          .text(Math.round(d.trainWAG.loss * 10000) / 10000);

        focus
          .select('#focusLineY')
          .attr('transform', 'translate(' + x + ',' + 5 + ')')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', 0)
          .attr('y2', '180px');

        focus
          .select('#RoundText')
          .attr('transform', 'translate(' + (x - 8) + ',' + 196 + ')')
          .text(d.round);

        //透明度修改
        svg.selectAll('path').style('opacity', 0.4);
        d3.select('#xAxis').style('opacity', 0.4);
        d3.select('#accAxis').style('opacity', 0.4);
        d3.select('#lossAxis').style('opacity', 0.4);
        d3.select('#curacc').style('opacity', 0.4);
        d3.select('#curloss').style('opacity', 0.4);
      });

    //图例
    let legend = svg
      .append('g')
      .attr('class', 'legend')
      .attr('width', 200)
      .attr('height', 20);

    let accuracylegend = legend
      .append('g')
      .classed('accuracylegend', true)
      .attr('transform', `translate(130,205)`);

    accuracylegend
      .append('line')
      .attr('stroke-width', 2)
      .attr('stroke', '#f4b95e')
      .attr('transform', `translate(0,5)`)
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 24)
      .attr('y2', 0);

    accuracylegend
      .append('circle')
      .attr('fill', '#f4b95e')
      .attr('stroke', '#f4b95e')
      .attr('transform', `translate(12,5)`)
      .attr('r', 3);

    accuracylegend
      .append('text')
      .attr('font-size', '0.75em')
      .attr('text-anchor', 'start')
      .attr('dy', 10)
      .attr('dx', 30)
      .text('Accuracy');

    let losslegend = legend
      .append('g')
      .classed('losslegend', true)
      .attr('transform', `translate(280,205)`);

    losslegend
      .append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 24)
      .attr('y2', 0)
      .attr('transform', `translate(0,5)`)
      .attr('stroke', '#bbb6d7')
      .attr('stroke-width', 2);

    losslegend
      .append('circle')
      .attr('fill', '#bbb6d7')
      .attr('stroke', '#bbb6d7')
      .attr('transform', `translate(12,5)`)
      .attr('r', 3);

    losslegend
      .append('text')
      .attr('font-size', '0.75em')
      .attr('text-anchor', 'start')
      .attr('dy', 10)
      .attr('dx', 30)
      .text('Loss');
  }, [curRound, rounds, performanceRes, showRoundNum, totalround]);

  return (
    <div className="performance-div">
      <div className="linechart-div">
        <svg id="lineChart" className="performance-svg"></svg>
      </div>
    </div>
  );
}

export const PerformancePane = connect(
  null,
  createDispatchHandler<ServerAction>()
)(PerformancePaneBase);
