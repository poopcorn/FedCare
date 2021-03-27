import React, { useState } from 'react';
import { connect } from 'react-redux';
import recordSvg from '../../assets/icons/record.svg';
import warnSvg from '../../assets/icons/warning.svg';
import './record.css'
import { RecordAction, SET_NATURE, SET_DECISION, SET_NATURE_DECISION, SET_WARNING_VISIBLE, SET_REPORT } from '../../actions/record';
import { ActionHandler, createDispatchHandler } from '../../actions/redux-action';
import { NatureType, DecisionType } from '../../types/record';
import { State, DatasetType } from '../../types';
import { start } from 'repl';

export interface RecordProps extends ActionHandler<RecordAction>{
   nature: NatureType,
   decision: DecisionType,
   warningVisible: boolean,
   clientNum: number
};

export function RecordPaneBase(props:RecordProps): JSX.Element {
  const {nature, decision, warningVisible, clientNum}=props;
  const getClear = () =>
  {
    (document.getElementsByClassName( 'record-select' )[ 0 ] as HTMLInputElement).value='1';
    // (document.getElementsByClassName( 'record-select' )[ 1 ] as HTMLInputElement).value='Add to Blacklist';
    // (document.getElementsByClassName( 'record-select' )[ 2 ] as HTMLInputElement).value='Malicious';
    (document.getElementsByClassName( 'record-input' )[ 0 ] as HTMLInputElement).value='';
    (document.getElementsByClassName( 'reason-input' )[ 0 ] as HTMLInputElement).value='';
    props.handleAction({
      type: SET_REPORT,
      payload: {
        nature: 'Malicious',
        decision: 'Add to Blacklist',
        warningVisible: !warningVisible
      }
    })
  }
  const clients : string[]=[];
  for(let j = 0; j < clientNum ; j++)
  {
    clients[j]=j.toString(); //这个兼容IE与firefox 
  }
  return (

    <div className='Frame RecordView'>
      <div className='title'>
        <img src={recordSvg} className='svg-class'></img>
        <p>RECORDING</p>
        <input type='button' className='save-button' value='Save'></input>
        <input type='button' className='report-button' value='Report'
          onClick={()=>
            props.handleAction({
              type: SET_WARNING_VISIBLE,
              payload: {
                warningVisible: !warningVisible
              }
          })}></input>
      </div>
      <div className='record-content'>
        <div className='titles-content'>
          <div className='title-div'>
            <p>Client</p>
          </div>
          <div className='title-div'>
            <p>Decision</p>
          </div>
          <div className='title-div'>
            <p>Reason</p>
          </div>
        </div>
        <div className='input-content'>
          <div className='title-div'>
            <select className='record-select' id='client'>
              <option style={{'display' : 'none'}} value=''></option>
              {clients.map((v, i) => (
                  <option value={v} key={i}>{v}</option>
                ))
              }
            </select>
          </div>
          <div className='title-div'>
            <select
              defaultValue={decision}
              className='record-select'
              id='decision'
              key= {decision}
              onChange={(e)=>
                props.handleAction({
                  type: SET_DECISION,
                  payload: {
                    decision: e.target.value=='Add to Blacklist' ? 'Add to Blacklist' : 'Adjust Weight'
                  }
                })
              }>
                <option style={{'display' : 'none'}} value=''></option>
                <option value='Add to Blacklist'>Add to Blacklist</option>
                <option value='Adjust Weight'>Adjust Weight</option>
            </select>
          </div>
        </div>
        <div className='titles-content'>
          <div className='title-div'>
            <p>Nature</p>
          </div>
          <div id='weighttitle' className='title-div' style= {{'display':decision == 'Adjust Weight' ? 'flex' : 'none'}}>
            <p>Weight</p>
          </div>
        </div>
        <div className='input-content'>
          <div className='title-div'>
            <select className='record-select' id='nature'
              defaultValue={nature == 'Malicious' ? 'Add to Blacklist' : 'Adjust Weight'}
              onChange={(e)=>
                props.handleAction({
                  type: SET_NATURE_DECISION,
                  payload: {
                    nature: e.target.value=='Malicious' ? 'Malicious' : 'Non-Malicious',
                    decision: e.target.value == 'Malicious' ? 'Add to Blacklist' : 'Adjust Weight'
                  }
                })
              }>
              <option style={{'display' : 'none'}} value=''></option>
              <option value='Malicious'>Malicious</option>
              <option value='Non-Malicious'>Non-Malicious</option>
            </select>
          </div>
          <div id='weightinput' className='title-div' style= {{'display':decision == 'Adjust Weight' ? 'flex' : 'none'}}>
            <input id='weight' className='record-input' defaultValue=''></input>
          </div>
        </div>
      </div>
      <div className='reason-div'>
        <textarea id='reason' className='reason-input' defaultValue=''></textarea>
      </div>
      <div className='Frame Warn' style={{visibility: warningVisible ? 'visible' : 'hidden'}}>
        <div className='title'>
          <img src={warnSvg} className='svg-class'></img>
          <p>WARNING</p>
        </div>
        <div className='warn-content'>
          <p>This will report your decision to the model. Are you sure to perform the operation?</p>
        </div>
        <div className='button-content'>
          <input type='button' className='ok-button' value='Report' onClick={getClear}></input>
          <input type='button' className='cancel-button' value='Cancel' onClick={()=>
            props.handleAction({
              type: SET_WARNING_VISIBLE,
              payload: {
                warningVisible: !warningVisible
              }
          })}></input>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state: State) => ({
  nature: state.Record.nature,
  decision: state.Record.decision,
  warningVisible: state.Record.warningVisible,
  clientNum: state.Server.clientNum
});

export const RecordPane = connect(
  mapStateToProps,
  createDispatchHandler<RecordAction>()
)(RecordPaneBase);

