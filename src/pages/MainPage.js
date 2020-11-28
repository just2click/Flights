import React, { useState, useEffect, useCallback } from 'react';
import { Map } from '../components/Map';
import { Dropdown } from '../components/Dropdown';
import destinationCities from '../assets/destinations/destinationsList'

export const MainPage = () => {
  let [path, setPath] = useState([null, null]);
  const [checkPath, setCheckPath] = useState(false);
  let [resetSelections, setResetSelections] = useState(false);
  let [go, setGo] = useState(0);
  let [origins, setOrigins] = useState([...destinationCities]);
  let [destinations, setDestinations] = useState([...destinationCities]);

  const getCityById = (id) => {
    return destinationCities.find(dest => dest.id === id);
  }

  const getCityIndexBtId = (id) => {
    return destinationCities.map(dest => dest.id).indexOf(id);
  }

  const resetLists = () => {
    setOrigins([...destinationCities]);
    setDestinations([...destinationCities]);
  }

  const toggleResetSelections = () => {
    setResetSelections(resetSelections = !resetSelections);
    setTimeout(() => {
      setResetSelections(resetSelections = !resetSelections);
      path = [null, null];
      setCheckPath(false);
    }, 300);
  }

  const handleDropdowns = () => {
    setOrigins(origins);
    setDestinations(origins);
    const isPathFull = (path[0] !== null && path[1] !== null);
    setCheckPath(isPathFull);
    if (isPathFull) {
      toggleResetSelections();
    }
  }

  const originSelected = useCallback(
    event => {
      path[0] = getCityById(event);
      const index = getCityIndexBtId(event);
      if (index > -1) {
        resetLists();
        delete origins[index];
        handleDropdowns();
      }
    }, []
  )

  const destinationSelected = useCallback(
    event => {
      path[1] = getCityById(event);
      const index = getCityIndexBtId(event);
      if (index > -1) {
        resetLists();
        delete origins[index];
        handleDropdowns();
      }
    }, []
  )

  const startFlight = () => {
    setGo(go =+ 1)
  }

  return(
    <React.Fragment>
      <div className="header">Flights On Map</div>
      <div className="container">
        <div className="load-btns">
          <Dropdown values={origins} selected={originSelected} hint={'Select origin'} reset={resetSelections} />
          <Dropdown values={destinations} selected={destinationSelected} hint={'Select destination'} reset={resetSelections} />
          <button className="app-button" onClick={startFlight}>
            Go!
          </button>
        </div>
        <div>
          <Map path={path} go={go} setPath={checkPath} />
        </div>
      </div>
    </React.Fragment>
  )
}