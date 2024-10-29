<template>
  <h3>盆地</h3>
  <div id="map-container" ref="chartRef"></div>
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

import { onMounted, ref } from "vue";
import { createPolygon } from "/@/utils/openLayer1";

import "ol/ol.css";
import OLMap from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer } from "ol/layer";
import { Vector, XYZ } from "ol/source";
import { fromLonLat } from "ol/proj";

const chartRef = ref<HTMLDivElement>();
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

function initMap() {
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
      center: fromLonLat([108.90453, 34.428236]), // 西安
      zoom: 4,
      minZoom: 4,
      maxZoom: 14
    })
  });

  // 缩放事件
  // mapRef.value.on("moveend", function ({ map }) {
  //   console.log("change zoom", map.getView().getZoom());
  // });

  drawBasinBoundary();
}

// 画盆地边界
async function drawBasinBoundary() {
  const layerEL = await createPolygon(mapRef.value, basinEL, {
    marker: {
      text: "二连盆地",
      color: "red",
      position: [113.094514, 43.334099]
    },
    fillColor: "#00ff001a",
    shadow: { color: "#008affc0" }
  });
  const layerEEDS = await createPolygon(mapRef.value, basinEEDS, {
    marker: { text: "鄂尔多斯盆地", color: "red" },
    fillColor: "#0000ff1a",
    shadow: { color: "#008affc0" }
  });
  const layerSL = await createPolygon(mapRef.value, basinSL, {
    marker: {
      text: "松辽盆地",
      color: "red",
      position: [124.852686, 45.16379]
    },
    fillColor: "#ff00001a",
    shadow: { color: "#008affc0" }
  });
  const layerZGE = await createPolygon(mapRef.value, basinZGE, {
    marker: {
      text: "准噶尔盆地",
      color: "red",
      position: [87.172723, 45.541599]
    },
    fillColor: "#ffff001a",
    shadow: { color: "#008affc0" }
  });
}

onMounted(async () => {
  await initMap();
});
</script>

<style scoped>
#map-container {
  width: 80vw;
  height: 80vh;
  margin: 0px auto;
  border: 1px solid #000;
}
</style>
