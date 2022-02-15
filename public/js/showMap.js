mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', 
    style: 'mapbox://styles/mapbox/light-v10', 
    center: campground.geometry.coordinates,
    zoom: 10,
});

// TODO: CUSTOM MARKER 
new mapboxgl.Marker()
    .setLngLat([-74.5, 40])
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML(
            `<h3>${campground.title}</h3>`
        )
    )
    .addTo(map);