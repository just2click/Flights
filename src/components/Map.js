import React, { useState, useEffect } from 'react';
import { useGoogleMaps } from 'react-hook-google-maps';
import destinationCities from '../assets/destinations/destinationsList'

const iconBase = 'http://maps.google.com/mapfiles/kml/shapes';

const icons = {
  city: {
    url: iconBase + '/placemark_circle.png'
  },
  plane: {
    url: iconBase + 'airports.png'
  },
  redMarker: {
    url: iconBase + 'placemark_square_highlight.png'
  }
}

  let animLoop = false;
  let animIndex = 0;
  let planePath = false;
  let trailPath = false;

  let localGoogle = null;
  let localMap = null;
  const planes = [];
  const arcs = [];

  const planeSymbol	= {
    path: 'M22.1,15.1c0,0-1.4-1.3-3-3l0-1.9c0-0.2-0.2-0.4-0.4-0.4l-0.5,0c-0.2,0-0.4,0.2-0.4,0.4l0,0.7c-0.5-0.5-1.1-1.1-1.6-1.6l0-1.5c0-0.2-0.2-0.4-0.4-0.4l-0.4,0c-0.2,0-0.4,0.2-0.4,0.4l0,0.3c-1-0.9-1.8-1.7-2-1.9c-0.3-0.2-0.5-0.3-0.6-0.4l-0.3-3.8c0-0.2-0.3-0.9-1.1-0.9c-0.8,0-1.1,0.8-1.1,0.9L9.7,6.1C9.5,6.2,9.4,6.3,9.2,6.4c-0.3,0.2-1,0.9-2,1.9l0-0.3c0-0.2-0.2-0.4-0.4-0.4l-0.4,0C6.2,7.5,6,7.7,6,7.9l0,1.5c-0.5,0.5-1.1,1-1.6,1.6l0-0.7c0-0.2-0.2-0.4-0.4-0.4l-0.5,0c-0.2,0-0.4,0.2-0.4,0.4l0,1.9c-1.7,1.6-3,3-3,3c0,0.1,0,1.2,0,1.2s0.2,0.4,0.5,0.4s4.6-4.4,7.8-4.7c0.7,0,1.1-0.1,1.4,0l0.3,5.8l-2.5,2.2c0,0-0.2,1.1,0,1.1c0.2,0.1,0.6,0,0.7-0.2c0.1-0.2,0.6-0.2,1.4-0.4c0.2,0,0.4-0.1,0.5-0.2c0.1,0.2,0.2,0.4,0.7,0.4c0.5,0,0.6-0.2,0.7-0.4c0.1,0.1,0.3,0.1,0.5,0.2c0.8,0.2,1.3,0.2,1.4,0.4c0.1,0.2,0.6,0.3,0.7,0.2c0.2-0.1,0-1.1,0-1.1l-2.5-2.2l0.3-5.7c0.3-0.3,0.7-0.1,1.6-0.1c3.3,0.3,7.6,4.7,7.8,4.7c0.3,0,0.5-0.4,0.5-0.4S22,15.3,22.1,15.1z',
    fillColor: '#000',
    fillOpacity: 1.5,
    scale: 0.8,
    strokeWeight: 0
  };

const drawIcon = (data) => {
  const icon = {
    url: icons[data.type].url,
    size: new localGoogle.maps.Size(36, 36),
    origin: new localGoogle.maps.Point(0, 0),
    anchor: new localGoogle.maps.Point(9, 12),
    scaledSize: new localGoogle.maps.Size(25, 25)
  }
  return new localGoogle.maps.Marker({
    map: localMap,
    position: data.position,
    icon,
    title: data.title
  });
}

const drawArc = (data) => {
  const arc = new localGoogle.maps.Polyline({
    path: data.path,
    geodesic: true,
    strokeColor:"##35495e",
    strokeOpacity: 0.8,
    strokeWeight: 1
  });

  arc.setMap(localMap);

  arcs.push({ line: arc, id: data.id })
}

