import { makeAutoObservable } from "mobx";
export class ProfilePageStore {
  changePasswordOpen = false;
  changingPassword = false;
  constructor() { makeAutoObservable(this, {}, { autoBind: true }); }
  setPasswordDialog(open: boolean) { this.changePasswordOpen = open; }
  setChangingPassword(value: boolean) { this.changingPassword = value; }
}
