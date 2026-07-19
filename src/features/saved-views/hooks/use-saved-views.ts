"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSavedView, deleteSavedView, fetchSavedViews } from "../api";

const QUERY_KEY = ["saved-views"];

export function useSavedViews(enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchSavedViews,
    enabled,
  });
}

export function useCreateSavedView() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSavedView,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteSavedView() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSavedView,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
