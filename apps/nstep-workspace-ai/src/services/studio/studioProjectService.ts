import { STUDIO_PROJECTS } from "../../config/studioProjects.js";

export function getStudioProjectTitle(projectId: string): string {
  return STUDIO_PROJECTS.find((project) => project.id === projectId)?.title ?? projectId;
}

export function getStudioProjectDescription(projectId: string): string {
  return STUDIO_PROJECTS.find((project) => project.id === projectId)?.description ?? "";
}

export function suggestStudioProjectIdFromPath(pathValue: string | undefined): string {
  const normalized = (pathValue ?? "").toLowerCase();
  return STUDIO_PROJECTS.map((project) => project.id).find((id) => normalized.includes(id)) ?? "general-nss-studio";
}
