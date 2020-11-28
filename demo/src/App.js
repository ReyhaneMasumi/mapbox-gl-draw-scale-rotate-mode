import React, { useRef, useEffect } from 'react';
import mapboxGl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { SRMode, SRCenter } from 'mapbox-gl-draw-scale-rotate-mode';
import './App.css';
import rotate from './rotate.png';
import scale from './scale.png';

let map;
let draw;
let drawBar;

class extendDrawBar {
  constructor(opt) {
    let ctrl = this;
    ctrl.draw = opt.draw;
    ctrl.buttons = opt.buttons || [];
    ctrl.onAddOrig = opt.draw.onAdd;
    ctrl.onRemoveOrig = opt.draw.onRemove;
  }
  onAdd(map) {
    let ctrl = this;
    ctrl.map = map;
    ctrl.elContainer = ctrl.onAddOrig(map);
    ctrl.buttons.forEach((b) => {
      ctrl.addButton(b);
    });
    return ctrl.elContainer;
  }
  onRemove(map) {
    let ctrl = this;
    ctrl.buttons.forEach((b) => {
      ctrl.removeButton(b);
    });
    ctrl.onRemoveOrig(map);
  }
  addButton(opt) {
    let ctrl = this;
    var elButton = document.createElement('button');
    elButton.className = 'mapbox-gl-draw_ctrl-draw-btn';
    if (opt.classes instanceof Array) {
      opt.classes.forEach((c) => {
        elButton.classList.add(c);
      });
    }
    elButton.addEventListener(opt.on, opt.action);
    ctrl.elContainer.appendChild(elButton);
    opt.elButton = elButton;
  }
  removeButton(opt) {
    opt.elButton.removeEventListener(opt.on, opt.action);
    opt.elButton.remove();
  }
}

