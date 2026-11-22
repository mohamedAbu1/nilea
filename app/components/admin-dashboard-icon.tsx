type AdminDashboardIconProps = {
  size?: number;
};

export function AdminDashboardIcon({ size = 20 }: AdminDashboardIconProps) {
  return (
    <svg
      className="admin-dashboard-icon"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path d="m7 10 17-4 4 3v15l-17 4-4-3V10Z" fill="#204451" opacity=".82" />
      <path d="m4 7 17-4 4 3v15l-17 4-4-3V7Z" fill="#f4c577" />
      <path d="m8 9 12-3v10l-12 3V9Z" fill="#0a2531" />
      <path d="m10 17 2.5-3.2 2 1.3 3-4.3" stroke="#79d9cb" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9 23 12-3v-2l-12 3v2Z" fill="#d79b4c" />
      <path d="m23 6 2 1.5v14l-2 2V6Z" fill="#b97738" opacity=".8" />
      <path d="m4 22 4 3v2l-4-3v-2Z" fill="#bd7a34" opacity=".75" />
      <circle cx="21.5" cy="8.4" r="1.1" fill="#fff0bd" />
    </svg>
  );
}
