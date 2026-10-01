import styles from "@/app/page.module.css";
import type { AvatarData } from "../../types";
import { Avatar } from "../ui";

export function AvatarStack({
  members,
  total,
  limit,
}: {
  members: AvatarData[];
  total: number;
  limit: number;
}) {
  const visibleMembers = members.slice(0, limit);
  const remainingCount = Math.max(0, total - visibleMembers.length);

  return (
    <div className={styles.avatarStack}>
      {visibleMembers.map((member, index) => (
        <Avatar
          key={`${member.initials}-${index}`}
          person={member}
          size="small"
        />
      ))}
      {remainingCount > 0 && (
        <span className={styles.avatarMore}>+{remainingCount}</span>
      )}
    </div>
  );
}
