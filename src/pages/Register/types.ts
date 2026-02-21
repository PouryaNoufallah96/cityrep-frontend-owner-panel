export interface GymFormData {
    title: string;
    phoneNumber: string;
    supportedGender: string;
    address: string;
    description: string;
    selectedTrends: string[];
    latitude: number | null;
    longitude: number | null;
    images: { file?: File; url: string; order: number }[];
}

export interface StepProps {
    formData: GymFormData;
    updateField: <K extends keyof GymFormData>(field: K, value: GymFormData[K]) => void;
    clearField: (field: keyof GymFormData) => void;
}
