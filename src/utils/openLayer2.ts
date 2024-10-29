import { merge } from "lodash";
import OLMap from "ol/Map";
import { Vector as VectorLayer } from "ol/layer";
import { Vector } from "ol/source";
import { fromLonLat, toLonLat } from "ol/proj";
import Feature from "ol/Feature";
import { Geometry, Point, Polygon } from "ol/geom";
import { Style, Stroke, Fill, Text } from "ol/style";
// types
import {
  GeometryOptions,
  ShadowOptions,
  MarkerOptions,
  DrawOptions
} from "/#/openLayer";
import { getCenter } from "ol/extent";
import VectorSource from "ol/source/Vector";

export function generatePolygonFeature(
  data: GeometryOptions,
  options: DrawOptions
) {
  // 数据转换
  data.coordinates.forEach((coors, index, arr) => {
    arr[index] = coors.map((p) => fromLonLat(p));
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

export function generateMarkerFeature(map: OLMap, marker: MarkerOptions) {
  // if (!marker.position) {
  //   // 不存在时，在坐标中心标注
  //   marker.position = toLonLat(getCenter(layer.getSource().getExtent()));
  // }

  const markerFeature = new Feature({
    geometry: new Point(fromLonLat(marker.position))
  });

  // 设置样式
  markerFeature.setStyle(() => {
    const zoom = map.getView().getZoom() || 0;

    return new Style({
      text: new Text({
        text: marker.text,
        font: marker.font,
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
        scale: zoom > 6 ? 0 : zoom / 4
      })
    });
  });

  return markerFeature;
}

export function onBindLayerClick(
  layer: VectorLayer<Vector>,
  shadow: ShadowOptions
) {
  const shadowDef: ShadowOptions = {
    offsetX: 0,
    offsetY: 0,
    blur: 10,
    color: "rgba(0,0,0,0.0)"
  };

  merge(shadowDef, shadow);

  // 添加阴影
  layer.on("precompose", (evt) => {
    evt.context.shadowOffsetX = shadowDef.offsetX;
    evt.context.shadowOffsetY = shadowDef.offsetY;
    evt.context.shadowBlur = shadowDef.blur;
    evt.context.shadowColor = shadowDef.color;
  });

  layer.on("postcompose", (evt) => {
    evt.context.shadowOffsetX = 0;
    evt.context.shadowOffsetY = 0;
    evt.context.shadowBlur = 0;
    evt.context.shadowColor = "rgba(0,0,0,0.0)";
  });
  // layer.on("prerender", (evt) => {
  //   evt.context.shadowBlur = 25;
  //   evt.context.shadowColor = "black";
  // });
  // layer.on("postrender", (evt) => {
  //   evt.context.shadowBlur = 0;
  //   evt.context.shadowColor = "black";
  // });
}

export async function generatePolygon(
  map: OLMap,
  layer: VectorLayer<Vector>,
  data: GeometryOptions,
  options: DrawOptions
) {
  const optionsDef: DrawOptions = {
    marker: {
      text: "区域标注",
      color: "black",
      font: "10px sans-serif",
      border: { color: "transparent", width: 1 },
      backgroundColor: "transparent",
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

  const shadow = optionsDef.shadow;

  // 创建矢量数据源
  const source = new VectorSource({
    features: [new Feature()]
  });

  // 创建多边形 feature
  const polygonFeature = generatePolygonFeature(data, optionsDef);

  source.addFeature(polygonFeature);

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
    const markerFeature = generateMarkerFeature(map, marker);
    source.addFeature(markerFeature);
    layer.getSource()?.addFeature(markerFeature);
  }
  layer.getSource()?.addFeature(polygonFeature);
  // return source;
}
