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
        // type: "gradient",
        color: '#131722',
      },
      textColor: '#d1d4dc',
    },
    grid: {
      vertLines: {
        color: 'rgba(42, 46, 57, 0)',
      },
      horzLines: {
        color: 'rgba(42, 46, 57, 0.6)',
      },
    },
    timeScale: {
      borderVisible: false,
    },
    crosshair: {
      horzLine: {
        visible: false,
      },
    },
  });

  // var areaSeries = chart.addAreaSeries({
  //   topColor: 'rgba(38,198,218, 0.56)',
  //   bottomColor: 'rgba(38,198,218, 0.04)',
  //   lineColor: 'rgba(38,198,218, 1)',
  //   lineWidth: 2,
  // });

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
      topColor: 'rgba(76, 175, 80, 0.56)',
      bottomColor: 'rgba(76, 175, 80, 0.04)',
      lineColor: 'rgba(76, 175, 80, 1)',
      lineWidth: 2,
    });
    areaSeries.setData(seriesesData.get(interval));
  }

  syncToInterval(intervals[0]);

  return null;
}

