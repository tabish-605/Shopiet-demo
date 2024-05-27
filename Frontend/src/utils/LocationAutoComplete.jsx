import React, { useState } from 'react';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import '../css/upload.css'
const LocationAutocomplete = ({ onLocationSelected }) => {
    const [address, setAddress] = useState('');

    const handleChange = (address) => {
        setAddress(address);
    };

    const handleSelect = (address) => {
        geocodeByAddress(address)
            .then(results => getLatLng(results[0]))
            .then(({ lat, lng }) => {
                console.log('Success', { lat, lng });
                onLocationSelected({
                    address,
                    lat: lat, // Ensure lat is passed as a number
                    lng: lng, // Ensure lng is passed as a number
                });
            })
            .catch(error => console.error('Error', error));
        setAddress(address);
    };

    const searchOptions = {
        types: ['(cities)'], // Restrict to cities
    
    };

    return (
        <PlacesAutocomplete
            value={address}
            onChange={handleChange}
            onSelect={handleSelect}
            searchOptions={searchOptions}
        >
            {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                <div style={{marginTop:"1rem"}}>
                    <input
                        {...getInputProps({
                            placeholder: 'Type city',
                            className: 'location-search-input',
                        })}
                    />
                    <div className="autocomplete-dropdown-container">
                        {loading && <div>Loading...</div>}
                        {suggestions.map(suggestion => {
                            const className = suggestion.active
                                ? 'suggestion-item--active'
                                : 'suggestion-item';
                            const style = suggestion.active
                                ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                                : { backgroundColor: '#ffffff', cursor: 'pointer', padding:'0.3rem', innerWidth:'200%' };
                            return (
                                <div className='suggestions'
                                    {...getSuggestionItemProps(suggestion, {
                                        className,
                                        style,
                                    })}
                                >
                                    <span>{suggestion.description}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </PlacesAutocomplete>
    );
};

export default LocationAutocomplete;
