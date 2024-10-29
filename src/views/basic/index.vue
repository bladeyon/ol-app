<template>
  <div class="map-body">
    <div id="map"></div>
    <span id="cur-coordinate" ref="curPosRef"></span>
    <span id="cur-zoom" ref="curZoomRef"></span>
  </div>
</template>

<script setup lang="ts">
import "ol/ol.css";
import { onMounted, ref } from "vue";
import OLMap from "ol/Map";
import View from "ol/View";
import OSM from "ol/source/OSM";
import TileLayer from "ol/layer/Tile";
import { Tile, TileDebug, XYZ } from "ol/source";
import { fromLonLat, toLonLat } from "ol/proj";

const mapRef = ref();
const curPosRef = ref<HTMLDivElement>();
const curZoomRef = ref<HTMLDivElement>();
const centerCoord = [108.90453, 34.428236];

function initMap() {
  // console.log(
  //   toLonLat([8144836.8313607, 2000603.45983311]),
  //   toLonLat([15136259.7198837, 7135382.92567777])
  // );

  mapRef.value = new OLMap({
    target: "map",
    layers: [
      // 适量底图
      new TileLayer({
        source: new XYZ({
          tileLoadFunction: function (img, src) {
            img.getImage().src = src;
          },
          tileUrlFunction: function (coordinate) {
            let [z, x, y] = coordinate;
            return `/ibo/${z}/${x}/${y}.png`;
          }
        })
      }),
      // 底图矢量标注
      new TileLayer({
        source: new XYZ({
          tileLoadFunction: function (img, src) {
            img.getImage().src = src;
          },
          tileUrlFunction: function (coordinate) {
            let [z, x, y] = coordinate;
            return `/cva/${z}/${x}/${y}.png`;
          }
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
      projection: "",
      center: fromLonLat(centerCoord),
      zoom: 4
    })
  });
  curPosRef.value.textContent = centerCoord.toString();
  // // 缩放事件
  mapRef.value.on("moveend", function ({ map }) {
    curZoomRef.value.textContent = map.getView().getZoom();
  });

  // 获取点击点的 坐标
  mapRef.value.on("singleclick", (e) => {
    let coordinate = e.coordinate;
    let lon_lat = toLonLat(coordinate).map((c) => c.toFixed(4));
    curPosRef.value.textContent = lon_lat.toString();
  });
}

onMounted(() => {
  initMap();
});
</script>

<style scoped>
.map-body {
  position: relative;
}
#map {
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
