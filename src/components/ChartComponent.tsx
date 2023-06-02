import React from 'react';
import ReactDOM from 'react-dom';
import * as LightweightCharts from 'lightweight-charts';
import { volumeData } from '../shared/volumeData';
import { dayData, monthData, weekData, yearData } from '../shared/priceData';

function createSimpleSwitcher(items: any, activeItem: any, activeItemChangedCallback: any) {
  var switcherElement = document.createElement('div');
  switcherElement.classList.add('switcher');

  var intervalElements = items.map(function (item: any) {
    var itemEl = document.createElement('button');
    itemEl.innerText = item;
    itemEl.classList.add('switcher-item');
    itemEl.classList.toggle('switcher-active-item', item === activeItem);
    itemEl.addEventListener('click', function () {
      onItemClicked(item);
    });
    switcherElement.appendChild(itemEl);
    return itemEl;
  });

  function onItemClicked(item: any) {
    if (item === activeItem) {
      return;
    }

    intervalElements.forEach(function (element: any, index: any) {
      element.classList.toggle('switcher-active-item', items[index] === item);
    });

    activeItem = item;

    activeItemChangedCallback(item);
  }

  return switcherElement;
}

export const ChartComponent = () => {
  var intervals = ['1D', '1W', '1M', '1Y'];
  var chartElement = document.createElement('div');
  chartElement.classList.add('chart');


  var chart = LightweightCharts.createChart(chartElement, {
    width: 600,
    height: 300,
    rightPriceScale: {
      scaleMargins: {
        top: 0.3,
        bottom: 0.25,
      },
      borderVisible: false,
    },
    layout: {
      background: {
        color: '#ffffff',
      },
      textColor: '#333',
    },
    grid: {
      horzLines: {
        color: '#eee',
      },
      vertLines: {
        color: '#ffffff',
      },
    },
    timeScale: {
      borderVisible: false,
    },
    crosshair: {
      horzLine: {
        visible: true,
        labelVisible: true
      },
      vertLine: {
        visible: true,
        labelVisible: true,
      }
    },
  });
  
  var volumeSeries = chart.addHistogramSeries({
    color: '#26a69a',
    priceFormat: {
      type: 'volume',
    },
    priceScaleId: '',
  });

  chart.priceScale('').applyOptions({
    scaleMargins: {
      top: 0.8,
      bottom: 0,
    },
  });


  var seriesesData = new Map([
    ['1D', dayData],
    ['1W', weekData],
    ['1M', monthData],
    ['1Y', yearData],
  ]);

  volumeSeries.setData([
    ...volumeData
  ]);

  var switcherElement = createSimpleSwitcher(intervals, intervals[0], syncToInterval);

  document.body.appendChild(chartElement);
  document.body.appendChild(switcherElement);

  var areaSeries: any = null;

  function syncToInterval(interval: any) {
    if (areaSeries) {
      chart.removeSeries(areaSeries);
      areaSeries = null;
    }

    areaSeries = chart.addAreaSeries({
      topColor: 'rgba(255, 82, 82, 0.56)',
      bottomColor: 'rgba(255, 82, 82, 0.04)',
      lineColor: 'rgba(255, 82, 82, 1)',
      lineWidth: 2,
    });
    areaSeries.setData(seriesesData.get(interval));

    const toolTipWidth = 80;
    const toolTipHeight = 80;
    const toolTipMargin = 15;

    const toolTip: any = document.createElement('div');
    toolTip.classList.add('tool-tip');
    toolTip.style = `width: 96px; height: 80px; position: absolute; display: none; padding: 8px; box-sizing: border-box; font-size: 12px; text-align: left; z-index: 1000; top: 12px; left: 12px; pointer-events: none; border: 1px solid; border-radius: 2px;font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`;
    toolTip.style.background = 'white';
    toolTip.style.color = 'black';
    toolTip.style.borderColor = 'rgba(255, 82, 82, 1)';
    chartElement.appendChild(toolTip);

    // update tooltip
    chart.subscribeCrosshairMove(param => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > chartElement.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chartElement.clientHeight
      ) {
        toolTip.style.display = 'none';
      } else {
        // time will be in the same format that we supplied to setData.
        // thus it will be YYYY-MM-DD
        const dateStr = param.time;
        toolTip.style.display = 'block';
        const data: any = param.seriesData.get(areaSeries);
        const price = data?.value !== undefined ? data?.value : data?.close;
        toolTip.innerHTML = `<div style="color: ${'rgba(255, 82, 82, 1)'}">ABC Inc.</div><div style="font-size: 24px; margin: 4px 0px; color: ${'black'}">
			${Math.round(100 * price) / 100}
			</div><div style="color: ${'black'}">
			${dateStr}
			</div>`;

        const y = param.point.y;
        let left = param.point.x + toolTipMargin;
        if (left > chartElement.clientWidth - toolTipWidth) {
          left = param.point.x - toolTipMargin - toolTipWidth;
        }

        let top = y + toolTipMargin;
        if (top > chartElement.clientHeight - toolTipHeight) {
          top = y - toolTipHeight - toolTipMargin;
        }
        toolTip.style.left = left + 'px';
        toolTip.style.top = top + 'px';
      }
    });

  }
  syncToInterval(intervals[0]);

  return null;
}

