import React, { useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { RoundRange, State } from '../../types';
import { createDispatchHandler, ActionHandler } from '../../actions/redux-action';
import adversarySvg from '../../assets/icons/adversary.svg';

import './detection.css'
import {ClientAction, SET_START_ROUND, SET_END_ROUND, SET_ADVERSARY_VISIBLE, ImpactAction, SET_IMPACT_ROUND_RANGE, IMPACT_COMPUTE } from '../../actions';
import * as d3 from 'd3';

// props声明和对应组件写在一起
interface AdversaryPaneProps extends ActionHandler<ClientAction | ImpactAction>{
  roundRange: RoundRange,
  selectedClient: number,
  threshold: number,
  extend: boolean,
  totalround: number;
}

function AdversaryPaneBase(this: any, props: AdversaryPaneProps): JSX.Element {
  const { extend, roundRange, threshold, selectedClient, totalround} = props;
  const { start, end } = roundRange;
  const startValueRef = useRef(start);
  const endValueRef = useRef(end);
  const max = 99;
  const xticksDIGIT=[1, 20, 40, 60, 80 , 100];
  const xticksFEMNIST=[1, 30, 60, 90, 120 , 150];
  let endround = start;
  let startround = end;

  useEffect(() => {
    const width =450;
    const svgbrush = d3.select('#mychart')
      .attr('width', width)
      .attr('height', '20px');
    svgbrush.selectAll('*').remove();

    const x = d3.scaleLinear()
      .domain([1, totalround == 150 ? totalround : totalround + 1])//数据
      .range([65, width - 25]);//画布

    //滑动条x轴
    svgbrush.append('g')
      .attr('id','xAxis')
      .style('transform', 'translate(0px, 15px)')
      .call(d3.axisBottom(x).tickValues(totalround == 150 ? xticksFEMNIST : xticksDIGIT));

    //外框
    svgbrush.append('rect')
      .attr('id', 'brushframe')
      .attr('transform', `translate(65,2)`)
      .attr('stroke-width', '1px')
      .attr('stroke', '#3e3f3f')
      .attr('fill','none')
      .attr('width', 360)
      .attr('height', 13);

    const brushend = () => {
      const selection = d3.event.selection;
      if(selection === null ) {
        return;
      }
      else {
        const [x0, x1] = selection.map(x.invert);
        endround = (x1 + 0.000001) | 0;
        startround = (x0 + 0.00001) | 0;
        if(endround == end && startround == start) {
          return;
        }
        if(endround > max && totalround == max)
        {
          endround = max;
        }
        props.handleAction({
          type: SET_IMPACT_ROUND_RANGE,
          payload: {
            start:startround,
            end: endround,
          }
        });
      }
    };
    //brush
    const brush = d3.brushX()
      .extent([[65, 4], [width - 25,14]])//表明最初设定的框选范围。;
      .on('end', brushend)
      .on('brush', brushing);

    svgbrush.append('g')
      .call(brush)
      .attr('stroke-width', '1px')
      .call(brush.move, [start, end].map(x));

    //brush样式修改
    svgbrush.selectAll('.selection')
      .attr('fill','#d8d8d8')
    svgbrush.selectAll('.handle')
      .attr('fill','#767171')
      .attr('height', 14)

    svgbrush.selectAll('path')
      .attr('opacity','0')

    let handles = svgbrush.append('g')
      .attr('width', width)
      .attr('height', '20px');

    let righthandle = handles.append('g')
        .attr('id','clientrighthandle')
        .attr('width', '20px')
        .attr('height', '20px')
        .attr('transform', 'translate(' + (x(startround) - 3)  + ',' + 0 + ')')
    let lefthandle = handles.append('g')
        .attr('id','clientlefthandle')
        .attr('width', '20px')
        .attr('height', '20px')
        .attr('transform', 'translate(' + (x(endround) - 3)  + ',' + 0 + ')')
    const locate : number[] = [5, 7.5, 10];
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
    d3.select('#clientstartround')
      .property('value', startround)
    d3.select('#clientendround')
      .property('value', endround)

    function brushing() {
      const selection = d3.event.selection;
      if(selection === null )
      {
        return;
      }
      else{
        const [x0, x1] = selection.map(x.invert);
        endround = (x1 + 0.000001) | 0;
        startround = (x0 + 0.00001) | 0;
        if(endround == end && startround == start)
        {
          return;
        }
        if(endround > max && totalround == max)
        {
          endround = max;
        }
        d3.select('#clientstartround')
          .property('value', startround)
        d3.select('#clientendround')
          .property('value', endround)
        d3.select('#clientrighthandle')
          .attr('transform', 'translate(' + (x(startround) - 3)  + ',' + 0 + ')')
        d3.select('#clientlefthandle')
          .attr('transform', 'translate(' + (x(endround) - 3)  + ',' + 0 + ')')
      }
    }

}, [start, end, totalround]);
  return (
    <div  className = 'adversary-main' >
      <div className='adversary-title' onClick={
        (e)=>{
          if(extend) {
            props.handleAction({
                type: SET_ADVERSARY_VISIBLE,
                payload: {
                   extend: false
                }
             })
          }
          else{
            props.handleAction({
                type: SET_ADVERSARY_VISIBLE,
                payload: {
                   extend: true
                }
             })
          }
        }
      }>
          <img src={adversarySvg} className='svg-class'></img>
          <p>Impact Analysis</p>
      </div>
        <svg id='mychart' className='adversary-brush-svg' style={{'display':extend ? 'flex' : 'none'}}></svg>
      <div className='adversary-data' style={{'display':extend ? 'flex' : 'none'}}>
        <div className='data-content'>
          <div className='content-box'>
            <div className='data-box'>
              <p>Start Round</p>
            </div>
            <div className='data-box'>
              <p>Selected Client</p>
            </div>
          </div>
          <div className='content-box'>
            <div className='data-box'>
              <input id='clientstartround' className='input-box'
              onChange={(e)=>{
                startValueRef.current = parseInt(e.target.value);
              }}
              onKeyDown={
                (e)=>{
                  if(e.keyCode == 13) {
                    props.handleAction({
                        type: SET_START_ROUND,
                        payload: {
                           start: startValueRef.current
                        }
                     })
                  }
              }}
              defaultValue={start}
              //key = {start}
              ></input>
            </div>
            <div className='data-box'>
              <input id='selectedclient' className='input-box' defaultValue={selectedClient} />
            </div>
          </div>
        </div>
        <div className='data-content'>
          <div className='content-box-right'>
            <div className='data-box'>
              <p>End Round</p>
            </div>
            <div className='data-box'>
              <p>Threshold</p>
            </div>
          </div>
          <div className='content-box'>
            <div className='data-box'>
              <input id='clientendround'className='input-box'
              onChange={(e)=>{
                parseInt(e.target.value) > max ? e.target.value='99' : e.target.value = e.target.value;
                endValueRef.current = parseInt(e.target.value);
              }}
              onKeyDown={
                (e)=>{
                  if(e.keyCode == 13) {
                    props.handleAction({
                        type: SET_END_ROUND,
                        payload: {
                          end: endValueRef.current
                        }
                     })
                  }
              }}
              defaultValue={end}
              //key = {end}
              ></input>
            </div>
            <div className='data-box'>
              <input id='threshold' className='input-box' defaultValue={threshold}/>
            </div>
          </div>
        </div>
      </div>
      <div className='button-box' style={{'display':extend ? 'flex' : 'none'}}>
          <input type='button' className='compute-button' value='Compute' onClick={
            (e)=>{
              props.handleAction({
                  type: IMPACT_COMPUTE,
                  payload: {
                    clientId: Number((document.getElementById('selectedclient') as HTMLInputElement).value),
                    threshold: Number((document.getElementById('threshold') as HTMLInputElement).value),
                    start: start,
                    end: end
                  }
               })
            }
          }></input>
      </div>
    </div>


  );
}
const mapStateToProps = (state: State) => ({
  roundRange: state.Impact.roundRange,
  selectedClient: state.Impact.selectedClient,
  threshold: state.Impact.threshold,
  extend: state.Client.extend,
  totalround: state.Server.totalround
});

export const AdversaryPane = connect(
  mapStateToProps,
  createDispatchHandler<ClientAction | ImpactAction>()
)(AdversaryPaneBase);
