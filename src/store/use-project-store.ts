import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Project } from "../../generated/prisma/client";

type ProjectStore = {
  selectedProject: Project | null;
  setSelectedProject: (project: Project) => void;
  clearSelectedProject: () => void;
};

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      selectedProject: null,
      setSelectedProject: (project) => set({ selectedProject: project }),
      clearSelectedProject: () => set({ selectedProject: null }),
    }),
    {
      name: "selected-project", // key
    },
  ),
);
