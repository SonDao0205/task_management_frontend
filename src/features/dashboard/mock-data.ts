import type {
  AvatarData,
  MyTaskWorkspace,
  Priority,
  StatusKey,
  Task,
  Workspace,
} from "./types";

export const currentUser: AvatarData = {
  initials: "NS",
  color: "blue",
  name: "Nguyễn Sơn",
};

export const avatarPool: AvatarData[] = [
  currentUser,
  { initials: "ML", color: "purple", name: "Mai Linh" },
  { initials: "TH", color: "orange", name: "Tuấn Hoàng" },
  { initials: "AN", color: "green", name: "An Nguyễn" },
  { initials: "KP", color: "pink", name: "Khánh Phương" },
];

export const initialWorkspaces: Workspace[] = [
  {
    id: 1,
    name: "Ecommerce Platform",
    role: "Owner",
    taskCount: 24,
    updatedAt: "Hôm nay, 10:32",
    memberCount: 8,
    members: avatarPool.slice(0, 3),
  },
  {
    id: 2,
    name: "Learning Management System",
    role: "Master",
    taskCount: 17,
    updatedAt: "23/09/2026",
    memberCount: 5,
    members: [avatarPool[3], avatarPool[1]],
  },
  {
    id: 3,
    name: "Internal CRM",
    role: "Member",
    taskCount: 12,
    updatedAt: "21/09/2026",
    memberCount: 5,
    members: [avatarPool[4], avatarPool[2], avatarPool[3]],
  },
];

export const initialWorkspaceTasks: Task[] = [
  {
    id: "TM-104",
    title: "Thiết kế schema cho module Order",
    description: "Chuẩn hóa các bảng order, order_item và transaction.",
    priority: "high",
    status: "todo",
    deadline: "28/09/2026",
    days: 4,
    assignee: avatarPool[0],
  },
  {
    id: "TM-108",
    title: "Tạo API quản lý voucher",
    description:
      "CRUD voucher, kiểm tra điều kiện sử dụng và giới hạn lượt dùng.",
    priority: "medium",
    status: "todo",
    deadline: "30/09/2026",
    days: 6,
    assignee: avatarPool[1],
  },
  {
    id: "TM-112",
    title: "Refactor validation middleware",
    description:
      "Tách validation schema và chuẩn hóa format lỗi trả về client.",
    priority: "low",
    status: "todo",
    deadline: "02/10/2026",
    days: 8,
    assignee: avatarPool[2],
  },
  {
    id: "TM-097",
    title: "Tích hợp Redis Cache",
    description: "Cache danh sách sản phẩm nổi bật và thông tin category.",
    priority: "high",
    status: "progress",
    deadline: "26/09/2026",
    days: 2,
    assignee: avatarPool[0],
  },
  {
    id: "TM-099",
    title: "Hoàn thiện giao diện Admin Order",
    description: "Thêm bộ lọc trạng thái và xem chi tiết đơn hàng.",
    priority: "medium",
    status: "progress",
    deadline: "27/09/2026",
    days: 3,
    assignee: avatarPool[1],
  },
  {
    id: "TM-092",
    title: "Kiểm thử luồng checkout",
    description: "Test race condition khi nhiều user cùng đặt sản phẩm.",
    priority: "high",
    status: "review",
    deadline: "25/09/2026",
    days: 1,
    assignee: avatarPool[2],
  },
  {
    id: "TM-081",
    title: "Thiết lập cấu trúc project backend",
    description: "Hoàn thiện base module, logging và error handler.",
    priority: "medium",
    status: "done",
    deadline: "20/09/2026",
    days: 0,
    assignee: avatarPool[0],
  },
  {
    id: "TM-085",
    title: "Xây dựng màn hình đăng nhập",
    description: "Hoàn thiện responsive và validation biểu mẫu.",
    priority: "medium",
    status: "done",
    deadline: "21/09/2026",
    days: 0,
    assignee: avatarPool[3],
  },
  {
    id: "TM-087",
    title: "Cấu hình pipeline CI",
    description: "Thiết lập lint, test và build tự động.",
    priority: "low",
    status: "done",
    deadline: "21/09/2026",
    days: 0,
    assignee: avatarPool[4],
  },
  {
    id: "TM-089",
    title: "Tài liệu hóa API sản phẩm",
    description: "Bổ sung ví dụ request và response.",
    priority: "low",
    status: "done",
    deadline: "22/09/2026",
    days: 0,
    assignee: avatarPool[2],
  },
];

export const initialMyTasks: MyTaskWorkspace[] = [
  {
    id: 1,
    name: "Ecommerce Platform",
    tasks: [
      { ...initialWorkspaceTasks[0], deadline: "Còn 4 ngày", tag: "Backend" },
      {
        id: "TM-116",
        title: "Viết API lịch sử giao dịch",
        description: "Danh sách giao dịch theo user và order.",
        priority: "medium",
        status: "todo",
        deadline: "Còn 8 ngày",
        days: 8,
        assignee: currentUser,
        tag: "Backend",
      },
      { ...initialWorkspaceTasks[3], deadline: "Còn 2 ngày", tag: "Backend" },
      {
        id: "TM-101",
        title: "Tạo notification service",
        description: "Gửi thông báo khi task được assign.",
        priority: "medium",
        status: "progress",
        deadline: "Còn 6 ngày",
        days: 6,
        assignee: currentUser,
        tag: "Service",
      },
    ],
  },
  {
    id: 2,
    name: "Learning Management System",
    tasks: [
      {
        id: "LMS-054",
        title: "Review API khóa học",
        description: "Kiểm tra response format và permission.",
        priority: "high",
        status: "review",
        deadline: "Còn 1 ngày",
        days: 1,
        assignee: currentUser,
        tag: "Backend",
      },
      {
        id: "LMS-031",
        title: "Khởi tạo module User",
        description: "CRUD user và phân quyền cơ bản.",
        priority: "low",
        status: "done",
        deadline: "Đã hoàn thành",
        days: 0,
        assignee: currentUser,
        tag: "Backend",
      },
    ],
  },
];

export const statusKeys: StatusKey[] = ["todo", "progress", "review", "done"];
export const statusMeta: Record<StatusKey, { label: string }> = {
  todo: { label: "To Do" },
  progress: { label: "In Progress" },
  review: { label: "Review" },
  done: { label: "Done" },
};
export const priorityMeta: Record<Priority, string> = {
  high: "Cao",
  medium: "Trung bình",
  low: "Thấp",
};
