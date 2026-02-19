import { useMutation } from '@tanstack/react-query';
import { API_FLAGS } from '../../shared/api/config';
import { httpClient } from '../../shared/api/httpClient';
import {
  FileUploadResponse,
  FileUploadResponseSchema,
  FileUploadErrorSchema,
} from '../../shared/api/collection.contracts';
import { ApiError } from '../../shared/api/auth.contracts';

// --- Mock Data ---
const MOCK_UPLOAD_RESPONSE: FileUploadResponse = {
  url: 'https://placehold.co/600x400/png?text=Uploaded+Image',
  fileId: 'file-xyz-123',
};

// --- API Functions ---
const uploadFile = async (fileUri: string): Promise<FileUploadResponse> => {
  if (!API_FLAGS.COLLECTION) {
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate upload time
    return FileUploadResponseSchema.parse(MOCK_UPLOAD_RESPONSE);
  }

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
