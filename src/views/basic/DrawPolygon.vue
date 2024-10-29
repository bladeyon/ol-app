<template>
  <div id="map"></div>
</template>

<script setup lang="ts">
import "ol/ol.css";
import boundary from "/@/assets/boundary.json";
import { onMounted, reactive, ref, watch } from "vue";
import { merge } from "lodash";
import OLMap from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { Vector, XYZ } from "ol/source";
import { fromLonLat, toLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import { Draw } from "ol/interaction";
import Feature from "ol/Feature";
import { Circle, Point, Polygon } from "ol/geom";
// import { getExtent } from "ol/geom/Polygon";
import { Style, Stroke, Fill, Circle as CircleStyle, Text } from "ol/style";
import { Coordinate } from "ol/coordinate";
import { getCenter } from "ol/extent";
import Overlay from "ol/Overlay";

// import;

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
      // projection: "EPSG:900913", // EPSG:900913(墨卡托投影)，EPSG:4326(大地平面投影)
      // center: [19649328.04, 4921642.15],
      // center: [104.522609, 34.057987],
      // center: fromLonLat([108.947614,34.355598]),
      center: fromLonLat([113.390562, 43.172556]), // 二连
      //[19649328.04, 4921642.15],
      // fromLonLat([104.522609, 34.057987]),
      zoom: 6,
      minZoom: 4,
      maxZoom: 14
    })
  });

  mapRef.value.on("moveend", function ({ map }) {
    console.log("change zoom", map.getView().getZoom());
  });
}

interface CrsOptions {
  type: string;
  properties: {
    name: string;
  };
}

interface FeaturesOptions {
  geometries: GeometryOptions[];
}

interface GeoOptions {
  type: string;
  crs: CrsOptions;
  features: FeaturesOptions[];
}

interface GeometryOptions {
  coordinates: Array<Coordinate[]>;
  type: string;
}

interface ShadowOptions {
  offsetX?: number;
  offsetY?: number;
  blur?: number;
  color: string;
}

interface MarkerOptions {
  text: string;
  font?: string;
  color?: string;
  border?: { color?: string; width?: number };
  backgroundColor?: string;
  rotationDeg?: number;
  padding?: Array<number>;
  [prop: string]: any;
}

interface DrawOptions {
  marker?: MarkerOptions;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  shadow: ShadowOptions;
}

function createPolygonFeature(data: GeometryOptions, options: DrawOptions) {
  // 数据转换
  data.coordinates.forEach((coors, index, arr) => {
    arr[index] = coors.map((p) => fromLonLat(p));
    // arr[index] = coors.map((p) => toLonLat(p, "EPSG:4326"));
  });

  // 创建要素
  const features = new Feature({
    geometry: new Polygon(data.coordinates)
  });

  // 创建样式
  const style = new Style({
    stroke: new Stroke({
      color: options.strokeColor,
      width: options.strokeWidth
    }),
    fill: new Fill({
      color: options.fillColor
    })
  });

  features.setStyle(style);

  return features;
}

function createMarker(
  map: OLMap,
  layer: VectorLayer<Vector>,
  marker: MarkerOptions
) {
  const markerFeature = new Feature({
    geometry: new Point(fromLonLat([113.390562, 43.172556]))
  });

  // 设置样式
  markerFeature.setStyle(() => {
    const zoom = map.getView().getZoom() || 0;

    return new Style({
      text: new Text({
        text: marker.text,
        // padding: [2, 8, 2, 8], // 控制消失后，如果设置padding 则标注的背景不能消失
        rotation: marker.rotationDeg,
        fill: new Fill({ color: marker.color }),
        backgroundFill: new Fill({ color: marker.backgroundColor }),
        backgroundStroke: new Stroke({
          color: marker.border?.color,
          width: marker.border?.width
        }),
        // textAlign: "center", // 默认值是 center
        justify: "center",
        textBaseline: "middle",
        scale: zoom > 8 ? 0 : zoom / 5
      })
    });
  });

  layer.getSource()?.addFeature(markerFeature);
}

function onBindLayerClick(layer: VectorLayer<Vector>, shadow: ShadowOptions) {
  // 添加阴影
  // layer.on("precompose", (evt) => {
  //   evt.context.shadowOffsetX = shadow.offsetX;
  //   evt.context.shadowOffsetY = shadow.offsetY;
  //   evt.context.shadowBlur = shadow.blur;
  //   evt.context.shadowColor = shadow.color;
  // });

  // layer.on("postcompose", (evt) => {
  //   evt.context.shadowOffsetX = 0;
  //   evt.context.shadowOffsetY = 0;
  //   evt.context.shadowBlur = 0;
  //   evt.context.shadowColor = "rgba(0,0,0,0.0)";
  // });
  layer.on("prerender", (evt) => {
    evt.context.shadowBlur = 25;
    evt.context.shadowColor = "black";
  });
  layer.on("postrender", (evt) => {
    evt.context.shadowBlur = 0;
    evt.context.shadowColor = "black";
  });
}

async function createPolygon(
  map: OLMap,
  data: GeometryOptions,
  options: DrawOptions
) {
  const optionsDef: DrawOptions = {
    marker: {
      text: "区域标注",
      color: "black",
      font: "10px sans-serif",
      border: { color: "lightblue", width: 1 },
      backgroundColor: "#ddd",
      rotationDeg: 0
    },
    strokeColor: "rgba(0,0,255,.2)",
    strokeWidth: 1,
    fillColor: "rgba(255,255,255,.2)",
    shadow: {
      offsetX: 0,
      offsetY: 0,
      blur: 0,
      color: "rgba(0,0,0,0)"
    }
  };
  merge(optionsDef, options);
  console.log(optionsDef, options);

  const shadow = optionsDef.shadow;

  // 创建矢量图层
  const layer = new VectorLayer({
    source: new Vector()
  });

  // 创建多边形 feature
  const polygonFeature = createPolygonFeature(data, optionsDef);

  // 创建矢量数据源
  // const source = new VectorSource({
  //   features: [polygonFeature]
  // });

  layer.getSource()?.addFeature(polygonFeature);

  // 标注
  const marker = optionsDef.marker;
  if (marker?.text) {
    /************方案一************/
    // // 中心
    // const center = getCenter(source.getExtent());
    // const nameEl = document.createElement("div");
    // nameEl.innerText = optionsDef.name;
    // nameEl.classList.add(optionsDef.nameClsName);
    // let nameOverlay = new Overlay({
    //   position: fromLonLat([113.390562, 43.172556]), // center
    //   element: nameEl,
    //   offset: [0, 0],
    //   positioning: "bottom-center"
    // });
    // map.addOverlay(nameOverlay);
    /************方案二************/
    createMarker(map, layer, marker);
  }

  // 添加到地图实例
  map.addLayer(layer);
  onBindLayerClick(layer, shadow);
  return layer;
}

onMounted(async () => {
  await initMap();

  const areaLayer = await createPolygon(mapRef.value, boundary, {
    marker: { text: "二连盆地", color: "red" },
    fillColor: "#008aff2f",
    shadow: { color: "#008affc0" }
  });
});
</script>

<style scoped>
#map {
  width: 800px;
  height: 500px;
  margin: 50px auto;
  border: 1px solid #000;
}

#map .marker-el {
  transform: rotate(-35deg);
  background-color: antiquewhite;
}
</style>
