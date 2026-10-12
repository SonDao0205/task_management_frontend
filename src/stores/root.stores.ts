import { AuthStore } from "./auth.store";
import { FeedbackStore } from "./feedback.store";
import { TaskStore } from "./task.store";
import { WorkspaceStore } from "./workspace.store";
import { HomePageStore } from "./home-page.store";
import { MyTasksPageStore } from "./my-tasks-page.store";
import { WorkspacePageStore } from "./workspace-page.store";
import { ProfilePageStore } from "./profile-page.store";
import { CommentStore } from "./comment.store";

export class RootStore {
  authStore: AuthStore;
  workspaceStore: WorkspaceStore;
  taskStore: TaskStore;
  feedbackStore: FeedbackStore;
  commentStore: CommentStore;
  homePageStore = new HomePageStore();
  myTasksPageStore = new MyTasksPageStore();
  workspacePageStore = new WorkspacePageStore();
  profilePageStore = new ProfilePageStore();

  constructor() {
    this.authStore = new AuthStore();
    this.workspaceStore = new WorkspaceStore();
    this.taskStore = new TaskStore(this.workspaceStore);
    this.feedbackStore = new FeedbackStore();
    this.commentStore = new CommentStore();
  }
}
