import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // 캐싱 비활성화 (항상 최신 데이터 요청)
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

export function QueryProvider({ children }: ProvidersProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export default QueryProvider;
