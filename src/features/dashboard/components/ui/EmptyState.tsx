import styles from "@/app/page.module.css";
import { Icon } from "./Icon";

export function EmptyState({ message }: { message: string }) {
  return (
    <div className={styles.emptyState}>
      <span>
        <Icon name="search" size={24} />
      </span>
      <strong>Không tìm thấy kết quả</strong>
      <p>{message}</p>
    </div>
  );
}
