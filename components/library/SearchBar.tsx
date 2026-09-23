interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative flex-1 basis-70">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-pixel text-xs text-cyan">
        &gt;
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar juego por nombre o categoría…"
        className="w-full border-2 border-cyan/50 bg-surface py-3.5 pl-11 pr-4 text-base text-foreground outline-none focus:border-cyan focus:shadow-[0_0_14px_rgba(0,245,255,.55)]"
      />
    </div>
  );
}
