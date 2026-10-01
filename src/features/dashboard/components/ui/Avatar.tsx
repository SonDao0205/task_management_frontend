import styles from "@/app/page.module.css";
import type { AvatarData } from "../../types";

export function Avatar({
  person,
  size = "medium",
}: {
  person: AvatarData;
  size?: "small" | "medium" | "large";
}) {
  const sizeName = `avatar${size[0].toUpperCase()}${size.slice(1)}`;
  return (
    <span
      className={`${styles.avatar} ${styles[sizeName]} ${styles[`avatar${person.color}`]}`}
      title={person.name}
    >
      {person.initials}
    </span>
  );
}
