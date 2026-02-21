import { useMutation } from '@tanstack/react-query';
import { httpClient } from '../../shared/api/httpClient';
import {
  FileUploadResponse,
  FileUploadResponseSchema,
  FileUploadErrorSchema,
} from '../../shared/api/collection.contracts';
import { ApiError } from '../../shared/api/auth.contracts';

// --- API Functions ---
const uploadFile = async (fileUri: string): Promise<FileUploadResponse> => {
  // Real implementation for React Native file upload
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  } as any);

  const response = await httpClient.post<unknown>('/api/v1/upload', formData, {
      headers: {
          'Content-Type': 'multipart/form-data',
      }
  });
  return FileUploadResponseSchema.parse(response);
};

// --- Hooks ---
export const useUploadFile = () => {
  return useMutation<FileUploadResponse, ApiError, string>({
    mutationFn: (fileUri) => uploadFile(fileUri),
  });
};
