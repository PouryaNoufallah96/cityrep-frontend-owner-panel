import type { StepProps } from '../types';
import NeshanMap from '../../../components/NeshanMap';

export default function LocationStep({ formData, updateField }: StepProps) {
    return (
        <div className="animate-[fadeIn_0.3s_ease-out] rounded-2xl overflow-hidden">
            <NeshanMap
                latitude={formData.latitude ?? 35.6892}
                longitude={formData.longitude ?? 51.389}
                onLocationChange={(lat, lng) => {
                    updateField('latitude', lat);
                    updateField('longitude', lng);
                }}
                height="400px"
                hideSearch
                hideCoordinates
                markerColor="primary"
            />
        </div>
    );
}
