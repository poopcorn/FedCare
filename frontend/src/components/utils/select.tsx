import React, { useRef } from 'react';
import './select.css';

export interface Style {
    width?: number,
    height?: string,
    top?: string,
    fontWeight?: number
};

export interface OptionProps {
  value: number,
  content: string,
};

interface SelectProps {
    style: Style,
    title: string,
    options: OptionProps[],
    selected: boolean[],
    checkBox: boolean,
    btnClick: Function,
};
export function Select(props: SelectProps): JSX.Element {
    const {style, selected, options, title} = props;
    const height: number = style.height ? parseInt(style.height) : 20;
    const normalContent = options.map((v, i) =>
      <div 
          key={`option-content-${i}`} 
          className={'select-option' + (selected[i] === true && props.checkBox === false  ? ' select-option-checked' : '')}
          onClick={(): void => {props.btnClick(v.value); if (props.checkBox === false) selectBtn();}}>
          {props.checkBox ? 
            <input type='checkbox' checked={selected[i] === true} readOnly></input>
            :
            null
          }
          {v.content}
      </div>
      );
    const contentRef = useRef(null);
    const diretcionRef = useRef(null);
    const selectBtn = (): void => {
        //@ts-ignore
        if (contentRef.current.style.visibility === 'hidden') {
            //@ts-ignore
            contentRef.current.style.visibility = 'visible';diretcionRef.current.className = 'select-up';
        }
        else{
            //@ts-ignore
            contentRef.current.style.visibility = 'hidden';diretcionRef.current.className = 'select-down';
        }
    };    
    return (
        <div style={{...style}} className='select-div'>
            <div className='select-selector' style={{borderRadius: height / 2}} onClick={selectBtn}>
                <div style={{padding: '0 15px'}}>{title}</div>
                <div 
                    ref={diretcionRef}
                    className='select-down'
                />
            </div>
            <div className='select-content' ref={contentRef} style={{visibility: 'hidden', borderRadius: height / 2}}>
                <div style={{height: height + 1 + 'px'}}></div>
                {normalContent}
            </div>
        </div>
    );
}