
import React, { useState, useRef, useEffect, useCallback } from 'react'
import {GoogleMap, useLoadScript, Marker, InfoWindow} from '@react-google-maps/api';
import styles from './helpers/mapStyles.js';
const moment = require('moment');
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { Combobox, ComboboxInput, ComboboxPopover, ComboboxList, ComboboxOption } from '@reach/combobox';
// import '@reach/combobox/styles.css';
import SearchLocations from './SearchLocations.jsx';
import SearchSpots from './SearchSpots.jsx';
import Locate from './Locate.jsx';
import apiToken from '../../../../myConfig.js';
import getMarkers from './helpers/getMarkers.js';
import firebase from 'firebase';
import 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import MapInfo from './MapInfo.jsx';
import Auth from '../../Auth.jsx';
import LoggedIn from './LoggedIn.jsx';
import LoggedOut from './LoggedOut.jsx';
const auth = firebase.auth();

const libraries = ["places", "geometry"];
//Height and width necessary for map to work
const mapContainerStyle = {
  width: "75vw",
  height: "75vh",
  margin: '0 auto',
}
//map starting point
const center = {
  lat: 28.5383,
  lng: -81.3792
}
//style and controls options
const options = {
  // styles: styles,
  disableDefaultUI: false,
  // zoomControl: true,
}



const PKMap = (props) => {
  const [user] = useAuthState(auth);
  const [markers, setMarkers] = useState([])
  const [searching, setSearching] = useState('Locations')
  const [temp, setTemp] = useState(null)
  //create info pop ups on markers
  const [selected, setSelected] = useState(null);
  document.addEventListener('touchstart', {passive:true})
  useEffect(() => {
    getMarkers().then(data => {
      setMarkers(data)
    })
  },[])

  const onMapClick = useCallback((e) => {
    setTemp({
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    })
    setSelected(null);
  }, [])
  document.addEventListener('touchstart', onMapClick, {capture: true});


  const mapRef = useRef();
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, [])

  //pans to location
  const panTo = useCallback(({lat, lng}) => {
    mapRef.current.panTo({lat, lng});
    mapRef.current.setZoom(16);
  }, [])

  const handleSearching = (e) => {
    setSearching(e.target.value)
  }
  //loads in the script for google API
  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: apiToken,
    libraries,
  });
  // handle loading of map
  if (loadError) return "error";
  if(!isLoaded) return "Loading";
  return (
    <div id="map">
      <MapInfo changeFeed={props.changeFeed}/><br/>
      <div className="search">
        <select value={searching} onChange={handleSearching}>
          <option value='Locations'>Locations</option>
          <option value="Spots">Spots</option>
        </select><br/>
        {searching === 'Locations'
        ? <SearchLocations
        usePlaces={usePlacesAutocomplete}
        getGeocode={getGeocode}
        getLatLng={getLatLng}
        panTo={panTo}
        location={props.location}/>
        : <SearchSpots
            panTo={panTo}
            markers={markers}/>}

      </div>
      <Locate
        panTo={panTo}
        location={props.location}/>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={8}
        center={props.location || center}
        options={options}
        onClick={onMapClick}
        onLoad={onMapLoad}>
        {markers.map((marker, index) => <Marker
            key={index}
            position={{lat: marker.lat, lng: marker.lng}}
            // icon={{
            //   url: './sneakers-sneaker-svgrepo-com.svg',
            //   //fix size of icon
            //   scaledSize: new window.google.maps.Size(20, 20),
            //   //Keep icon in middle of click
            //   origin: new window.google.maps.Point(0,0),
            //   //Set to half of size
            //   anchor: new window.google.maps.Point(10,10)
            // }}
            onClick={() => {
              setSelected(marker)
            }}
            />
        )}
        {temp ? <Marker
            position={{lat: temp.lat, lng: temp.lng}}
            // icon={{
            //   url: './sneakers-sneaker-svgrepo-com.svg',
            //   //fix size of icon
            //   scaledSize: new window.google.maps.Size(20, 20),
            //   //Keep icon in middle of click
            //   origin: new window.google.maps.Point(0,0),
            //   //Set to half of size
            //   anchor: new window.google.maps.Point(10,10)
            // }}
            onClick={() => {
              setSelected(temp)
            }}/> : null}
        {selected ? (
        <InfoWindow
          position={{
            lat: selected.lat,
            lng: selected.lng}}
          onCloseClick={() => {
            setSelected(null);
          }}>
          {user
            ? <LoggedIn
                setTemp={setTemp}
                setSelected={setSelected}
                selected={selected}/>
            : <LoggedOut
                changeFeed={props.changeFeed}
                selected={selected}/>}

        </InfoWindow>) : null}
      </GoogleMap>
    </div>
  )
}

export default PKMap;

