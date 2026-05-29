import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from '../services/api-client';

export function useList<T>(resource: string, queryParams?: string) {
  const endpoint = queryParams ? `/${resource}?${queryParams}` : `/${resource}`;
  
  return useQuery({
    queryKey: [resource, queryParams],
    queryFn: () => ApiClient.get<{ data: T[] }>(endpoint),
  });
}

export function useGet<T>(resource: string, id: string) {
  return useQuery({
    queryKey: [resource, id],
    queryFn: () => ApiClient.get<{ data: T }>(`/${resource}/${id}`),
    enabled: !!id,
  });
}

export function useCreate<T, D = any>(resource: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: D) => ApiClient.post<{ data: T }>(`/${resource}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resource] });
    },
  });
}

export function useUpdate<T, D = any>(resource: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: D }) =>
      ApiClient.put<{ data: T }>(`/${resource}/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [resource] });
      queryClient.invalidateQueries({ queryKey: [resource, variables.id] });
    },
  });
}

export function useDelete(resource: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ApiClient.delete(`/${resource}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resource] });
    },
  });
}
