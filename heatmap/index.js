// load required modules
const dscc = require('@google/dscc');
const local = require('./test_data.js');
const h337 = require('heatmap.js');
const d3 = require('d3-array');

// Copyright (c) 2015, Vladimir Agafonkin
// All rights reserved.
const simpleheat = require('simpleheat');

// change this to 'true' for local development
// change this to 'false' before deploying
export const LOCAL = false;

const drawViz = (data) => {

  //// PREP CONTAINER ////

  // get width/height
  let width = dscc.getWidth();
  let height = dscc.getHeight();

  // remove container if exists
  if (document.querySelector("#container")) {
    let oldDiv = document.querySelector("#container");
    oldDiv.parentNode.removeChild(oldDiv);
  }

  // create container div
  let containerDiv = document.createElement("div");
  containerDiv.id = "container";
  document.body.appendChild(containerDiv);
  containerDiv.setAttribute("style", "width: " + width + "px; height: " + height + "px; margin: 0 auto;");

  // create canvas
  let canvas = document.createElement("canvas");
  canvas.id = "canvasId";
  canvas.width = width;
  canvas.height = height;
  containerDiv.appendChild(canvas);

  //// CREATE HEATMAP ////

  // get data
  let heatmapData = data.tables.DEFAULT;

  // multiply data by dims
  for(var i = 0; i < heatmapData.length; i++){
    var obj = heatmapData[i];
    if(obj["x"] == "NaN" || obj["y"] == "NaN"){
      heatmapData.splice(i,1)
      i = i - 1;
      continue
    }
    for(var prop in obj){
        if(obj.hasOwnProperty(prop) && obj[prop] !== null && !isNaN(obj[prop])){
          if(prop == "value"){
            obj[prop] = +obj[prop];     
          }if(prop == "x"){
            obj[prop] = Math.round(+obj[prop]*width);   
          }if(prop == "y"){
            obj[prop] = Math.round(+obj[prop]*height);   
          }
        }
      }
  }

  // set vals manually because I did not have the right template in getdata
  let radiusVal = 15;
  let blurVal = 15;
  let minOpacityVal = 0.01;
  let lowColorVal = "#0000ff";
  let midColorVal = "#00ff00";
  let highColorVal = "#ffff00";
  let maxColorVal =  "#ff0000";

  // set all style vals
  if (!LOCAL){
    radiusVal = parseFloat(data.style.radius.value);
    minOpacityVal = parseFloat(data.style.minOpacity.value);
    blurVal = parseFloat(data.style.blur.value);
    lowColorVal = data.style.lowColor.value.color;
    midColorVal = data.style.midColor.value.color;
    highColorVal = data.style.highColor.value.color;
    maxColorVal = data.style.maxColor.value.color;
  }

  // set gradient
  let gradientVal = {
    0.25: lowColorVal,
    0.55: midColorVal,
    0.85: highColorVal,
    1.0: maxColorVal
  };

  // set max data val;
  let maxVal = d3.max(heatmapData, function(d) { return +d.value;} )
  
  // push data to array that simpleheat accepts
  let cleanArr = [];
  for(var i in heatmapData){
    cleanArr.push([heatmapData[i]["x"],heatmapData[i]["y"],heatmapData[i]["value"]])
  }

  // create simpleheat object on canvas
  let heat = simpleheat(canvas);
  heat.data(cleanArr);
  heat.max(maxVal);
  heat.radius(radiusVal,blurVal);
  heat.gradient(gradientVal);
  heat.draw(minOpacityVal);
 
};

// renders locally
if (LOCAL) {
  drawViz(local.message);
} else {
  dscc.subscribeToData(drawViz, {transform: dscc.objectTransform});
}