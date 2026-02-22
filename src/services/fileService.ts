import api, { API_BASE_URL } from '../config/api';

export const fileService = {
    async uploadFile(file: File, fileName?: string): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/File/UploadFile', formData, {
            params: fileName ? { fileName } : undefined,
        });
        return response.data.data;
    },

    getFileUrl(fileName: string): string {
        return `${API_BASE_URL}/File/DownloadFile/${fileName}`;
    },

    async deleteFile(fileName: string): Promise<boolean> {
        const response = await api.delete('/File/DeleteFile', {
            params: { fileName },
        });
        return response.data;
    },
};
