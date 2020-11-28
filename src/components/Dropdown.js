import React, { useState, useEffect, useRef } from 'react';

export const Dropdown = (props) => {
  const [selectedDest, setSelectedDest] = useState('');

  let dropdownToggle = false;
  const dropdownMenuRef = useRef(null);
  const dropdownMenuButtonRef = useRef(null);
  const handleDropdownToggle = () => {
    if (dropdownToggle) {
      dropdownMenuButtonRef.current.classList.remove('dropdown-button-open');
      dropdownMenuRef.current.classList.remove('show')
    } else {
      dropdownMenuButtonRef.current.classList.add('dropdown-button-open');
      dropdownMenuRef.current.classList.add('show')
    }
    dropdownToggle = !dropdownToggle
  }

  const handleDestSelect = (e) => {
    const dest = props.values.find((dest) => {
      if (dest) {
        return dest.id === e.target.dataset.key
      }
      return null;
    })
    setSelectedDest(dest.title);
    props.selected(dest.id);
    handleDropdownToggle();
  }

  useEffect(() => {
  }, [props.values])

  useEffect(() => {
    setSelectedDest(props.hint)
  }, [props.reset]);

  return (
    <div className="btn-group">

      <button type="button" className="dropdown-button dropdown-toggle" ref={dropdownMenuButtonRef}
        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" onClick={handleDropdownToggle}>
        {selectedDest} ▾
      </button>
      <div className="dropdown-menu hide" ref={dropdownMenuRef}>
        <div className="sources-links">
          { props.values.map((dest, index) => {
            return (
              <a className="dropdown-item" key={index} href="#" data-key={dest.id} onClick={handleDestSelect}>{dest.title}</a>
            )
          }) }
        </div>
        <div className="dropdown-divider" />
      </div>
    </div>
  )
}