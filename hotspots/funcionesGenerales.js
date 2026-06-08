// Prevent touch and scroll events from reaching the parent element.
function stopTouchAndScrollEventPropagation(element, eventList) {
    var eventList = [ 'touchstart', 'touchmove', 'touchend', 'touchcancel',
                    'wheel', 'mousewheel' ];
    for (var i = 0; i < eventList.length; i++) {
    element.addEventListener(eventList[i], function(event) {
        event.stopPropagation();
    });
    }
}

    export { stopTouchAndScrollEventPropagation }
