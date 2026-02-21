import { useEffect, useRef, useState } from 'react';

interface NeshanMapProps {
    latitude: number;
    longitude: number;
    onLocationChange: (lat: number, lng: number) => void;
    height?: string;
}

declare global {
    interface Window {
        L: any;
    }
}

const NESHAN_MAP_API_KEY = 'web.e42e22f5a3834e8a944faf590e417fda';
const NESHAN_MAP_SDK_URL = 'https://static.neshan.org/sdk/leaflet/v1.9.4/neshan-sdk/v1.0.8/index.js';
const NESHAN_MAP_CSS_URL = 'https://static.neshan.org/sdk/leaflet/v1.9.4/neshan-sdk/v1.0.8/index.css';

export default function NeshanMap({
    latitude = 35.6892,
    longitude = 51.389,
    onLocationChange,
    height = '300px',
}: NeshanMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Load CSS
    useEffect(() => {
        if (!document.querySelector(`link[href="${NESHAN_MAP_CSS_URL}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = NESHAN_MAP_CSS_URL;
            document.head.appendChild(link);
        }
    }, []);

    // Load SDK
    useEffect(() => {
        if (window.L && window.L.map) {
            setIsLoaded(true);
            return;
        }

        if (document.querySelector(`script[src="${NESHAN_MAP_SDK_URL}"]`)) {
            const checkLoaded = setInterval(() => {
                if (window.L && window.L.map) {
                    setIsLoaded(true);
                    clearInterval(checkLoaded);
                }
            }, 100);
            return () => clearInterval(checkLoaded);
        }

        const script = document.createElement('script');
        script.src = NESHAN_MAP_SDK_URL;
        script.async = true;
        script.onload = () => {
            const checkLoaded = setInterval(() => {
                if (window.L && window.L.map) {
                    setIsLoaded(true);
                    clearInterval(checkLoaded);
                }
            }, 100);
        };
        document.head.appendChild(script);
    }, []);

    // Initialize map
    useEffect(() => {
        if (!isLoaded || !mapContainerRef.current || mapRef.current) return;

        try {
            const map = new window.L.Map(mapContainerRef.current, {
                key: NESHAN_MAP_API_KEY,
                maptype: 'dreamy',
                poi: true,
                traffic: false,
                center: [latitude, longitude],
                zoom: 14,
            });

            mapRef.current = map;

            // Add marker
            const marker = window.L.marker([latitude, longitude], { draggable: true }).addTo(map);
            markerRef.current = marker;

            // Marker drag end
            marker.on('dragend', () => {
                const pos = marker.getLatLng();
                onLocationChange(pos.lat, pos.lng);
            });

            // Map click
            map.on('click', (e: any) => {
                const { lat, lng } = e.latlng;
                marker.setLatLng([lat, lng]);
                onLocationChange(lat, lng);
            });
        } catch (err) {
            console.error('Neshan map init error:', err);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [isLoaded]);

    // Update marker when lat/lng props change externally
    useEffect(() => {
        if (markerRef.current && latitude && longitude) {
            markerRef.current.setLatLng([latitude, longitude]);
            mapRef.current?.setView([latitude, longitude], 14);
        }
    }, [latitude, longitude]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        try {
            const res = await fetch(
                `https://api.neshan.org/v1/search?term=${encodeURIComponent(searchQuery)}&lat=${latitude}&lng=${longitude}`,
                { headers: { 'Api-Key': 'service.3ac36fba46c74a3d9b9a1a7e6c47d5ce' } }
            );
            const data = await res.json();
            if (data.items?.length > 0) {
                const { location } = data.items[0];
                const lat = location.y;
                const lng = location.x;
                markerRef.current?.setLatLng([lat, lng]);
                mapRef.current?.setView([lat, lng], 15);
                onLocationChange(lat, lng);
            }
        } catch {
            console.error('Search failed');
        }
    };

    return (
        <div className="w-full">
            {/* Search */}
            <div className="flex gap-2 mb-3">
                <input
                    type="text"
                    className="flex-1 px-4 py-2.5 border-[1.5px] border-gray-200 rounded-[10px] text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:border-primary-400 focus:ring-[3px] focus:ring-primary-400/10 outline-none"
                    placeholder="جستجوی آدرس..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    dir="rtl"
                />
                <button
                    type="button"
                    onClick={handleSearch}
                    className="px-5 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-[10px] hover:bg-primary-600 transition-colors"
                >
                    جستجو
                </button>
            </div>

            {/* Map */}
            <div className="relative rounded-xl overflow-hidden border border-gray-200">
                {!isLoaded && (
                    <div
                        className="flex items-center justify-center bg-gray-50 text-gray-400 text-sm"
                        style={{ height }}
                    >
                        <span className="inline-block w-6 h-6 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin ml-2" />
                        در حال بارگذاری نقشه...
                    </div>
                )}
                <div
                    ref={mapContainerRef}
                    style={{ height, display: isLoaded ? 'block' : 'none' }}
                    className="w-full"
                />
            </div>

            {/* Coordinates display */}
            {latitude && longitude && (
                <div className="flex gap-4 mt-3 text-xs text-gray-400" dir="ltr">
                    <span>Lat: {latitude.toFixed(6)}</span>
                    <span>Lng: {longitude.toFixed(6)}</span>
                </div>
            )}
        </div>
    );
}
