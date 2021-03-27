import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { PerformanceRes, State, } from '../../types';
import { createDispatchHandler, ActionHandler } from '../../actions/redux-action';
import { ServerAction, SET_SHOW_ROUND_NUM} from '../../actions';
import * as d3 from 'd3';

import './brushplot.css'

interface BrushPaneProps extends ActionHandler<ServerAction>{
  curRound: number,
  showRoundNum: number,
  width: number
  totalround: number;
  performanceRes: PerformanceRes[]
}

function BrushPaneBase(this: any, props: BrushPaneProps): JSX.Element {
  const { curRound, showRoundNum, width, totalround, performanceRes} = props;
  const isVisible = performanceRes.length > 0;
  const startValueRef = useRef(curRound - showRoundNum + 1);
  const endValueRef = useRef(curRound);
  const max=99;
  const xticksDIGIT=[1, 20, 40, 60, 80 , 100].filter(v => v < totalround);
  const xticksFEMNIST=[1, 30, 60, 90, 120 , 150].filter(v => v < totalround);
  let end=curRound;
  let start = curRound -showRoundNum + 1;
  useEffect(() => {

    const svgbrush = d3.select('#brushChart')
      .attr('width', width)
      .attr('height', '20px');
    svgbrush.selectAll('*').remove();

    const x = d3.scaleLinear()
      .domain([1, totalround == 150 ? totalround : totalround + 1])//数据
      .range([65, width - 25]);//画布

    //滑动条x轴
    svgbrush.append('g')
      .attr('id','xAxis')
      .style('transform', 'translate(0px, 12px)')
      .call(d3.axisBottom(x).tickValues(totalround == 150 ? xticksFEMNIST : xticksDIGIT));

    //外框
    svgbrush.append('rect')
      .attr('id', 'brushframe')
      .attr('transform', `translate(65,0)`)
      .attr('stroke-width', '1px')
      .attr('stroke', '#3e3f3f')
      .attr('fill','none')
      .attr('width', 360)
      .attr('height', 13)


    //brush
    const brush = d3.brushX()
      .extent([[65, 2], [width - 25,12]])//表明最初设定的框选范围。;
      .on('end', brushend)
      .on('brush', brushing)

    const brushG = svgbrush.append('g')
      .call(brush)
      .attr('stroke-width', '1px');
    if (isVisible) {
      brushG.call(brush.move, [curRound-showRoundNum+1, curRound].map(x));
    }

    //brush样式修改
    svgbrush.selectAll('.selection')
      .attr('fill','#d8d8d8')

    svgbrush.selectAll('.handle')
      .attr('fill','#767171')
      .attr('height', 14)

    svgbrush.selectAll('path')
      .attr('opacity','0')


    //加线
    let handles = svgbrush.append('g')
      .attr('width', width)
      .attr('height', '20px');

    let righthandle = handles.append('g')
        .attr('id','righthandle')
        .attr('width', '20px')
        .attr('height', '20px')
        .attr('transform', 'translate(' + (x(start) - 3)  + ',' + 0 + ')')
    let lefthandle = handles.append('g')
        .attr('id','lefthandle')
        .attr('width', '20px')
        .attr('height', '20px')
        .attr('transform', 'translate(' + (x(end) - 3)  + ',' + 0 + ')')
    const locate : number[] = [4.5, 7, 9.5];
    for(let index = 0; index < 3; index++)
    {
      righthandle.append('line')
      .attr('stroke-width', 0.8)
      .attr('stroke', 'white')
      .attr('transform', 'translate(' + 0  + ',' + locate[index] + ')')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 7)
      .attr('y2', 0);

      lefthandle.append('line')
      .attr('stroke-width', 0.8)
      .attr('stroke', 'white')
      .attr('transform', 'translate(' + 0  + ',' + locate[index] + ')')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 7)
      .attr('y2', 0);
    }
    //tooltip
    d3.select('#startround-div')
      .style('left', x(start) - 14+"px")
    d3.select('#endround-div')
      .style('left', x(end) - 13+"px")
    d3.select('#startround')
      .property('value', start)
    d3.select('#endround')
      .property('value', end)

    function brushing() {
      const selection = d3.event.selection;
      if(selection === null )
      {
        return;
      }
      else{
        const [x0, x1] = selection.map(x.invert);
        end = (x1 + 0.000001) | 0;
        start = (x0 + 0.00001) | 0;
        if(end == curRound && (end - start + 1) == showRoundNum)
        {
          return;
        }
        if(end > max && totalround == max)
        {
          end = max;
        }
        d3.select('#startround-div')
          .style('left', x(start) - 14+"px")
        d3.select('#endround-div')
          .style('left', x(end) - 13+"px")
        d3.select('#startround')
          .property('value', start)
        d3.select('#endround')
          .property('value', end)
        d3.select('#righthandle')
          .attr('transform', 'translate(' + (x(start) - 3)  + ',' + 0 + ')')
        d3.select('#lefthandle')
        .attr('transform', 'translate(' + (x(end) - 3)  + ',' + 0 + ')')

      }
    }
    function brushend() {
      const selection = d3.event.selection;
      if(selection === null )
      {
        return;
      }
      else{
        const [x0, x1] = selection.map(x.invert);
        end = (x1 + 0.000001) | 0;
        start = (x0 + 0.00001) | 0;
        if(end == curRound && (end - start + 1) == showRoundNum)
        {
          return;
        }
        if(end > max && totalround == max)
        {
          end = max;
        }
        props.handleAction({
          type: SET_SHOW_ROUND_NUM,
          payload: {
            round: end,
            showRoundNum: end - start + 1
          }
        })
      }
    }

}, [curRound, showRoundNum, totalround, performanceRes]);
  return(
    <div className='brush-div'>
        <svg id='brushChart' className='brush-svg' >
        </svg>
        <div className='tooltips' style={{visibility: isVisible ? 'visible' : 'hidden'}}>
          <div id='startround-div' className='d3-tip'>
            <input id='startround' className='d3-input'
            onChange={(e)=>{
              startValueRef.current = parseInt(e.target.value);
            }}
            onKeyDown={
              (e)=>{
                if(e.keyCode == 13) {
                  props.handleAction({
                      type: SET_SHOW_ROUND_NUM,
                      payload: {
                        round: curRound,
                        showRoundNum: curRound - startValueRef.current + 1
                      }
                   })
                }
            }}
            defaultValue={curRound - showRoundNum + 1}
            //key = {curRound - showRoundNum + 1}
            ></input>
          </div>
          <div id='endround-div' className='d3-tip'>
            <input id='endround' className='d3-input'
            onChange={(e)=>{
              endValueRef.current = parseInt(e.target.value);
            }}
            onKeyDown={
              (e)=>{
                if(e.keyCode == 13) {
                  props.handleAction({
                      type: SET_SHOW_ROUND_NUM,
                      payload: {
                        round: endValueRef.current,
                        showRoundNum: endValueRef.current- (curRound - showRoundNum)
                      }
                   })
                }
            }}
            defaultValue={curRound}
            //key = {curRound}
            ></input>
          </div>
        </div>

    </div>
  )
}

const mapStateToProps = (state: State) => ({
  showRoundNum: state.Server.showRoundNum,
  curRound: state.Server.round,
});

export const BrushPane = connect(
  mapStateToProps,
  createDispatchHandler<ServerAction>()
)(BrushPaneBase);
