import { makeAutoObservable } from "mobx";
import type { Task, StatusKey } from "../features/dashboard/types";

export class MyTasksPageStore {
  search = "";
  sortMode = "default";
  selectedTask: Task | null = null;
  openWorkspaces: Record<string, boolean> = {};
  openStatuses: Record<string, boolean> = {};
  constructor() { makeAutoObservable(this, {}, { autoBind: true }); }
  toggleWorkspace(id: string, defaultOpen: boolean) { this.openWorkspaces[id] = !(this.openWorkspaces[id] ?? defaultOpen); }
  toggleStatus(id: string, status: StatusKey) { const key = `${id}-${status}`; this.openStatuses[key] = !this.openStatuses[key]; }
  setSearch(value: string) { this.search = value; }
  setSortMode(value: string) { this.sortMode = value; }
  selectTask(task: Task | null) { this.selectedTask = task; }
}
