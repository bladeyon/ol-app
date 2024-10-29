<template>
  <h3>盆地</h3>
  <div id="map-container" ref="chartRef">
    <span id="cur-coordinate" ref="curPosRef"></span>
    <span id="cur-zoom" ref="curZoomRef"></span>
  </div>
  <span>
    <input type="image" src="" alt="" />
  </span>
</template>

<script setup lang="ts">
// const points = {
//   type: 'FeatureCollection',
//   crs: {
//     type: 'name',
//     properties: {
//       name: 'EPSG:4326',
//     },
//   },
//   features: [
//     {
//       geometries: [
//         {
//           coordinates: [[[112.87491, 44.414946], []], []],
//           type: 'MultiLineString',
//         },
//       ],
//     },
//   ],
// };
// ?raw 已字符串的形式导入
import basinEL from "/@/assets/basin-el-b.json?raw";
import basinELa from "/@/assets/basin-el-a.json?raw";
import basinEEDS from "/@/assets/basin-eeds-b.json";
import basinEEDSa from "/@/assets/basin-eeds-a.json";
import basinSL from "/@/assets/basin-sl-b.json";
import basinSLa from "/@/assets/basin-sl-a.json";
import basinZGE from "/@/assets/basin-zge-b.json";
import basinZGEa from "/@/assets/basin-zge-a.json";

import {
  markRaw,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  toRaw,
  watch
} from "vue";
import {
  generatePolygon,
  onBindLayerClick,
  generateLine
} from "/@/utils/openLayer3";

import "ol/ol.css";
import OLMap from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer } from "ol/layer";
import { Vector, XYZ } from "ol/source";
import { fromLonLat, toLonLat } from "ol/proj";
// import VectorLayer from "ol/layer/Vector";
import { Vector as VectorLayer } from "ol/layer";
import { Stroke, Style } from "ol/style";
import VectorSource from "ol/source/Vector";
import { cloneDeep } from "lodash-es";
import { GeometryOptions } from "/#/types/openLayer";
// import { Vector } from "ol/source";
console.log("import load");

const chartRef = ref<HTMLDivElement>();
const curPosRef = ref<HTMLDivElement>();
const curZoomRef = ref<HTMLDivElement>();
const mapRef = ref();
const keys = [
  //天地图key有每日访问限制，不够的话可以再整几个
  "badb8533f40a85113b57ccba926fceff",
  "1ea952a9eb216d64108b667aa33f9b78",
  "5e2932cacdcd4a54d9247c33bae97f7f",
  "d3108ee2841c1d8b1409f5be463c0dbe",
  "94c7616ba5b7f64e1be5acea360c8c83"
];

let time = Date.now();
let key = keys[time % 5]; //key的每日使用次数有限，几个换着用
const ApiIndex = time % 8; //天地图 t0-t7都可用,但频繁使用其中一个,会报418访问变慢
const centerCoord = [108.90453, 34.428236];
const elB = reactive<GeometryOptions>(JSON.parse(basinEL));
const elA = reactive<GeometryOptions>(JSON.parse(basinELa));

const basinSource = new VectorSource();

function initMap() {
  mapRef.value = new OLMap({
    target: chartRef.value,
    layers: [
      new TileLayer({
        source: new XYZ({
          // url: `http://t${ApiIndex}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${key}`
          url: `http://t${ApiIndex}.tianditu.gov.cn/ibo_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ibo&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${key}`
          // tileUrlFunction: function (coordinate) {

          //   return `http://t${ApiIndex}.tianditu.gov.cn/ibo_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ibo&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${key}`;
          // }
        })
      }),
      new TileLayer({
        source: new XYZ({
          url: `http://t${ApiIndex}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${key}`
        })
      }),
      new VectorLayer({
        source: basinSource,
        visible: true
      })
    ],
    view: new View({
      projection: "EPSG:3857", // EPSG:3857，等同于900913，由Mercator投影而来，经常用于web地图
      center: fromLonLat(centerCoord), // 西安
      zoom: 4,
      minZoom: 4,
      maxZoom: 14
    })
  });

  window.curMap = toRaw(mapRef.value);

  curPosRef.value.textContent = centerCoord.toString();
  // // 缩放事件
  mapRef.value.on("moveend", function ({ map }) {
    curZoomRef.value.textContent = map.getView().getZoom();
  });

  // 获取点击点的 坐标
  mapRef.value.on("singleclick", (e) => {
    let coordinate = e.coordinate;
    let lon_lat = toLonLat(coordinate).map((c) => c.toFixed(4));
    curPosRef.value.innerText = lon_lat;
  });

  // mapRef.value.on("postrender", () => {
  //   drawBasinBoundary();
  // });
  drawBasinBoundary();
  drawBasinArea();
}

