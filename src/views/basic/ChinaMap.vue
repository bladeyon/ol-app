<template>
  <div id="map"></div>
</template>

<script setup lang="ts">
import "ol/ol.css";
import { onMounted, ref } from "vue";
import OLMap from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import { OSM, TileDebug, XYZ } from "ol/source";
import { fromLonLat } from "ol/proj";

const mapRef = ref();
let time = Date.now();
let key = "94c7616ba5b7f64e1be5acea360c8c83"; // keys[time % 4]; //key的每日使用次数有限，几个换着用
let index = time % 8; //天地图 t0-t7都可用,但频繁使用其中一个,会报418访问变慢

function initMap() {
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
      }),
      //加载瓦片网格图层
      new TileLayer({
        //瓦片网格数据源
        source: new TileDebug({
          //投影
          projection: "EPSG:3857",
          //获取瓦片网格信息
          tileGrid: new OSM().getTileGrid()
        })
      })
    ],
    view: new View({
      // projection: "",
      center: fromLonLat([104.522609, 34.057987]),
      zoom: 4
    })
  });
}

onMounted(() => {
  initMap();
});
</script>

<style scoped>
#map {
  width: 80vw;
  height: 80vh;
  margin: 50px auto;
  border: 1px solid #000;
}
</style>
