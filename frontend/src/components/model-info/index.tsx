import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export default function(): JSX.Element {
  const modelInfo = [
    {
      id: '0',
      name: '',
      value: 0,
      color: '#000000'
    },
    {
      id: '1',
      name: 'conv1',
      value: 6,
      color: '#9DC3E6'
    },
    {
      id: '2',
      name: '',
      value: 6,
      color: '#D9D9D9'
    },
    {
      id: '3',
      name: 'conv2',
      value: 4,
      color: '#9DC3E6'
    },
    {
      id: '4',
      name: '',
      value: 4,
      color: '#D9D9D9'
    },
    {
      id: '5',
      name: 'dense',
      value: 2,
      color: '#9DC3E6'
    },
    {
      id: '6',
      name: '',
      value: 2,
      color: '#D9D9D9'
    },
    {
      id: '7',
      name: '',
      value: 2,
      color: '#D9D9D9'
    }
  ];
  const divRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const divEle = divRef.current;
    if (divEle == null) {
      return;
    }
    const getWidth = (multiple: number) => divEle.clientWidth * multiple;
    const getHeight = (multiple: number) => divEle.clientHeight * multiple;

    const svgBoundingRect = {
      width: getWidth(0.6),
      height: getHeight(0.8),
      left: getWidth((1 - 0.6) / 2),
      top: getHeight((1 - 0.8) / 2)
    };

    const rectWidth = getWidth(0.025);

    const svg = d3
      .select(divEle)
      .append('svg')
      .attr('width', svgBoundingRect.width)
      .attr('height', svgBoundingRect.height)
      .attr('transform', `translate(${svgBoundingRect.left}, ${svgBoundingRect.top})`);

    const x = d3
      .scaleBand()
      .domain(modelInfo.map((d) => d.id))
      // scaleBand.domain 是一个数组；scaleLinear.domain [min. max] 二元
      // 左右有留空
      // .scaleLinear()
      // .domain([0, modelInfo.length - 1])
      .range([0, svgBoundingRect.width]);
    // svg.call(d3.axisBottom(x));

    const maxY = d3.max(modelInfo, (d) => d.value) || 0;
    const y = d3
      .scaleLinear()
      .domain([-maxY * 1.5, maxY * 1.5])
      .range([svgBoundingRect.height, 0]);
    // svg.call(d3.axisRight(y));

    // 画长方形
    svg
      .selectAll()
      .data(modelInfo)
      .join('rect')
      // .append('line')
      .attr('x', (d) => x(d.id) as number)
      .attr('y', (d) => y(d.value))
      .attr('width', rectWidth)
      .attr('height', (d) => (y(0) - y(d.value)) * 2)
      .attr('stroke', 'none')
      .attr('fill', (d) => d.color);

    // 添加文字
    svg
      .selectAll()
      .data(modelInfo)
      .join('text')
      .attr('x', (d) => (x(d.id) as number) - 10)
      .attr('y', y(-maxY) * 1.13)
      .style('font-size', '10px')
      .text((d) => d.name);

    const arrowData = [
      { id: '0' },
      { id: '1' },
      { id: '2' },
      { id: '3' },
      { id: '4' },
      { id: '5' },
      { id: '6' }
    ];
    const arrowWidth = (x(modelInfo[1].id) as number) - (x(modelInfo[0].id) as number) - rectWidth;
    const arrowHeight = getWidth(0.01);
    const arrowOffsetX = (arrowWidth / 4) * 3;
    const arrowColor = '#D9D9D9';
    // 画连接箭头横线
    svg
      .selectAll()
      .data(arrowData)
      .join('line')
      .attr('x1', (d) => (x(d.id) as number) + rectWidth)
      .attr('y1', y(0))
      .attr('x2', (d) => (x(d.id) as number) + rectWidth + arrowWidth)
      .attr('y2', y(0))
      .attr('stroke', arrowColor);
    // 画箭头的上部分
    svg
      .selectAll()
      .data(arrowData)
      .join('line')
      .attr('x1', (d) => (x(d.id) as number) + rectWidth + arrowOffsetX)
      .attr('y1', y(0) - arrowHeight)
      .attr('x2', (d) => (x(d.id) as number) + rectWidth + arrowWidth)
      .attr('y2', y(0))
      .attr('stroke', arrowColor);
    // 画箭头的下部分
    svg
      .selectAll()
      .data(arrowData)
      .join('line')
      .attr('x1', (d) => (x(d.id) as number) + rectWidth + arrowOffsetX)
      .attr('y1', y(0) + arrowHeight)
      .attr('x2', (d) => (x(d.id) as number) + rectWidth + arrowWidth)
      .attr('y2', y(0))
      .attr('stroke', arrowColor);

    // 添加最前面的图片
    const imgWidth = getWidth(0.08);
    d3.select(divEle)
      .append('img')
      .attr('src', '/database.png')
      .style('position', 'absolute')
      .style('left', `${svgBoundingRect.left - imgWidth / 2}px`)
      .style('top', `calc(50% - ${imgWidth / 2}px)`)
      .style('width', `${imgWidth}px`)
      .style('height', `${imgWidth}px`);
  }, []);
  return <div ref={divRef} style={{ width: '100%', height: '100%' }} />;
}
