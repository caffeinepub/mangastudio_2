import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ProjectDTO } from "../backend";
import { useActor } from "./useActor";

export function useListProjects() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listUserProjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProject(projectId: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getProject(projectId);
    },
    enabled: !!actor && !isFetching && !!projectId,
  });
}

export function useCreateProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: ProjectDTO) => {
      if (!actor) throw new Error("No actor");
      return actor.createProject(dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      dto,
    }: { projectId: string; dto: ProjectDTO }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateProject(projectId, dto);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["project", variables.projectId],
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteProject(projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