var drawStyle = [
  {
    id: 'gl-draw-polygon-fill-inactive',
    type: 'fill',
    filter: [
      'all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Polygon'],
      ['!=', 'user_type', 'overlay'],
      ['!=', 'mode', 'static'],
    ],
    paint: {
      'fill-color': '#3bb2d0',
      'fill-outline-color': '#3bb2d0',
      'fill-opacity': 0.2,
    },
  },
  {
    id: 'gl-draw-polygon-fill-active',
    type: 'fill',
    filter: [
      'all',
      ['==', 'active', 'true'],
      ['==', '$type', 'Polygon'],
      ['!=', 'user_type', 'overlay'],
    ],
    paint: {
      'fill-color': '#fbb03b',
      'fill-outline-color': '#fbb03b',
      'fill-opacity': 0.2,
    },
  },

  {
    id: 'gl-draw-overlay-polygon-fill-inactive',
    type: 'fill',
    filter: [
      'all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Polygon'],
      ['==', 'user_type', 'overlay'],
      ['!=', 'mode', 'static'],
    ],
    paint: {
      'fill-color': '#3bb2d0',
      'fill-outline-color': '#3bb2d0',
      'fill-opacity': 0.01,
    },
  },
  {
    id: 'gl-draw-overlay-polygon-fill-active',
    type: 'fill',
    filter: [
      'all',
      ['==', 'active', 'true'],
      ['==', '$type', 'Polygon'],
      ['==', 'user_type', 'overlay'],
    ],
    paint: {
      'fill-color': '#fbb03b',
      'fill-outline-color': '#fbb03b',
      'fill-opacity': 0.01,
    },
  },

  {
    id: 'gl-draw-polygon-stroke-inactive',
    type: 'line',
    filter: [
      'all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Polygon'],
      ['!=', 'user_type', 'overlay'],
      ['!=', 'mode', 'static'],
    ],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#3bb2d0',
      'line-width': 2,
    },
  },

  {
    id: 'gl-draw-polygon-stroke-active',
    type: 'line',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#fbb03b',
      'line-dasharray': [0.2, 2],
      'line-width': 2,
    },
  },

  {
    id: 'gl-draw-polygon-midpoint',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
    paint: {
      'circle-radius': 3,
      'circle-color': '#fbb03b',
    },
  },

  {
    id: 'gl-draw-line-inactive',
    type: 'line',
    filter: [
      'all',
      ['==', 'active', 'false'],
      ['==', '$type', 'LineString'],
      ['!=', 'mode', 'static'],
    ],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#3bb2d0',
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-line-active',
    type: 'line',
    filter: ['all', ['==', '$type', 'LineString'], ['==', 'active', 'true']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#fbb03b',
      'line-dasharray': [0.2, 2],
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-stroke-inactive',
    type: 'circle',
    filter: [
      'all',
      ['==', 'meta', 'vertex'],
      ['==', '$type', 'Point'],
      ['!=', 'mode', 'static'],
    ],
    paint: {
      'circle-radius': 4,
      'circle-color': '#fff',
    },
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-inactive',
    type: 'circle',
    filter: [
      'all',
      ['==', 'meta', 'vertex'],
      ['==', '$type', 'Point'],
      ['!=', 'mode', 'static'],
    ],
    paint: {
      'circle-radius': 2,
      'circle-color': '#fbb03b',
    },
  },

  {
    id: 'gl-draw-polygon-and-line-vertex-scale-icon',
    type: 'symbol',
    filter: [
      'all',
      ['==', 'meta', 'vertex'],
      ['==', '$type', 'Point'],
      ['!=', 'mode', 'static'],
      ['has', 'heading'],
    ],
    layout: {
      'icon-image': 'scale',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-rotation-alignment': 'map',
      'icon-rotate': ['get', 'heading'],
    },
    paint: {
      'icon-opacity': 1.0,
      'icon-opacity-transition': {
        delay: 0,
        duration: 0,
      },
    },
  },

  {
    id: 'gl-draw-point-point-stroke-inactive',
    type: 'circle',
    filter: [
      'all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Point'],
      ['==', 'meta', 'feature'],
      ['!=', 'mode', 'static'],
    ],
    paint: {
      'circle-radius': 5,
      'circle-opacity': 1,
      'circle-color': '#fff',
    },
  },
  {
    id: 'gl-draw-point-inactive',
    type: 'circle',
    filter: [
      'all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Point'],
      ['==', 'meta', 'feature'],
      ['!=', 'mode', 'static'],
    ],
    paint: {
      'circle-radius': 3,
      'circle-color': '#3bb2d0',
    },
  },
  {
    id: 'gl-draw-point-stroke-active',
    type: 'circle',
    filter: [
      'all',
      ['==', '$type', 'Point'],
      ['==', 'active', 'true'],
      ['!=', 'meta', 'midpoint'],
    ],
    paint: {
      'circle-radius': 4,
      'circle-color': '#fff',
    },
  },
  {
    id: 'gl-draw-point-active',
    type: 'circle',
    filter: [
      'all',
      ['==', '$type', 'Point'],
      ['!=', 'meta', 'midpoint'],
      ['==', 'active', 'true'],
    ],
    paint: {
      'circle-radius': 2,
      'circle-color': '#fbb03b',
    },
  },
  {
    id: 'gl-draw-polygon-fill-static',
    type: 'fill',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': '#404040',
      'fill-outline-color': '#404040',
      'fill-opacity': 0.1,
    },
  },
  {
    id: 'gl-draw-polygon-stroke-static',
    type: 'line',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#404040',
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-line-static',
    type: 'line',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'LineString']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#404040',
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-point-static',
    type: 'circle',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Point']],
    paint: {
      'circle-radius': 5,
      'circle-color': '#404040',
    },
  },

  // {
  //     'id': 'gl-draw-polygon-rotate-point',
  //     'type': 'circle',
  //     'filter': ['all',
  //         ['==', '$type', 'Point'],
  //         ['==', 'meta', 'rotate_point']],
  //     'paint': {
  //         'circle-radius': 5,
  //         'circle-color': '#fbb03b'
  //     }
  // },

  {
    id: 'gl-draw-line-rotate-point',
    type: 'line',
    filter: [
      'all',
      ['==', 'meta', 'midpoint'],
      ['==', 'icon', 'rotate'],
      ['==', '$type', 'LineString'],
      ['!=', 'mode', 'static'],
      // ['==', 'active', 'true']
    ],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#fbb03b',
      'line-dasharray': [0.2, 2],
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-polygon-rotate-point-stroke',
    type: 'circle',
    filter: [
      'all',
      ['==', 'meta', 'midpoint'],
      ['==', 'icon', 'rotate'],
      ['==', '$type', 'Point'],
      ['!=', 'mode', 'static'],
    ],
    paint: {
      'circle-radius': 4,
      'circle-color': '#fff',
    },
  },
  {
    id: 'gl-draw-polygon-rotate-point',
    type: 'circle',
    filter: [
      'all',
      ['==', 'meta', 'midpoint'],
      ['==', 'icon', 'rotate'],
      ['==', '$type', 'Point'],
      ['!=', 'mode', 'static'],
    ],
    paint: {
      'circle-radius': 2,
      'circle-color': '#fbb03b',
    },
  },
  {
    id: 'gl-draw-polygon-rotate-point-icon',
    type: 'symbol',
    filter: [
      'all',
      ['==', 'meta', 'midpoint'],
      ['==', 'icon', 'rotate'],
      ['==', '$type', 'Point'],
      ['!=', 'mode', 'static'],
    ],
    layout: {
      'icon-image': 'rotate',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-rotation-alignment': 'map',
      'icon-rotate': ['get', 'heading'],
    },
    paint: {
      'icon-opacity': 1.0,
      'icon-opacity-transition': {
        delay: 0,
        duration: 0,
      },
    },
  },
];

