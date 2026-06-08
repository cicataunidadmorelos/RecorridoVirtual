/*
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

import { stopTouchAndScrollEventPropagation } from "./hotspots/funcionesGenerales.js";
import { createMediaHotspotElement } from "./hotspots/hsp_media.js";

(function() {
  var Marzipano = window.Marzipano;
  var bowser = window.bowser;
  var screenfull = window.screenfull;
  var data = window.APP_DATA;

  // Grab elements from DOM.
  var panoElement = document.querySelector('#pano');
  var sceneNameElement = document.querySelector('#titleBar .sceneName');
  var sceneListElement = document.querySelector('#sceneList');
  var sceneElements = document.querySelectorAll('#sceneList .scene');
  var sceneListToggleElement = document.querySelector('#sceneListToggle');
  var autorotateToggleElement = document.querySelector('#autorotateToggle');
  var fullscreenToggleElement = document.querySelector('#fullscreenToggle');

  // Detect desktop or mobile mode.
  if (window.matchMedia) {
    var setMode = function() {
      if (mql.matches) {
        document.body.classList.remove('desktop');
        document.body.classList.add('mobile');
      } else {
        document.body.classList.remove('mobile');
        document.body.classList.add('desktop');
      }
    };
    var mql = matchMedia("(max-width: 500px), (max-height: 500px)");
    setMode();
    mql.addListener(setMode);
  } else {
    document.body.classList.add('desktop');
  }

  // Detect whether we are on a touch device.
  document.body.classList.add('no-touch');
  window.addEventListener('touchstart', function() {
    document.body.classList.remove('no-touch');
    document.body.classList.add('touch');
  });

  // Use tooltip fallback mode on IE < 11.
  if (bowser.msie && parseFloat(bowser.version) < 11) {
    document.body.classList.add('tooltip-fallback');
  }

  // Viewer options.
  var viewerOpts = {
    controls: {
      mouseViewMode: data.settings.mouseViewMode
    }
  };

  // Initialize viewer.
  var viewer = new Marzipano.Viewer(panoElement, viewerOpts);

  // Create scenes.
  var scenes = data.scenes.map(function(data) {
    var urlPrefix = "tiles";
    var source = Marzipano.ImageUrlSource.fromString(
      urlPrefix + "/" + data.id + "/{z}/{f}/{y}/{x}.jpg",
      { cubeMapPreviewUrl: urlPrefix + "/" + data.id + "/preview.jpg" });
    var geometry = new Marzipano.CubeGeometry(data.levels);

    var limiter = Marzipano.RectilinearView.limit.traditional(data.faceSize, 100*Math.PI/180, 120*Math.PI/180);
    var view = new Marzipano.RectilinearView(data.initialViewParameters, limiter);

    var scene = viewer.createScene({
      source: source,
      geometry: geometry,
      view: view,
      pinFirstLevel: true
    });

    // Create link hotspots.
    data.linkHotspots.forEach(function(hotspot) {
      var element = createLinkHotspotElement(hotspot);
      scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
    });

    // Create image hotspots.
    (data.mediaHotspots || []).forEach(function(hotspot) {
      var element = createMediaHotspotElement(hotspot);
      scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
    });


    return {
      data: data,
      scene: scene,
      view: view
    };
  });

  // Set up autorotate, if enabled.
  var autorotate = Marzipano.autorotate({
    yawSpeed: 0.03,
    targetPitch: 0,
    targetFov: Math.PI/2
  });
  if (data.settings.autorotateEnabled) {
    autorotateToggleElement.classList.add('enabled');
  }

  // Set handler for autorotate toggle.
  autorotateToggleElement.addEventListener('click', toggleAutorotate);

  // Set up fullscreen mode, if supported.
  if (screenfull.enabled && data.settings.fullscreenButton) {
    document.body.classList.add('fullscreen-enabled');
    fullscreenToggleElement.addEventListener('click', function() {
      screenfull.toggle();
    });
    screenfull.on('change', function() {
      if (screenfull.isFullscreen) {
        fullscreenToggleElement.classList.add('enabled');
      } else {
        fullscreenToggleElement.classList.remove('enabled');
      }
    });
  } else {
    document.body.classList.add('fullscreen-disabled');
  }

  // Set handler for scene list toggle.
  sceneListToggleElement.addEventListener('click', toggleSceneList);

  // El menú original fue desactivado a favor del ChatBot UI
  // if (!document.body.classList.contains('mobile')) {
  //   showSceneList();
  // }

  // Set handler for scene switch.
  scenes.forEach(function(scene) {
    var el = document.querySelector('#sceneList .scene[data-id="' + scene.data.id + '"]');
    el.addEventListener('click', function() {
      switchScene(scene);
      // On mobile, hide scene list after selecting a scene.
      if (document.body.classList.contains('mobile')) {
        hideSceneList();
      }
    });
  });

  // DOM elements for view controls.
  var viewUpElement = document.querySelector('#viewUp');
  var viewDownElement = document.querySelector('#viewDown');
  var viewLeftElement = document.querySelector('#viewLeft');
  var viewRightElement = document.querySelector('#viewRight');
  var viewInElement = document.querySelector('#viewIn');
  var viewOutElement = document.querySelector('#viewOut');

  // Dynamic parameters for controls.
  var velocity = 0.7;
  var friction = 3;

  // Associate view controls with elements.
  var controls = viewer.controls();
  controls.registerMethod('upElement',    new Marzipano.ElementPressControlMethod(viewUpElement,     'y', -velocity, friction), true);
  controls.registerMethod('downElement',  new Marzipano.ElementPressControlMethod(viewDownElement,   'y',  velocity, friction), true);
  controls.registerMethod('leftElement',  new Marzipano.ElementPressControlMethod(viewLeftElement,   'x', -velocity, friction), true);
  controls.registerMethod('rightElement', new Marzipano.ElementPressControlMethod(viewRightElement,  'x',  velocity, friction), true);
  controls.registerMethod('inElement',    new Marzipano.ElementPressControlMethod(viewInElement,  'zoom', -velocity, friction), true);
  controls.registerMethod('outElement',   new Marzipano.ElementPressControlMethod(viewOutElement, 'zoom',  velocity, friction), true);

  function sanitize(s) {
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;');
  }

  function switchScene(scene) {
    stopAutorotate();
    scene.view.setParameters(scene.data.initialViewParameters);
    scene.scene.switchTo();
    startAutorotate();
    updateSceneName(scene);
    updateSceneList(scene);

    // Minimap logic

    const currentId = scene.data.id; 
    const roomData = mapCoordinates[currentId];

    console.log("Loading room with ID:", currentId); 

    if (roomData) {
      userDot.style.top = roomData.top;
      userDot.style.left = roomData.left;

      if (currentVisibleFloor != roomData.floor) {
        minimapImage.src = floorImages[roomData.floor];
        currentVisibleFloor = roomData.floor;

        console.log("Swapped map to: ", roomData.floor);

        const labels = document.querySelectorAll('.floor-label');
        console.log(`Found ${labels.length} floor labels. Trying to light up: `, roomData.floor);
        
        labels.forEach(label => {
          if (label.getAttribute('data-floor') === roomData.floor) {
            label.classList.add('is-active');
          } else {
            label.classList.remove('is-active');
          }
        })
      }

    } else {
      console.warn("No map data found for ID: ", currentId);
      userDot.style.opacity = 0;
    }
  }

  function updateSceneName(scene) {
    sceneNameElement.innerHTML = sanitize(scene.data.name);
  }

  function updateSceneList(scene) {
    for (var i = 0; i < sceneElements.length; i++) {
      var el = sceneElements[i];
      if (el.getAttribute('data-id') === scene.data.id) {
        el.classList.add('current');
      } else {
        el.classList.remove('current');
      }
    }
  }

  function showSceneList() {
    sceneListElement.classList.add('enabled');
    sceneListToggleElement.classList.add('enabled');
  }

  function hideSceneList() {
    sceneListElement.classList.remove('enabled');
    sceneListToggleElement.classList.remove('enabled');
  }

  function toggleSceneList() {
    sceneListElement.classList.toggle('enabled');
    sceneListToggleElement.classList.toggle('enabled');
  }

  function startAutorotate() {
    if (!autorotateToggleElement.classList.contains('enabled')) {
      return;
    }
    viewer.startMovement(autorotate);
    viewer.setIdleMovement(3000, autorotate);
  }

  function stopAutorotate() {
    viewer.stopMovement();
    viewer.setIdleMovement(Infinity);
  }

  function toggleAutorotate() {
    if (autorotateToggleElement.classList.contains('enabled')) {
      autorotateToggleElement.classList.remove('enabled');
      stopAutorotate();
    } else {
      autorotateToggleElement.classList.add('enabled');
      startAutorotate();
    }
  }

  function createLinkHotspotElement(hotspot) { // Este no se puede poner en la carpeta de hotpots.

    // Create wrapper element to hold icon and tooltip.
    var wrapper = document.createElement('div');
    wrapper.classList.add('hotspot');
    wrapper.classList.add('link-hotspot');

    // Create image element.
    var icon = document.createElement('img');
    icon.src = 'img/link.webp';
    icon.classList.add('link-hotspot-icon');

    // Set rotation transform.
    var transformProperties = [ '-ms-transform', '-webkit-transform', 'transform' ];
    for (var i = 0; i < transformProperties.length; i++) {
      var property = transformProperties[i];
      icon.style[property] = 'rotate(' + hotspot.rotation + 'rad)';
    }

    // Add click event handler.
    wrapper.addEventListener('click', function() {
      switchScene(findSceneById(hotspot.target));
    });

    // Prevent touch and scroll events from reaching the parent element.
    // This prevents the view control logic from interfering with the hotspot.
    stopTouchAndScrollEventPropagation(wrapper);

    // Create tooltip element.
    var tooltip = document.createElement('div');
    tooltip.classList.add('hotspot-tooltip');
    tooltip.classList.add('link-hotspot-tooltip');
    tooltip.innerHTML = findSceneDataById(hotspot.target).name;

    wrapper.appendChild(icon);
    wrapper.appendChild(tooltip);

    return wrapper;
  }
  
    function findSceneById(id) {
      for (var i = 0; i < scenes.length; i++) {
        if (scenes[i].data.id === id) {
          return scenes[i];
        }
      }
      return null;
    }
  
    function findSceneDataById(id) {
      for (var i = 0; i < data.scenes.length; i++) {
        if (data.scenes[i].id === id) {
          return data.scenes[i];
        }
      }
      return null;
    }

  // Minimap user display logic
  
  const floorImages = {
    'floor-0': 'piso0.png',
    'floor-1': 'piso1.png',
    'floor-2': 'piso2.png'
  }

  const mapCoordinates = {
    '0-entrada-cicata' : { top: '90%', left: '20%', floor: 'floor-0' },
    '1-zona-exterior' : { top: '90%', left: '40%', floor: 'floor-0' },
    '2-letras-cicata' : { top: '65%', left: '63%', floor: 'floor-1' },
    '3-estacionamiento-exterior' : { top: '90%', left: '70%', floor: 'floor-0' },
    '4-estacionamiento-interior' : { top: '50%', left: '63%', floor: 'floor-0' },
    '5-entrada-bioterio' : { top: '50%', left: '85%', floor: 'floor-0' },
    '13-lobby-piso-1' : { top: '43%', left: '63%', floor: 'floor-1' },
    '14-oficinas-piso-1' : { top: '47%', left: '83%', floor: 'floor-1' },
    '15-mesa-reuniones' : { top: '68%', left: '95%', floor: 'floor-1' },
    '16-pasillo-entrada-laboratorios' : { top: '46%', left: '48%', floor: 'floor-1' },
    '17-pasillo-laboratorios-1' : { top: '45%', left: '42%', floor: 'floor-1' },
    '18-pasillo-laboratorios-2' : { top: '45%', left: '32%', floor: 'floor-1' },
    '19-pasillo-laboratorios-3' : { top: '46%', left: '20%', floor: 'floor-1' },
    '20-biologa-molecular' : { top: '42%', left: '15%', floor: 'floor-1' },
    '21-cultivo-celular-y-microscopia' : { top: '58%', left: '13%', floor: 'floor-1' },
    '22-pasillo-laboratorios-4' : { top: '59%', left: '20%', floor: 'floor-1' },
    '23-microbiologa' : { top: '69%', left: '23%', floor: 'floor-1' },
    '24-pasillo-laboratorios-5' : { top: '59%', left: '32%', floor: 'floor-1' },
    '25-camara-fria' : { top: '54%', left: '37%', floor: 'floor-1' },
    '26-cromatografa-y-espectrofotometra' : { top: '70%', left: '31%', floor: 'floor-1' },
    '27-pasillo-laboratorios-6' : { top: '65%', left: '43%', floor: 'floor-1' },
    '28-bioprocesos' : { top: '70%', left: '39%', floor: 'floor-1' },
    '29-acondicionamiento-de-material' : { top: '72%', left: '48%', floor: 'floor-1' },
    '30-lobby-piso-2' : { top: '43%', left: '63%', floor: 'floor-2' },
    '31-oficinas-segundo-piso' : { top: '50%', left: '27%', floor: 'floor-2' },
    '32-salon-clases-1' : { top: '72%', left: '22%', floor: 'floor-2' },
    '33-salon-clases-2' : { top: '72%', left: '31%', floor: 'floor-2' },
    '34-biblioteca' : { top: '60%', left: '10%', floor: 'floor-2' },
    '35-sala-reuniones-2' : { top: '45%', left: '4%', floor: 'floor-2' },
    '36-salas-vacias-segundo-piso' : { top: '60%', left: '80%', floor: 'floor-2' },
    '37-laboratorio-de-computo' : { top: '60%', left: '90%', floor: 'floor-2' },
    '38-sala-grande' : { top: '70%', left: '90%', floor: 'floor-2' },
    '39-sala-pequea' : { top: '48%', left: '86%', floor: 'floor-2' }
  };
  window.SCENE_FLOOR_MAP = Object.fromEntries(
    Object.entries(mapCoordinates).map(([sceneId, coordinates]) => [sceneId, coordinates.floor])
  );

  let currentVisibleFloor = null;

  const userDot = document.getElementById('user-dot');
  const minimapImage = document.getElementById('minimap-image');

  // Display the initial scene.
  switchScene(scenes[0]);
  


document.getElementById('pano').addEventListener('mousedown', function(e) {
  var coords = viewer.view().screenToCoordinates({
    x: e.clientX,
    y: e.clientY
  });

  console.log(coords);
});

})();