// 画盆地边界
function drawBasinBoundary() {
  // 创建矢量图层
  const layer = new VectorLayer({
    source: new Vector()
    // 设置样式，颜色为红色，线条粗细为1个像素
    // style: new Style({
    //   stroke: new Stroke({
    //     color: "red",
    //     width: 1
    //   })
    // })
  });
  // console.log("boundary", basinEL.coordinates[0][0]);
  // const elCoors = cloneDeep(basinEL.coordinates);
  const layerEL = generatePolygon(
    mapRef.value,
    basinSource,
    elB.coordinates,
    // basinEL.coordinates,
    // elCoors,
    {
      marker: {
        text: "二连盆地",
        color: "red",
        position: [113.094514, 43.334099]
      },
      fillColor: "#00ff001a",
      shadow: { color: "#008affc0" }
    }
  );

  // console.log("finish", basinEL.coordinates[0][0]);

  const layerEEDS = generatePolygon(
    mapRef.value,
    basinSource,
    basinEEDS.coordinates,
    {
      marker: {
        text: "鄂尔多斯盆地",
        color: "red",
        position: [108.815314, 37.705448]
      },
      fillColor: "#0000ff1a",
      shadow: { color: "#008affc0" }
    }
  );
  // const layerSL = generatePolygon(
  //   mapRef.value,
  //   basinSource,
  //   basinSL.coordinates,
  //   {
  //     marker: {
  //       text: "松辽盆地",
  //       color: "red",
  //       position: [124.852686, 45.16379]
  //     },
  //     fillColor: "#ff00001a",
  //     shadow: { color: "#008affc0" }
  //   }
  // );
  // const layerZGE = generatePolygon(
  //   mapRef.value,
  //   basinSource,
  //   basinZGE.coordinates,
  //   {
  //     marker: {
  //       text: "准噶尔盆地",
  //       color: "red",
  //       position: [87.172723, 45.541599]
  //     },
  //     fillColor: "#ffff001a",
  //     shadow: { color: "#008affc0" }
  //   }
  // );

  // onBindLayerClick(layer, { color: "#008affc0" });

  // mapRef.value.addLayer(layer);
}

function drawBasinArea() {
  console.log("area", elA.coordinates[0][0]);

  generateLine(basinSource, elA.coordinates, {});
  // generateLine(basinSource, basinEEDSa.coordinates, {});
  // generateLine(basinSource, basinSLa.coordinates, {});
  // generateLine(basinSource, basinZGEa.coordinates, {});
}

onMounted(() => {
  // fetch("src/assets/basin-el-b.json")
  //   .then((response) => response.json())
  //   .then(function (data) {
  //     console.log("fetch el", arguments);
  //     elB = data;
  //     initMap();
  //   });
  initMap();
});

onUnmounted(() => {
  console.log("unmounted");
  console.log("a", elA.coordinates[0][0]);
  // console.log("b", basinEL.coordinates[0][0]);
});
</script>

<style scoped>
#map-container {
  position: relative;
  width: 80vw;
  height: 80vh;
  margin: 50px auto;
  border: 1px solid #000;
  background-color: #000;
}

#cur-coordinate,
#cur-zoom {
  position: absolute;
  left: 0;
  bottom: 0;
  padding: 5px 10px;
  font-weight: bold;
  color: #fff;
}

#cur-zoom {
  bottom: 30px;
}
</style>
