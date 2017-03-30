mapboxgl.accessToken = '';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    center: [-122.59311, 45.5930],
    preserveDrawingBuffer: true,
    zoom: 6
});

map.on('load', function () {

    map.addSource('land', { type: 'geojson', data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_land.geojson' });
    map.addLayer({
        "id": "land",
        "type": "fill",
        "source": "land",
        "maxzoom": 18,
        "layout": {
            "visibility": 'visible'
        },
        "paint": {
            'fill-color': '#00ffff',
            'fill-opacity': 0.5
        }
    });

    map.addSource('state-boundaries', { type: 'geojson', data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_1_states_provinces_shp.geojson' });
    map.addLayer({
        "id": "state-boundaries",
        "type": "fill",
        "source": "state-boundaries",
        "maxzoom": 18,
        "layout": {
            "visibility": 'visible'
        },
        "paint": {
            'fill-color': '#CEE5C2',
            'fill-opacity': 0.5,
            'fill-outline-color': '#2b2424'
        }
    });

    map.addSource('elevation', { type: 'geojson', data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_geography_regions_elevation_points.geojson' });
    map.addLayer({
        "id": "elevation-points",
        "type": "circle",
        "source": "elevation",
        "layout": {
            "visibility": 'visible'
        },
        "paint": {
            'circle-color': '#eae00b',
            'circle-opacity': 0.8,
            'circle-stroke-color': '#2b2424',
            'circle-stroke-width': 1
        }
    });


    map.addSource('railroads', { 'type': 'geojson', 'data': 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_railroads_north_america.geojson'});
    map.addLayer({
        "id": "railroads",
        "type": "line",
        "source": "railroads",
        "layout": {
            'visibility': 'visible'
        },
        "paint": {
            "line-color": "#c7515f",
            "line-width": 3,
            "line-dasharray": [4,4],
        }
    });

    map.addSource('airports', { type: 'geojson', data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson' });
    map.addLayer({
        "id": "airports",
        "type": "symbol",
        "source": "airports",
        "minzoom": 12,
        "maxzoom": 15,
        "layout": {
            "visibility": 'visible',
            'icon-image': 'airport-11'

        },
        "paint": {}
    });
});

var layers =
[
    {
        'name': 'Group',
        'directory': 'Misc',
        'id': 'foo',
        'layerGroup' : [
            {
                'id': 'land',
                'source': 'land',
                'name': 'Land',
                'icon': 'https://static.typingclub.com/m/tpmedia/img/replay-icon.png'
            },
            {
                'id': 'state-boundaries',
                'source': 'state-boundaries',
                'name': 'State Bounds'
            }
        ]
    },
    {
        'name': 'Elevated Points',
        'id': 'elevation-points',
        'source': 'elevation',
        'directory': 'Misc',
    },
    {
        'name': 'Railroads',
        'id': 'railroads',
        'source': 'railroads',
        'directory': 'Misc',
    },
    {
        'name': 'Airports',
        'id': 'airports',
        'source': 'airports',
        'directory': 'Transportation'
    },
];

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.ScaleControl());
map.addControl(new PrintControl({
    disclaimer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    northArrow: '../../north_arrow.svg'
}));
map.addControl(new LayerTree({
    layers: layers
}), 'bottom-left');