const animate = (startPoint, endPoint, google) => {
  const sP = new google.maps.LatLng(startPoint.lat, startPoint.lng);
  const eP = new google.maps.LatLng(endPoint.lat, endPoint.lng);

  planePath = new google.maps.Polyline({
    path: [sP, eP],
    strokeColor: '#0f0',
		strokeWeight: 0,
		icons: [{
			icon: planeSymbol,
			offset: '0%'
		}],
    map: localMap,
    geodesic: true
  });

	trailPath = new google.maps.Polyline({
		path: [sP, sP],
		strokeColor: '#2eacd0',
		strokeWeight: 2,
		map: localMap,
		geodesic: true
	});

  trailPath.setMap(localMap);
	// Start the animation loop
	animLoop = window.requestAnimationFrame(function(){
		tick(sP, eP);
	});
}

/*
	Runs each animation "tick"
*/

const tick = (startPoint, endPoint) => {
	animIndex+=0.2;

	// Draw trail
	var nextPoint	=	localGoogle.maps.geometry.spherical.interpolate(startPoint,endPoint,animIndex/100);
	trailPath.setPath([startPoint, nextPoint]);

	// Move the plane
	planePath.icons[0].offset=Math.min(animIndex,100)+'%';
	planePath.setPath(planePath.getPath());

	// Ensure the plane is in the center of the screen
	localMap.panTo(nextPoint);

	// We've reached the end, clear animLoop
	if(animIndex>=100) {
		window.cancelAnimationFrame(animLoop);
		animIndex = 0;
    setTimeout(() => {
      trailPath.setMap(null);
      trailPath = undefined;
      planePath.setMap(null);
      planePath = undefined;
    }, 1000);
	}else{
		animLoop = window.requestAnimationFrame(function() {
			tick(startPoint, endPoint);
		});
	}
}

export const Map = React.memo(function Map (props) {
  const API_KEY = process.env.REACT_APP_AUTH_KEY;
  const { ref, map, google } = useGoogleMaps(
    API_KEY,
    {
		  draggable: false,
		  panControl: false,
		  streetViewControl: false,
		  scrollwheel: false,
		  scaleControl: false,
		  disableDefaultUI: true,
		  disableDoubleClickZoom: true,
		  zoom: 3,
		  center: { lat: 51.5072, lng: 0.1275 },
		  styles: [{
        "featureType":"administrative",
        "stylers":[{
          "visibility":"off"
        }]},
        {
          "featureType":"poi",
          "stylers":[{
            "visibility":"simplified"
          }]
        },
        {
          "featureType":"road",
          "elementType":"labels",
          "stylers":[{
            "visibility":"simplified"
          }]
        },
        {
          "featureType":"water",
          "stylers":[{
            "visibility":"simplified"
          }]
        },
        {
          "featureType":"transit",
          "stylers":[{
            "visibility":"simplified"
          }]
        },
        {
          "featureType":"landscape",
          "stylers":[{
            "visibility":"simplified"
          }]
        },
        {
          "featureType": "road.highway",
          "stylers":[{
            "visibility":"off"
          }]
        },
        {
          "featureType":"road.local",
          "stylers":[{
            "visibility":"on"
          }]
        },{"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"water","stylers":[{"color":"#84afa3"},{"lightness":52}]},{"stylers":[{"saturation":-17},{"gamma":0.36}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#3f518c"}]}]
    }
  );

  const [path, setPath] = useState([]);

  localGoogle = google;
  localMap = map;

  useEffect(() => {
    if (props.setPath) {
      const path = [
        { lat: props.path[0].lat, lng: props.path[0].lng },
        { lat: props.path[1].lat, lng: props.path[1].lng }
      ]
      const id = `${props.path[0].id}-${props.path[1].id}`;
      drawArc({ path, id });
      planes.push({
        id,
        path,
        isInFlight: false
      })
    }
  }, [props.setPath])

  useEffect(() => {
    // Get first plane that isn't in flight
    planes.map(plane => {
      if (!plane.isInFlight) {
        plane.isInFlight = true;
        const arc = arcs.filter(arc => arc.id === plane.id);
        if (arc.length) {
          arc[0].line.setMap(null);
        }
        animate(plane.path[0], plane.path[1], google);
      }
      return null
    })
  }, [props.go])

  if (map) {
    planeSymbol.anchor = new google.maps.Point(11, 11);

    destinationCities.map((destination) => {
      return drawIcon({
        position: {
          lat: destination.lat,
          lng: destination.lng
        },
        title: destination.title,
        type: 'city'
      })
    })
  }

  return (
    <div>
      <div ref={ref} style={{ width: '90vw', height: '70vh' }} className="map" />
    </div>
  )
});
