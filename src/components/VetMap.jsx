import { useCallback, useEffect, useRef, useState } from 'react';

const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-places-sdk';
const HOTLINE_PHONE = '0800 XXX XXX';

function loadGoogleMaps() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return Promise.reject(new Error('Не указан VITE_GOOGLE_MAPS_API_KEY.'));
  }

  if (window.google?.maps?.places) {
    return Promise.resolve(window.google);
  }

  const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve(window.google), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Не удалось загрузить Google Maps.')), {
        once: true,
      });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error('Не удалось загрузить Google Maps.'));
    document.head.appendChild(script);
  });
}

function getRatingStars(rating) {
  if (!rating) return 'Рейтинг не указан';

  const filledStars = Math.round(rating);
  return `${'★'.repeat(filledStars)}${'☆'.repeat(Math.max(0, 5 - filledStars))} ${rating.toFixed(1)}`;
}

function getMarkerIcon(color) {
  return {
    path: window.google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: 8,
  };
}

export default function VetMap({ isOpen, onClose, diagnosis }) {
  const mapRef = useRef(null);
  const googleRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [showCitySearch, setShowCitySearch] = useState(false);
  const [city, setCity] = useState('');
  const [vets, setVets] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
  }, []);

  const addMarker = useCallback((position, title, color) => {
    const marker = new window.google.maps.Marker({
      position,
      map: mapInstanceRef.current,
      title,
      icon: getMarkerIcon(color),
    });
    markersRef.current.push(marker);
  }, []);

  const loadPlaceDetails = useCallback((places) => {
    if (!places.length || !mapInstanceRef.current) {
      setVets(places);
      return;
    }

    const service = new googleRef.current.maps.places.PlacesService(mapInstanceRef.current);
    const settledPlaces = places.map((place) => ({ ...place }));
    let pending = places.length;

    places.forEach((place, index) => {
      if (!place.place_id) {
        pending -= 1;
        if (pending === 0) setVets(settledPlaces);
        return;
      }

      service.getDetails(
        {
          placeId: place.place_id,
          fields: ['formatted_phone_number', 'international_phone_number', 'website', 'url'],
        },
        (details, detailStatus) => {
          if (detailStatus === googleRef.current.maps.places.PlacesServiceStatus.OK && details) {
            settledPlaces[index] = {
              ...settledPlaces[index],
              phone: details.international_phone_number || details.formatted_phone_number || '',
              website: details.website || '',
              url: details.url || '',
            };
          }

          pending -= 1;
          if (pending === 0) setVets(settledPlaces);
        },
      );
    });
  }, []);

  const searchNearby = useCallback(
    (location) => {
      if (!googleRef.current || !mapRef.current) return;

      setStatus('Ищем ветеринаров рядом...');
      setError('');
      setVets([]);
      setHasSearched(false);
      clearMarkers();

      const map = mapInstanceRef.current || new googleRef.current.maps.Map(mapRef.current, {
        center: location,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      mapInstanceRef.current = map;
      map.setCenter(location);
      map.setZoom(13);
      addMarker(location, 'Вы здесь', '#2f80ed');

      const request = {
        location,
        radius: 10000,
        keyword: 'ветеринар veterinar vet clinic',
      };

      const service = new googleRef.current.maps.places.PlacesService(map);
      service.nearbySearch(request, (results, nearbyStatus) => {
        if (nearbyStatus !== googleRef.current.maps.places.PlacesServiceStatus.OK || !results?.length) {
          setStatus('');
          setVets([]);
          setHasSearched(true);
          return;
        }

        const bounds = new googleRef.current.maps.LatLngBounds();
        bounds.extend(location);

        const places = results.slice(0, 10).map((place) => {
          const position = place.geometry?.location;
          if (position) {
            addMarker(position, place.name, '#2f9e44');
            bounds.extend(position);
          }

          return {
            place_id: place.place_id,
            name: place.name,
            address: place.vicinity || place.formatted_address || 'Адрес не указан',
            rating: place.rating,
          };
        });

        map.fitBounds(bounds);
        setStatus('');
        setHasSearched(true);
        setVets(places);
        loadPlaceDetails(places);
      });
    },
    [addMarker, clearMarkers, loadPlaceDetails],
  );

  const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setShowCitySearch(true);
      setStatus('');
      return;
    }

    setStatus('Запрашиваем геолокацию...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setShowCitySearch(false);
        searchNearby({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setShowCitySearch(true);
        setStatus('');
        setError('Геолокация недоступна. Введите город или район вручную.');
      },
    );
  }, [searchNearby]);

  useEffect(() => {
    if (!isOpen) return undefined;

    let isMounted = true;

    setStatus('Загружаем карту...');
    setError('');
    setVets([]);
    setHasSearched(false);
    setShowCitySearch(false);

    loadGoogleMaps()
      .then((google) => {
        if (!isMounted) return;
        googleRef.current = google;
        requestGeolocation();
      })
      .catch((loadError) => {
        if (!isMounted) return;
        setStatus('');
        setError(loadError.message);
        setShowCitySearch(true);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, requestGeolocation]);

  const handleCitySearch = (event) => {
    event.preventDefault();

    if (!city.trim() || !googleRef.current) return;

    setStatus('Ищем район на карте...');
    setError('');

    const geocoder = new googleRef.current.maps.Geocoder();
    geocoder.geocode({ address: city.trim() }, (results, geocodeStatus) => {
      if (geocodeStatus !== googleRef.current.maps.GeocoderStatus.OK || !results?.[0]) {
        setStatus('');
        setError('Не удалось найти этот город или район. Попробуйте уточнить запрос.');
        return;
      }

      searchNearby(results[0].geometry.location);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="vet-modal-backdrop" role="presentation" onClick={onClose}>
      <div className="vet-modal" role="dialog" aria-modal="true" aria-label="Найти ветеринара рядом" onClick={(event) => event.stopPropagation()}>
        <button className="vet-modal-close" type="button" aria-label="Закрыть" onClick={onClose}>
          ×
        </button>

        <div className="vet-diagnosis">🔴 Диагноз: {diagnosis || 'требуется консультация ветеринара'}</div>

        {showCitySearch && (
          <form className="vet-city-form" onSubmit={handleCitySearch}>
            <input
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Введите ваш город или район"
              aria-label="Введите ваш город или район"
            />
            <button type="submit">Искать</button>
          </form>
        )}

        {error && <div className="vet-error">{error}</div>}
        {status && <div className="vet-status">{status}</div>}

        <div className="vet-map" ref={mapRef} />

        <div className="vet-list">
          {vets.length > 0 ? (
            vets.map((vet) => (
              <article className="vet-card" key={vet.place_id || vet.name}>
                <div>
                  <h3>{vet.name}</h3>
                  <p>{vet.address}</p>
                  <div className="vet-rating">{getRatingStars(vet.rating)}</div>
                </div>
                {vet.phone ? (
                  <a className="vet-call" href={`tel:${vet.phone.replaceAll(' ', '')}`}>
                    Позвонить
                  </a>
                ) : (
          <span className="vet-call disabled">Нет телефона</span>
                )}
              </article>
            ))
          ) : (
            hasSearched &&
            !status && (
              <div className="vet-empty">
                Ветеринаров рядом не найдено.
                <br />
                Позвоните на горячую линию: {HOTLINE_PHONE}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
