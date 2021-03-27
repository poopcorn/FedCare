import React from 'react';
import { connect } from 'react-redux';
import { State, LayerType, DatasetType, PerformanceRes } from '../../types';
import { createDispatchHandler, ActionHandler } from '../../actions/redux-action';
import modelSvg from '../../assets/icons/model.svg';
import layerSvg from '../../assets/icons/Layer.svg';
import datasetSvg from '../../assets/icons/data.svg';

import './serverplot.css'
import { ServerAction, SET_DATASET, SET_SERVER_LAYER, SET_SERVER_MODEL } from '../../actions';

// props声明和对应组件写在一起
interface ServerPlotPaneProps extends ActionHandler<ServerAction>{
  clientNum: number,
  performanceRes: PerformanceRes[]
}

function ServerPlotPaneBase(props: ServerPlotPaneProps): JSX.Element {
  const { clientNum, performanceRes } = props;
  const isVisible = performanceRes.length > 0;
  
  return (
    <div className='server_main'>
      <div className='display-div'>
        <div className='titles-div'>
          <div className='databox'>
            <img src={datasetSvg} className='svg-class1'></img>
            <p>Dataset</p>
          </div>
          <div className='databox'>
          <img src={modelSvg} className='svg-class3'></img>
            <p> Model</p>
          </div>
          <div className='databox'>
            <img src={layerSvg} className='svg-class2' ></img>
            <p>  Layer</p>
          </div>
        </div>
        <div className='input-div'>
          <div className='databox'>
            <select
            onChange={(e)=>
              props.handleAction({
                type: SET_DATASET,
                payload: {
                  dataset: e.target.value=='FEMNIST' ? 'FEMNIST' : 'DIGIT5',
                }
              })
            }
            //value={dataset}
            className='selectbox'>
                <option style={{'display' : 'none'}} value=''></option>
                <option value="DIGIT5">DIGIT5</option>
                <option value="FEMNIST">FEMNIST</option>
            </select>
          </div>
          <div className='databox'>
            <select className='selectbox'
              onChange={(e) => {
                props.handleAction({
                  type: SET_SERVER_MODEL,
                  payload: {
                    model: 'LeNet'
                  }
                })
              }}
            >
                <option style={{'display' : 'none'}} value=''></option>
                <option value='LeNet'>LeNet</option>
            </select>
          </div>
          <div className='databox'>
            <select
              onChange={(e)=>
                props.handleAction({
                  type: SET_SERVER_LAYER,
                  payload: {
                    layer: e.target.value =='layer2' ? 'layer2' : 'layer1'
                  }
                })
              }
              //value={layer}
              className='selectbox'>
                <option style={{'display' : 'none'}} value=''></option>
                <option value="layer1">LAYER1</option>
                <option value="layer2">LAYER2</option>
                {/* <option value='conv1'>conv1</option>
                <option value='conv2'>conv2</option> */}
            </select>
          </div>
        </div>
    </div>
    <div className='divider-div'></div>
    <div className='display-div'>
      <div className='rate-div'>
        <div className='labels-div'>
          <p>Learning Rate</p>
        </div>
        <div className='results-div'>
          <p>{isVisible ? 0.05 : 0}</p>
        </div>
      </div>
      <div className='clients-div'>
        <div className='labels-div'>
          <p>#Clients</p>
        </div>
        <div className='results-div'>
          <p>{isVisible ? clientNum : 0}</p>
        </div>
      </div>
    </div>
  </div>

  );
}
const mapStateToProps = (state: State) => ({
  clientNum: state.Server.clientNum,
  performanceRes: state.Server.performanceRes
});

export const ServerPlotPane = connect(
  mapStateToProps,
  createDispatchHandler<ServerAction>()
)(ServerPlotPaneBase);
