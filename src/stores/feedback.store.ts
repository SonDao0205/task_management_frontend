import { makeAutoObservable } from "mobx";

export class FeedbackStore {
  toast = "";
  private timeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    makeAutoObservable(this, { timeout: false } as any, { autoBind: true });
  }

  notify(message: string) {
    this.toast = message;
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.toast = "";
      this.timeout = null;
    }, 2600);
  }
}
