import { makeAutoObservable } from "mobx";
import type { StatusKey, Task } from "../features/dashboard/types";

export class WorkspacePageStore {
  workspaceId = "";
  search = "";
  modal: "add-task" | "add-member" | "members" | null = null;
  selectedTask: Task | null = null;
  openStatuses: Record<StatusKey, boolean> = {
    todo: true,
    progress: false,
    review: false,
    done: false,
  };
  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }
  forWorkspace(id: string) {
    if (id !== this.workspaceId) {
      this.workspaceId = id;
      this.search = "";
      this.modal = null;
      this.selectedTask = null;
      this.openStatuses = {
        todo: true,
        progress: false,
        review: false,
        done: false,
      };
    }
  }
  setSearch(value: string) {
    this.search = value;
  }
  setModal(value: "add-task" | "add-member" | "members" | null) {
    this.modal = value;
  }
  selectTask(task: Task | null) {
    this.selectedTask = task;
  }
  toggleStatus(status: StatusKey) {
    this.openStatuses[status] = !this.openStatuses[status];
  }
  openStatus(status: StatusKey) {
    this.openStatuses[status] = true;
  }
}
