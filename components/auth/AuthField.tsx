interface AuthFieldProps {
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  accent?: "cyan" | "pink";
}

const ACCENT_CLASS: Record<NonNullable<AuthFieldProps["accent"]>, string> = {
  cyan: "border-cyan/40 focus:border-cyan focus:shadow-[0_0_14px_rgba(0,245,255,.6)]",
  pink: "border-pink/40 focus:border-pink focus:shadow-[0_0_14px_rgba(255,0,110,.6)]",
};

export function AuthField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  accent = "cyan",
}: AuthFieldProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-bold text-muted">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`border-2 bg-background px-3.5 py-3 text-base text-foreground outline-none ${ACCENT_CLASS[accent]}`}
      />
    </label>
  );
}
