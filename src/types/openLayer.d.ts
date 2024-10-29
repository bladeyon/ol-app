export interface GeoOptions {
  type: string;
  crs: CrsOptions;
  features: FeaturesOptions[];
}
export interface CrsOptions {
  type: string;
  properties: {
    name: string;
  };
}

export interface FeaturesOptions {
  geometries: GeometryOptions[];
}

export interface GeometryOptions {
  coordinates: Array<Coordinate[]>;
  type: string;
}

export interface ShadowOptions {
  offsetX?: number;
  offsetY?: number;
  blur?: number;
  color: string;
}

export interface MarkerOptions {
  position?: Coordinate;
  text: string;
  font?: string;
  color?: string;
  border?: { color?: string; width?: number };
  backgroundColor?: string;
  rotationDeg?: number;
  padding?: Array<number>;
  [prop: string]: any;
}

export interface DrawOptions {
  marker?: MarkerOptions;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  shadow: ShadowOptions;
}
