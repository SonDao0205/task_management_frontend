"use client";

import { FormEvent, useState } from "react";
import styles from "./auth.module.css";
import { LoginRequest, RegisterRequest } from "@/src/types/auth.types";
import { useStore } from "../MobxProvider";
import { useAuth } from "../AuthProvider";

type LoginInput = {
  input: string;
  password: string;
};

type RegisterInput = {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type InputError = {
  inputLogin: string;
  passwordLogin: string;
  nameRegister: string;
  phoneRegister: string;
  emailRegister: string;
  passwordRegister: string;
  confirmPasswordRegister: string;
};

const initError: InputError = {
  inputLogin: "",
  passwordLogin: "",
  nameRegister: "",
  phoneRegister: "",
  emailRegister: "",
  passwordRegister: "",
  confirmPasswordRegister: "",
};

type AuthView = "login" | "register";

export default function AuthPage() {
  // stores
  const { authStore } = useStore();
  const { login } = useAuth();

  // view state
  const [view, setView] = useState<AuthView>("login");
  const [submitting, setSubmitting] = useState(false);
  const isLogin = view === "login";

  // input state
  const [loginForm, setLoginForm] = useState<LoginInput>({
    input: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState<RegisterInput>({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const initForm = () => {
    setRegisterForm({
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setLoginForm({
      input: "",
      password: "",
    });
  };

  const [error, setError] = useState<InputError>(initError);

  // validate
  const validate = (): boolean => {
    const nextError: InputError = { ...initError };
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const vietnamesePhonePattern = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;

    // validate login
    if (view === "login") {
      const input = loginForm.input.trim();

      if (!input) {
        nextError.inputLogin = "Không được bỏ trống thông tin này!";
      } else if (input.includes("@")) {
        if (!emailPattern.test(input)) {
          nextError.inputLogin = "Email không đúng định dạng!";
        }
      } else if (!vietnamesePhonePattern.test(input)) {
        nextError.inputLogin = "Số điện thoại không đúng định dạng!";
      }

      if (!loginForm.password.trim()) {
        nextError.passwordLogin = "Không được bỏ trống thông tin này!";
      }
    }

    // validate register
    else {
      const name = registerForm.name.trim();
      const phone = registerForm.phone.trim();
      const email = registerForm.email.trim();
      const password = registerForm.password;
      const confirmPassword = registerForm.confirmPassword;

      if (!name) {
        nextError.nameRegister = "Tên người dùng không được bỏ trống!";
      }

      if (!phone) {
        nextError.phoneRegister = "Số điện thoại không được bỏ trống!";
      } else if (!vietnamesePhonePattern.test(phone)) {
        nextError.phoneRegister = "Số điện thoại không đúng định dạng!";
      }

      if (!email) {
        nextError.emailRegister = "Email không được bỏ trống!";
      } else if (!emailPattern.test(email) || !email.endsWith("@gmail.com")) {
        nextError.emailRegister = "Email không đúng định dạng!";
      }

      if (!password.trim()) {
        nextError.passwordRegister = "Mật khẩu không được bỏ trống!";
      } else {
        if (password.length < 6 || password.length > 50) {
          nextError.passwordRegister =
            "Độ dài của mật khẩu phải lớn hơn 6 và nhỏ hơn 50";
        }
      }

      if (!confirmPassword.trim()) {
        nextError.confirmPasswordRegister =
          "Xác nhận mật khẩu không được bỏ trống!";
      } else if (confirmPassword !== password) {
        nextError.confirmPasswordRegister =
          "Xác nhận mật khẩu không trùng với mật khẩu!";
      }
    }

    setError(nextError);

    return !Object.values(nextError).some(Boolean);
  };

  // on submit
  const onLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const loginRequest: LoginRequest = {
      input: loginForm.input,
      password: loginForm.password,
    };

    setSubmitting(true);
    try {
      await login(loginRequest);
    } finally {
      initForm();
      setSubmitting(false);
    }
  };

  const onRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const registerRequest: RegisterRequest = {
      name: registerForm.name,
      email: registerForm.email,
      phone: registerForm.phone,
      password: registerForm.password,
    };

    const data = await authStore.register(registerRequest);
    if (data?.success) {
      initForm();
      setView("login");
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.glowTop} aria-hidden="true" />
      <div className={styles.glowBottom} aria-hidden="true" />

      <section className={styles.authCard} aria-labelledby="auth-heading">
        <div className={styles.brand} aria-label="TaskFlow">
          <span className={styles.logoMark} aria-hidden="true">
            <span />
          </span>
          <span>TaskFlow</span>
        </div>

        <div className={styles.tabs} role="tablist" aria-label="Xác thực">
          <button
            className={`${styles.tabButton} ${isLogin ? styles.activeTab : ""}`}
            type="button"
            role="tab"
            aria-selected={isLogin}
            onClick={() => setView("login")}
          >
            Đăng nhập
          </button>
          <button
            className={`${styles.tabButton} ${!isLogin ? styles.activeTab : ""}`}
            type="button"
            role="tab"
            aria-selected={!isLogin}
            onClick={() => setView("register")}
          >
            Đăng ký
          </button>
        </div>

        {isLogin ? (
          <div className={styles.formPanel} role="tabpanel">
            <header className={styles.formHeader}>
              <p className={styles.eyebrow}>Rất vui được gặp lại bạn</p>
              <h1 id="auth-heading">Chào mừng trở lại</h1>
              <p>Đăng nhập để tiếp tục quản lý công việc của bạn.</p>
            </header>

            <form onSubmit={onLogin}>
              <div className={styles.inputGroup}>
                <label htmlFor="login-account">Email hoặc số điện thoại</label>
                <input
                  id="login-account"
                  className={error.inputLogin ? "border-red-500" : ""}
                  type="text"
                  placeholder="Nhập email hoặc số điện thoại"
                  autoComplete="username"
                  value={loginForm.input}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, input: e.target.value })
                  }
                />
                {error.inputLogin && (
                  <p className="text-red-500">{error.inputLogin}</p>
                )}
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="login-password">Mật khẩu</label>
                <input
                  id="login-password"
                  className={error.passwordLogin ? "border-red-500" : ""}
                  type="password"
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                />
                {error.passwordLogin && (
                  <p className="text-red-500">{error.passwordLogin}</p>
                )}
              </div>
              <div className={styles.formOptions}>
                <label className={styles.remember}>
                  <input type="checkbox" />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <button className={styles.textButton} type="button">
                  Quên mật khẩu?
                </button>
              </div>
              <button
                className={styles.submitButton}
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Đang đăng nhập..." : "Đăng nhập"}{" "}
                <span aria-hidden="true">→</span>
              </button>
            </form>

            <p className={styles.switchText}>
              Chưa có tài khoản?{" "}
              <button type="button" onClick={() => setView("register")}>
                Đăng ký ngay
              </button>
            </p>
          </div>
        ) : (
          <div className={styles.formPanel} role="tabpanel">
            <header className={styles.formHeader}>
              <p className={styles.eyebrow}>Bắt đầu hoàn toàn miễn phí</p>
              <h1 id="auth-heading">Tạo tài khoản</h1>
              <p>Điền thông tin để tạo tài khoản TaskFlow mới.</p>
            </header>

            <form onSubmit={onRegister}>
              <div className={styles.inputGroup}>
                <label htmlFor="full-name">Họ và tên</label>
                <input
                  id="full-name"
                  className={error.nameRegister ? "border-red-500" : ""}
                  type="text"
                  placeholder="Nhập họ và tên"
                  autoComplete="name"
                  value={registerForm.name}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, name: e.target.value })
                  }
                />
                {error.nameRegister && (
                  <p className="text-red-500">{error.nameRegister}</p>
                )}
              </div>
              <div className={styles.twoColumns}>
                <div className={styles.inputGroup}>
                  <label htmlFor="phone">Số điện thoại</label>
                  <input
                    id="phone"
                    className={error.phoneRegister ? "border-red-500" : ""}
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    autoComplete="tel"
                    value={registerForm.phone}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        phone: e.target.value,
                      })
                    }
                  />
                  {error.phoneRegister && (
                    <p className="text-red-500">{error.phoneRegister}</p>
                  )}
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    className={error.emailRegister ? "border-red-500" : ""}
                    type="text"
                    placeholder="Nhập email"
                    value={registerForm.email}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        email: e.target.value,
                      })
                    }
                  />
                  {error.emailRegister && (
                    <p className="text-red-500">{error.emailRegister}</p>
                  )}
                </div>
              </div>
              <div className={styles.twoColumns}>
                <div className={styles.inputGroup}>
                  <label htmlFor="register-password">Mật khẩu</label>
                  <input
                    id="register-password"
                    className={error.passwordRegister ? "border-red-500" : ""}
                    type="password"
                    placeholder="Nhập mật khẩu"
                    autoComplete="new-password"
                    value={registerForm.password}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        password: e.target.value,
                      })
                    }
                  />
                  {error.passwordRegister && (
                    <p className="text-red-500">{error.passwordRegister}</p>
                  )}
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="confirm-password">Xác nhận mật khẩu</label>
                  <input
                    id="confirm-password"
                    className={
                      error.confirmPasswordRegister ? "border-red-500" : ""
                    }
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    autoComplete="new-password"
                    value={registerForm.confirmPassword}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                  {error.confirmPasswordRegister && (
                    <p className="text-red-500">
                      {error.confirmPasswordRegister}
                    </p>
                  )}
                </div>
              </div>
              <button className={styles.submitButton} type="submit">
                Tạo tài khoản <span aria-hidden="true">→</span>
              </button>
            </form>

            <p className={styles.switchText}>
              Đã có tài khoản?{" "}
              <button type="button" onClick={() => setView("login")}>
                Đăng nhập
              </button>
            </p>
          </div>
        )}
      </section>

      <p className={styles.copyright}>
        © 2026 TaskFlow · Tập trung hơn mỗi ngày
      </p>
    </main>
  );
}
