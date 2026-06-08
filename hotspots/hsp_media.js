import { stopTouchAndScrollEventPropagation } from "./funcionesGenerales.js";

/* Estrucura del hotspot en data.js

"imageHotspots": [
        {
          "yaw": -2.0, -> ubicación en eje x 
          "pitch": 0, -> ubicación en eje y
          "title":    "Balanza analítica",
          "tag":      "Equipo de laboratorio",
          "video": "./videos/ConoceNuestraOferta.mp4", / o / "image": "img/ImagenDePrueba.jpg"
          "sections": [
            {
              "subtitle": "Función principal:",
              "body": "Instrumento de alta precisión diseñado para la determinación de masas extremadamente pequeñas, con una legibilidad de hasta 0.1 mg (0.0001 g)."
            },
            {
              "subtitle": "",
              "body": ""
            },
            {
              "subtitle": "",
              "body": ""
            }
          ],
          "link": ""
        }
    ]
*/

// -------- IMAGE Hotspot START -------- //
function createMediaHotspotElement(hotspot) {

  // WRAPPER (solo el botón, sin el modal)
  var wrapper = document.createElement('div');
  wrapper.classList.add('hotspot', 'image-hotspot');

  var header = document.createElement('div');
  header.classList.add('image-hotspot-header');

  var icon = document.createElement('img');
  if(hotspot.image){
    icon.src = 'img/imageIcon.webp';
  }
  else if(hotspot.video){
    icon.src = 'img/videoIcon.webp';
  } else{
    icon.src = 'img/info.webp';
  }

  icon.classList.add('image-hotspot-icon');
  header.appendChild(icon);

  wrapper.appendChild(header);

  // -------- MODAL — se monta en el BODY, fuera del hotspot -------- //
  var overlay = document.createElement('div');
  overlay.classList.add('image-hotspot-overlay');

  var modal = document.createElement('div');
  modal.classList.add('image-hotspot-modal');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  // Cerrar
  var close = document.createElement('button');
  close.classList.add('image-hotspot-close');
  close.innerHTML = '✕';
  close.setAttribute('aria-label', 'Cerrar');

  // Columna izquierda — media
  var mediaCol = document.createElement('div');
  mediaCol.classList.add('image-hotspot-media');

  if (hotspot.video) {
  var video = document.createElement('video');
  video.setAttribute('controls', '');
  video.setAttribute('preload', 'metadata');
  
  var source = document.createElement('source');
  source.src = hotspot.video;
  source.type = 'video/mp4';               // ajusta si usas .webm o .ogg
  video.appendChild(source);
  // Fallback por si el navegador no soporta <video>
  video.innerHTML += 'Tu navegador no soporta la reproducción de video.';
  mediaCol.appendChild(video);
  } else if (hotspot.image) {
    var image = document.createElement('img');
    image.src = hotspot.image;
    image.alt = hotspot.title || 'Imagen del recorrido';
    mediaCol.appendChild(image);
  }

  // Columna derecha — info
  var infoCol = document.createElement('div');
  infoCol.classList.add('image-hotspot-info');

  if (hotspot.tag) {
    var tag = document.createElement('div');
    tag.classList.add('image-hotspot-tag');
    tag.textContent = hotspot.tag;
    infoCol.appendChild(tag);
  }

  var title = document.createElement('div');
  title.classList.add('image-hotspot-title');
  title.innerHTML = hotspot.title || '';
  infoCol.appendChild(title);

  var divider = document.createElement('div');
  divider.classList.add('image-hotspot-divider');
  infoCol.appendChild(divider);

  // Secciones de contenido
if (hotspot.sections && hotspot.sections.length) {
  var sectionsContainer = document.createElement('div');
  sectionsContainer.classList.add('image-hotspot-sections');

  hotspot.sections.forEach(function(section) {
    var sectionEl = document.createElement('div');
    sectionEl.classList.add('image-hotspot-section');

    if (section.subtitle) {
      var subtitle = document.createElement('p');
      subtitle.classList.add('image-hotspot-subtitle');
      subtitle.innerHTML = '<strong>' + section.subtitle + '</strong> ' + (section.body || '');
      sectionEl.appendChild(subtitle);
    }

    sectionsContainer.appendChild(sectionEl);
  });

  infoCol.appendChild(sectionsContainer);

} else if (hotspot.text) {
  // fallback al texto plano si no hay sections
  var text = document.createElement('div');
  text.classList.add('image-hotspot-text');
  text.innerHTML = hotspot.text;
  infoCol.appendChild(text);
}

  var footer = document.createElement('div');
  footer.classList.add('image-hotspot-footer');

  var btnClose = document.createElement('button');
  btnClose.classList.add('image-hotspot-btn');
  btnClose.textContent = 'Cerrar';
  footer.appendChild(btnClose);

  if (hotspot.link) {
    var btnLink = document.createElement('a');
    btnLink.classList.add('image-hotspot-btn', 'image-hotspot-btn--primary');
    btnLink.href = hotspot.link;
    btnLink.target = '_blank';
    btnLink.textContent = 'Más información →';
    footer.appendChild(btnLink);
  }

  infoCol.appendChild(footer);

  modal.appendChild(close);
  if(hotspot.video || hotspot.image){
    modal.appendChild(mediaCol);
  }
  modal.appendChild(infoCol);
  overlay.appendChild(modal);

  // ✅ CLAVE: montar en body, completamente fuera del hotspot
  document.body.appendChild(overlay);

  // -------- EVENTOS -------- //
  var openModal = function(e) {
    e.stopPropagation();
    overlay.classList.add('visible');
    document.body.classList.add('vr-modal-open');
  };

  var closeModal = function(e) {
    e.stopPropagation();
    overlay.classList.remove('visible');
    document.body.classList.remove('vr-modal-open');
    
  };

  header.addEventListener('click', openModal);
  close.addEventListener('click', closeModal);
  btnClose.addEventListener('click', closeModal);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeModal(e);
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) closeModal(e);
  });

  stopTouchAndScrollEventPropagation(wrapper);

  return wrapper; // solo devuelve el botón a Marzipano
}
// -------- IMAGE Hotspot END -------- //

export { createMediaHotspotElement }