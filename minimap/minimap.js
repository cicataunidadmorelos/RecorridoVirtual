const minimapContainer = document.getElementById('minimap-container');
const minimapOverlay = document.getElementById('minimap-overlay');

const floorDefaults = {
    "floor-0": "4-estacionamiento-interior",
    "floor-1": "13-lobby-piso-1", 
    "floor-2": "30-lobby-piso-2"
};

document.querySelectorAll('.floor-label').forEach(label => {
    label.style.cursor = 'pointer';
    label.addEventListener('click', function() {
        const floor = this.dataset.floor;
        const sceneId = floorDefaults[floor];
        const sceneBtn = document.querySelector(`#sceneList .scene[data-id="${sceneId}"]`);
        if (sceneBtn) sceneBtn.click();
    });
});

minimapContainer.addEventListener('click', function(e) {
    e.stopPropagation();
    const isExpanded = minimapContainer.classList.toggle('is-expanded');
    minimapOverlay.style.display = isExpanded ? 'block' : 'none';
});

document.addEventListener('click', function() {
    minimapContainer.classList.remove('is-expanded');
    minimapOverlay.style.display = 'none';
});