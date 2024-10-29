<template>
  <div id="map"></div>
</template>

<script setup lang="ts">
import "ol/ol.css";
import { onMounted, reactive, ref, watch } from "vue";
import OLMap from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, XYZ } from "ol/source";
import { fromLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import { Draw } from "ol/interaction";
import Feature from "ol/Feature";
import { Point } from "ol/geom";
import { Style, Stroke, Fill, Circle as CircleStyle } from "ol/style";

// import;

const mapRef = ref();
let time = Date.now();
let key = "94c7616ba5b7f64e1be5acea360c8c83"; // keys[time % 4]; //key的每日使用次数有限，几个换着用
let index = time % 5; //天地图 t0-t7都可用,但频繁使用其中一个,会报418访问变慢
const url = {
  img: {
    t: `http://t${index}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${key}`,
    g: `http://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}`
  },
  comment: {
    t: `http://t${index}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${key}`,
    g: `https://wprd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=8&x={x}&y={y}&z={z}&scl=1&ltype=4`
  }
};
const m_url = url.img.t;
const c_url = url.comment.t;

async function initMap() {
  mapRef.value = new OLMap({
    target: "map",
    layers: [
      new TileLayer({
        source: new XYZ({
          url: m_url
        })
      }),
      new TileLayer({
        source: new XYZ({
          url: c_url
        })
      })
    ],
    view: new View({
      // 将西安作为地图中心
      center: fromLonLat([108.945951, 34.465262]),
      zoom: 4,
      minZoom: 4,
      maxZoom: 14
    })
  });
}

function drawPoint() {
  // 创建要素
  const features = new Feature({
    geometry: new Point(fromLonLat([104.522609, 34.057987]))
  });

  // 创建样式
  const style = new Style({
    image: new CircleStyle({
      radius: 10,
      stroke: new Stroke({
        color: "#00f"
      }),
      fill: new Fill({
        color: "#f00"
      })
    })
  });

  features.setStyle(style); // 设置单个feature的style
  // 创建矢量数据源
  const source = new VectorSource({
    features: [features]
  });

  // 创建矢量图层
  const pointLayer = new VectorLayer({
    source,
    // style, // 设置所有feature的style
    zIndex: 100
  });
  // 添加到地图实例
  mapRef.value.addLayer(pointLayer);
}

onMounted(async () => {
  await initMap();
  drawPoint();
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
