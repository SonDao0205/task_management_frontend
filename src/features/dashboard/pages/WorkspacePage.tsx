"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import styles from "@/app/page.module.css";
import { useDashboard } from "../DashboardProvider";
import { statusKeys } from "../mock-data";
import type { Priority, StatusKey, Task } from "../types";
import { AvatarStack, EmptyState, Icon, Modal, StatusSection, TaskDetailModal } from "../components/DashboardUi";

type WorkspaceModal = "add-task" | "add-member" | null;

export default function WorkspacePage({ workspaceId }: { workspaceId: number }) {
  const { workspaces, tasks, addTask, addMember } = useDashboard();
  const workspace = workspaces.find((item) => item.id === workspaceId);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<WorkspaceModal>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [openStatuses, setOpenStatuses] = useState<Record<StatusKey, boolean>>({ todo: true, progress: false, review: false, done: false });

  if (!workspace) return <section className={`${styles.card} ${styles.standaloneEmpty}`}><EmptyState message="Workspace này không tồn tại hoặc đã bị xóa."/><div className={styles.notFoundAction}><Link className={`${styles.button} ${styles.primaryButton}`} href="/">Quay lại trang chủ</Link></div></section>;

  const filteredTasks = tasks.filter((task) => task.title.toLocaleLowerCase("vi").includes(search.toLocaleLowerCase("vi").trim()));

  function submitTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    const deadline = String(data.get("deadline") ?? "");
    const status = String(data.get("status")) as StatusKey;
    if (!title || !deadline) return;
    addTask(workspaceId, {
      title,
      description: String(data.get("description") ?? "").trim(),
      priority: String(data.get("priority")) as Priority,
      status,
      deadline: deadline.split("-").reverse().join("/"),
    });
    setOpenStatuses((current) => ({ ...current, [status]: true }));
    setModal(null);
  }

  function submitMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    if (!email) return;
    addMember(workspaceId, email);
    setModal(null);
  }

  return <section className={styles.page}>
    <div className={`${styles.card} ${styles.workspaceHeader}`}><div className={styles.workspaceInfo}><Link className={styles.backButton} href="/" title="Quay lại"><Icon name="arrow" size={19}/></Link><div className={styles.workspaceMark}>{workspace.name.slice(0, 1)}</div><div className={styles.workspaceMeta}><span>Workspace</span><h1>{workspace.name}</h1><p>Cập nhật gần nhất {workspace.updatedAt.toLocaleLowerCase("vi")}</p></div></div><div className={styles.workspaceRight}><AvatarStack members={workspace.members} total={workspace.memberCount}/><button className={`${styles.button} ${styles.softButton}`} onClick={() => setModal("add-member")}><Icon name="addUser" size={17}/> Thêm thành viên</button></div></div>
    <div className={styles.toolbar}><label className={styles.searchWrap}><Icon name="search" size={18}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm kiếm task trong workspace..."/><span className={styles.srOnly}>Tìm nhiệm vụ</span></label><button className={`${styles.button} ${styles.primaryButton}`} onClick={() => setModal("add-task")}><Icon name="plus" size={17}/> Thêm task</button></div>
    {statusKeys.map((status) => <StatusSection key={status} status={status} tasks={filteredTasks.filter((task) => task.status === status)} open={openStatuses[status]} onToggle={() => setOpenStatuses((current) => ({ ...current, [status]: !current[status] }))} onOpenTask={setSelectedTask}/>) }
    {!filteredTasks.length && <div className={`${styles.card} ${styles.standaloneEmpty}`}><EmptyState message="Không có task nào khớp với từ khóa của bạn."/></div>}

    {modal === "add-task" && <Modal title="Thêm nhiệm vụ mới" subtitle={`Tạo task trong ${workspace.name}.`} onClose={() => setModal(null)}><form className={styles.modalForm} onSubmit={submitTask}><label>Tiêu đề<input name="title" placeholder="Nhập tên nhiệm vụ" autoFocus required/></label><label>Mô tả<textarea name="description" placeholder="Mô tả kết quả cần hoàn thành..." rows={3}/></label><div className={styles.formGrid}><label>Trạng thái<select name="status"><option value="todo">To Do</option><option value="progress">In Progress</option><option value="review">Review</option><option value="done">Done</option></select></label><label>Độ ưu tiên<select name="priority"><option value="medium">Trung bình</option><option value="high">Cao</option><option value="low">Thấp</option></select></label></div><label>Hạn hoàn thành<input name="deadline" type="date" min="2026-09-24" required/></label><div className={styles.modalActions}><button type="button" className={`${styles.button} ${styles.cancelButton}`} onClick={() => setModal(null)}>Hủy</button><button className={`${styles.button} ${styles.primaryButton}`}><Icon name="plus" size={17}/> Thêm task</button></div></form></Modal>}
    {modal === "add-member" && <Modal title="Thêm thành viên" subtitle="Gửi lời mời tham gia workspace qua email." onClose={() => setModal(null)}><form className={styles.modalForm} onSubmit={submitMember}><label>Email thành viên<input name="email" type="email" placeholder="name@company.com" autoFocus required/></label><label>Vai trò<select name="role"><option>Member</option><option>Master</option></select></label><div className={styles.inviteNote}><Icon name="users" size={18}/> Người được mời sẽ nhận quyền truy cập theo vai trò đã chọn.</div><div className={styles.modalActions}><button type="button" className={`${styles.button} ${styles.cancelButton}`} onClick={() => setModal(null)}>Hủy</button><button className={`${styles.button} ${styles.primaryButton}`}>Gửi lời mời</button></div></form></Modal>}
    {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)}/>} 
  </section>;
}
