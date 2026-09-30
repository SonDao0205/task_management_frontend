"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./not-found.module.css";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className={styles.page}>
      <span
        className={`${styles.cloud} ${styles.cloudLeft}`}
        aria-hidden="true"
      />
      <span
        className={`${styles.cloud} ${styles.cloudRight}`}
        aria-hidden="true"
      />

      <section className={styles.content}>
        <div className={styles.errorArt} aria-label="Lỗi 404">
          <span className={styles.digit}>4</span>
          <span className={styles.zero}>
            <span className={styles.space}>
              <span className={styles.planet} aria-hidden="true" />
            </span>
            <span className={styles.question} aria-hidden="true">
              ?
            </span>
          </span>
          <span className={styles.digit}>4</span>
        </div>

        <p className={styles.eyebrow}>Có vẻ bạn đã đi hơi xa</p>
        <h1>Trang không tồn tại</h1>
        <p className={styles.description}>
          Rất tiếc, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm.
          <br />
          Có thể trang đã bị xóa, đổi tên hoặc bạn đã nhập sai địa chỉ.
        </p>

        <div className={styles.actions}>
          <Link className={`${styles.button} ${styles.primary}`} href="/auth">
            <span aria-hidden="true">⌂</span> Về trang đăng nhập
          </Link>
          <button
            className={`${styles.button} ${styles.secondary}`}
            type="button"
            onClick={() => router.back()}
          >
            <span aria-hidden="true">←</span> Quay lại
          </button>
        </div>
      </section>

      <footer className={styles.footer}>
        “Đôi khi lạc đường cũng là một cách để khám phá những điều mới mẻ...”
      </footer>
    </main>
  );
}