function App() {
  if (mapboxGl.getRTLTextPluginStatus() === 'unavailable')
    mapboxGl.setRTLTextPlugin(
      'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
      (err) => {
        err && console.error(err);
      },
      true
    );
  let mapRef = useRef(null);

  useEffect(() => {
    map = new mapboxGl.Map({
      container: mapRef.current || '',
      style: `https://map.ir/vector/styles/main/mapir-xyz-light-style.json`,
      center: [51.3857, 35.6102],
      zoom: 10,
      pitch: 0,
      interactive: true,
      hash: true,
      attributionControl: true,
      customAttribution: '© Map © Openstreetmap',
      transformRequest: (url) => {
        return {
          url: url,
          headers: {
            'x-api-key':
              'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImRiZWU0YWU4OTk4OTA3MmQ3OTFmMjQ4ZDE5N2VhZTgwZWU2NTUyYjhlYjczOWI2NDdlY2YyYzIzNWRiYThiMzIzOTM5MDkzZDM0NTY2MmU3In0.eyJhdWQiOiI5NDMyIiwianRpIjoiZGJlZTRhZTg5OTg5MDcyZDc5MWYyNDhkMTk3ZWFlODBlZTY1NTJiOGViNzM5YjY0N2VjZjJjMjM1ZGJhOGIzMjM5MzkwOTNkMzQ1NjYyZTciLCJpYXQiOjE1OTA4MjU0NzIsIm5iZiI6MTU5MDgyNTQ3MiwiZXhwIjoxNTkzNDE3NDcyLCJzdWIiOiIiLCJzY29wZXMiOlsiYmFzaWMiXX0.M_z4xJlJRuYrh8RFe9UrW89Y_XBzpPth4yk3hlT-goBm8o3x8DGCrSqgskFfmJTUD2wC2qSoVZzQKB67sm-swtD5fkxZO7C0lBCMAU92IYZwCdYehIOtZbP5L1Lfg3C6pxd0r7gQOdzcAZj9TStnKBQPK3jSvzkiHIQhb6I0sViOS_8JceSNs9ZlVelQ3gs77xM2ksWDM6vmqIndzsS-5hUd-9qdRDTLHnhdbS4_UBwNDza47Iqd5vZkBgmQ_oDZ7dVyBuMHiQFg28V6zhtsf3fijP0UhePCj4GM89g3tzYBOmuapVBobbX395FWpnNC3bYg7zDaVHcllSUYDjGc1A', //dev api key
            'Mapir-SDK': 'reactjs',
          },
        };
      },
    });
    draw = new MapboxDraw({
      modes: {
        ...MapboxDraw.modes,
        scaleRotateMode: SRMode,
      },
      styles: drawStyle,
      userProperties: true,
    });
    drawBar = new extendDrawBar({
      draw: draw,
      buttons: [
        {
          on: 'click',
          action: scaleRotate,
          classes: ['rotate-icon'],
        },
      ],
    });
    map.once('load', () => {
      map.resize();
      map.loadImage(rotate, function (error, image) {
        if (error) throw error;
        map.addImage('rotate', image);
      });
      map.loadImage(scale, function (error, image) {
        if (error) throw error;
        map.addImage('scale', image);
      });
      map.addControl(drawBar, 'top-right');
      draw.set({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            id: 'example-id',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [51.41742415918904, 35.73019558439101],
                  [51.31319413385742, 35.702773908694724],
                  [51.378997493472525, 35.665562843119986],
                  [51.45008537540798, 35.67776544979942],
                  [51.46619566741822, 35.70822028156377],
                  [51.41742415918904, 35.73019558439101],
                ],
              ],
            },
          },
          {
            id: 'example2_id',
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [51.46717071533203, 35.752642192392955],
                [51.41704559326172, 35.7715862712587],
                [51.37207031249999, 35.73954585450408],
                [51.31988525390625, 35.753756674845675],
                [51.29344940185547, 35.713904233681035],
                [51.37035369873047, 35.67012719291238],
                [51.32434844970703, 35.633581468816594],
              ],
            },
          },
        ],
      });
    });
  }, []);

  const scaleRotate = () => {
    try {
      draw.changeMode('scaleRotateMode', {
        featureId: draw.getSelected().features[0].id, // required

        canScale: true,
        canRotate: true, // only rotation enabled
        canTrash: false, // disable feature delete

        rotatePivot: SRCenter.Center, // rotate around center
        scaleCenter: SRCenter.Opposite, // scale around opposite vertex

        singleRotationPoint: true, // only one rotation point
        rotationPointRadius: 1.2, // offset rotation point

        canSelectFeatures: true,
      });
    } catch (err) {
      alert(err.message);
      console.error(err);
    }
  };

  return (
    <div className="map-wrapper">
      <div id="map" ref={mapRef} />
    </div>
  );
}

export default App;
