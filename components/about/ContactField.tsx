interface ContactFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
  disabled: boolean;
  invalid: boolean;
  multiline?: boolean;
}

// Campo del formulario de contacto (referencia: styles.css líneas 813-824 y 1124-1130)
export function ContactField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  maxLength,
  disabled,
  invalid,
  multiline = false,
}: ContactFieldProps) {
  const controlClass = `w-full bg-background px-3 font-mono text-foreground outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-placeholder focus:border-cyan focus:shadow-[0_0_12px_rgba(0,245,255,0.35)] disabled:opacity-60 ${
    invalid ? "border border-pink" : "border border-border-neon"
  }`;

  return (
    <div className="mb-3 flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="font-mono text-[10px] tracking-[0.16em] text-subtle uppercase"
      >
        {label}
      </label>
      {multiline ? (
        <textarea
          id={name}
          name={name}
          rows={5}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          aria-invalid={invalid ? "true" : undefined}
          className={`${controlClass} min-h-[110px] resize-y py-3`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          aria-invalid={invalid ? "true" : undefined}
          className={`${controlClass} h-11`}
        />
      )}
    </div>
  );
}
