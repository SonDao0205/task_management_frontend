import { makeAutoObservable } from "mobx";
import type { Workspace } from "../features/dashboard/types";

export class HomePageStore {
  search = "";
  page = 1;
  modal: "add" | "edit" | null = null;
  selectedWorkspace: Workspace | null = null;
  constructor() { makeAutoObservable(this, {}, { autoBind: true }); }
  setSearch(value: string) { this.search = value; this.page = 1; }
  setPage(value: number) { this.page = value; }
  openModal(modal: "add" | "edit" | null, workspace?: Workspace) { this.selectedWorkspace = workspace ?? null; this.modal = modal; }
}
