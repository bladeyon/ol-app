<template>
  <h3>盆地</h3>
  <div id="map-container" ref="chartRef">
    <span id="cur-coordinate" ref="curPosRef"></span>
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

import basinEL from "/@/assets/basin-el-b.json";
import basinEEDS from "/@/assets/basin-eeds-b.json";
import basinSL from "/@/assets/basin-sl-b.json";
import basinZGE from "/@/assets/basin-zge-b.json";

import { onMounted, onUnmounted, ref } from "vue";
import { generatePolygon, onBindLayerClick } from "/@/utils/openLayer2";

import "ol/ol.css";
import OLMap from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer } from "ol/layer";
import { Vector, XYZ } from "ol/source";
import { fromLonLat, toLonLat } from "ol/proj";
// import VectorLayer from "ol/layer/Vector";
import { Vector as VectorLayer } from "ol/layer";
import { Stroke, Style } from "ol/style";
// import { Vector } from "ol/source";

const chartRef = ref<HTMLDivElement>();
const curPosRef = ref<HTMLDivElement>();
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

async function initMap() {
  mapRef.value = new OLMap({
    target: chartRef.value,
    layers: [
      new TileLayer({
        source: new XYZ({
          url: `http://t${ApiIndex}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${key}`
        })
      }),
      new TileLayer({
        source: new XYZ({
          url: `http://t${ApiIndex}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${key}`
        })
      })
    ],
    view: new View({
      projection: "EPSG:3857", // EPSG:3857，等同于900913，由Mercator投影而来，经常用于web地图
      center: fromLonLat([108.90453, 34.428236]), // 西安
      zoom: 4,
      minZoom: 4,
      maxZoom: 14
    })
  });

  // // 缩放事件
  // mapRef.value.on("moveend", function ({ map }) {
  //   console.log("change zoom", map.getView().getZoom());
  // });

  // 获取点击点的 坐标
  mapRef.value.on("singleclick", (e) => {
    let coordinate = e.coordinate;
    let lon_lat = toLonLat(coordinate).map((c) => c.toFixed(4));
    curPosRef.value.innerText = lon_lat;
  });

  drawBasinBoundary();
}

// 画盆地边界
async function drawBasinBoundary() {
  // 创建矢量图层
  const layer = new VectorLayer({
    source: new Vector(),
    // 设置样式，颜色为红色，线条粗细为1个像素
    style: new Style({
      stroke: new Stroke({
        color: "red",
        width: 1
      })
    })
  });
  const layerEL = await generatePolygon(mapRef.value, layer, basinEL, {
    marker: {
      text: "二连盆地",
      color: "red",
      position: [113.094514, 43.334099]
    },
    fillColor: "#00ff001a",
    shadow: { color: "#008affc0" }
  });
  const layerEEDS = await generatePolygon(mapRef.value, layer, basinEEDS, {
    marker: {
      text: "鄂尔多斯盆地",
      color: "red",
      position: [108.815314, 37.705448]
    },
    fillColor: "#0000ff1a",
    shadow: { color: "#008affc0" }
  });
  const layerSL = await generatePolygon(mapRef.value, layer, basinSL, {
    marker: {
      text: "松辽盆地",
      color: "red",
      position: [124.852686, 45.16379]
    },
    fillColor: "#ff00001a",
    shadow: { color: "#008affc0" }
  });
  const layerZGE = await generatePolygon(mapRef.value, layer, basinZGE, {
    marker: {
      text: "准噶尔盆地",
      color: "red",
      position: [87.172723, 45.541599]
    },
    fillColor: "#ffff001a",
    shadow: { color: "#008affc0" }
  });

  onBindLayerClick(layer, { color: "#008affc0" });

  mapRef.value.addLayer(layer);
}

onMounted(async () => {
  await initMap();
});
</script>

<style scoped>
#map-container {
  position: relative;
  width: 80vw;
  height: 80vh;
  margin: 0px auto;
  border: 1px solid #000;
}
#cur-coordinate {
  position: absolute;
  left: 0;
  bottom: 5px;
  padding: 0 10px;
  font-weight: bold;
  color: #000;
  z-index: 100;
}
</style>
