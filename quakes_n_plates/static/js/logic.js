
(function () {

    function createMap(earthquakeLayer, tectonicPlatesLayer) {

        // creates base layers - background images for users to select from

        let streetLayer = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
            attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
            maxZoom: 18,
            id: "streets-v9",
            accessToken: API_KEY
        });

        let lightLayer = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
            attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
            maxZoom: 18,
            id: "light-v10",
            accessToken: API_KEY
        });

        let satelliteLayer = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
            attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
            maxZoom: 18,
            id: "satellite-streets-v11",
            accessToken: API_KEY
        });

        // defines a baseMaps object to hold our base layers
        let baseMaps = {
            "Street Map": streetLayer,
            "Light Map": lightLayer,
            "Satellite Map": satelliteLayer
        };

        // create overlay object to hold our overlay layer
        let overlayMaps = {
            Earthquakes: earthquakeLayer,
            TectonicPlates: tectonicPlatesLayer
        };

        // creates map object with layers to display on load
        let map = L.map("map", {
            center: [36.5, 3.7],
            zoom: 2,
            layers: [streetLayer, earthquakeLayer, tectonicPlatesLayer]
        });

        // lets user toggle between layers
        L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
        }).addTo(map);

    createLegend(map);

    }

    function createLegend(map) {

        // sets up the legend control object
        let legend = L.control({ position: 'bottomright' });

        legend.onAdd = function (map) {

            // creates DOM element to hold legend
            let div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 0.1, 2.5, 5.5, 6.1, 7, 8];

            // loops through the intervals to generate a label with a colored square for each interval
            for (let i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getCircleColor(grades[i] + .1 ) + '"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            }

            return div;
        };

        legend.addTo(map);

    }

    // returns color based on magnitude size
    function getCircleColor(magnitude) {
        switch (true) {
            // lots of damage - shades of red
            case magnitude > 8:
                return "#800000";
            case magnitude > 7:
                return "#b60a1c";
            case magnitude > 6.1:
                return "#e03531";
            // minor damage - shades of orange
            case magnitude > 5.5:
                return "#ec6a37";
            case magnitude > 2.5:
                return "#e39802";
            // usually not felt - shades of green
            case magnitude > 0.1:
                return "#8ace7e";
            default:
                return "#51b364";
        }
    }

    // returns the style data for each earthquake
    function circleMarkerOptions(feature) {

        // returns radius proportional to magnitude size
        function getCircleRadius(feature) {
            // accounts for magnitudes too small to create a visible radius
            if (feature.properties.mag < 0.1) {
                return 0.1;
            }
            return feature.properties.mag * 3;
        }

        return {
            radius: getCircleRadius(feature),
            fillColor: getCircleColor(feature.properties.mag),
            color: "#000",
            weight: 0.5,
            opacity: 1,
            fillOpacity: 1,
            stroke: true
        }

    }

    function createTectonicLayer(earthquakeLayer) {

        // imports tectonic plates data from https://github.com/fraxen/tectonicplates
        d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
            function (data) {

                // creates layer with tectonic plate lines
                let tectonicPlatesLayer =  L.geoJson(data, {
                    color: "orange",
                    weight: 2
                });

                createMap(earthquakeLayer, tectonicPlatesLayer);
            }
        );
    }

    // imports earthquake data
    d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function (data) {

        // creates layer of circles representing earthquakes
        let earthquakeLayer = L.geoJSON(data, {

            // overrides default marker to create circle markers for each earthquake
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, circleMarkerOptions(feature));
            },

            // runs once per feature to create popup with magnitude and location of earthquake when a marker is clicked
            onEachFeature: function onEachFeature(earthquake, layer) {
                layer.bindPopup("Magnitude: " + earthquake.properties.mag + "<br>Location: " + earthquake.properties.place);
            }

        });

        createTectonicLayer(earthquakeLayer);

    });

}());









