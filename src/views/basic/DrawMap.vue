<template>
  <select v-model="drawTypeRef">
    <option v-for="item in typeOptions" :value="item.value">
      {{ item.label }}
    </option>
  </select>
  <button @click="undo">撤销</button>
  <div id="map"></div>
</template>

<script setup lang="ts">
import "ol/ol.css";
import { onMounted, reactive, ref, watch } from "vue";
import OLMap from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { XYZ } from "ol/source";
import { fromLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import { Draw } from "ol/interaction";

const mapRef = ref();
let time = Date.now();
let key = "94c7616ba5b7f64e1be5acea360c8c83"; // keys[time % 4]; //key的每日使用次数有限，几个换着用
let index = time % 8; //天地图 t0-t7都可用,但频繁使用其中一个,会报418访问变慢

async function initMap() {
  mapRef.value = new OLMap({
    target: "map",
    layers: [
      new TileLayer({
        source: new XYZ({
          url: `http://t${index}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${key}`
        })
      }),
      new TileLayer({
        source: new XYZ({
          url: `http://t${index}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${key}`
        })
      })
    ],
    view: new View({
      projection: "EPSG:900913", // EPSG:900913(墨卡托投影)，EPSG:4326(大地平面投影)
      // center: [19649328.04, 4921642.15],
      // center: [104.522609, 34.057987],
      center: fromLonLat([104.522609, 34.057987]),
      zoom: 4
    })
  });
}

type DrawType =
  | "Point"
  | "LineString"
  | "LinearRing"
  | "Polygon"
  | "MultiPoint"
  | "MultiLineString"
  | "MultiPolygon"
  | "GeometryCollection"
  | "Circle";
const drawTypeRef = ref<DrawType>("Point");
const typeOptions = reactive<{ label: string; value: string }[]>([
  { label: "点", value: "Point" },
  { label: "线", value: "LineString" },
  { label: "多边形", value: "Polygon" },
  { label: "圆", value: "Circle" }
]);
const source = new VectorSource();
const vector = new VectorLayer({
  source: source
});

let draw: Draw;
function drawMap() {
  draw = new Draw({
    source,
    type: drawTypeRef.value
  });
  mapRef.value.addInteraction(draw);
}

function undo() {
  draw.removeLastPoint();
}

watch(
  () => drawTypeRef.value,
  (type) => {
    mapRef.value.removeInteraction(draw);
    drawMap();
  }
);

onMounted(async () => {
  await initMap();
  mapRef.value.addLayer(vector);
  drawMap();
});
</script>

<style scoped>
#map {
  width: 800px;
  height: 500px;
  margin: 50px auto;
  border: 1px solid #000;
}
</style>
