import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { AnalyzeImageRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useAnalyses() {
  return useQuery({
    queryKey: [api.analysis.list.path],
    queryFn: async () => {
      const res = await fetch(api.analysis.list.path, { credentials: "include" });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch analyses");
      return api.analysis.list.responses[200].parse(await res.json());
    },
  });
}

export function useAnalysis(id: number) {
  return useQuery({
    queryKey: [api.analysis.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.analysis.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch analysis");
      return api.analysis.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useAnalyzeImage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: AnalyzeImageRequest) => {
      const res = await fetch(api.analysis.analyzeImage.path, {
        method: api.analysis.analyzeImage.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to analyze image");
      }

      return api.analysis.analyzeImage.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.analysis.list.path] });
      toast({
        title: "Analysis Complete",
        description: "Your artwork has been successfully analyzed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteAnalysis() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.analysis.delete.path, { id });
      const res = await fetch(url, { 
        method: api.analysis.delete.method,
        credentials: "include" 
      });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Analysis not found");
        throw new Error("Failed to delete analysis");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.analysis.list.path] });
      toast({
        title: "Deleted",
        description: "Analysis record removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
