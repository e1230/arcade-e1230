import { CATEGORY_FILTERS, type CategoryFilter as CategoryFilterValue } from "@/lib/games";

interface CategoryFilterProps {
  value: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
}

const ACTIVE_CLASS = "border border-pink bg-pink px-3.5 py-2.5 text-sm font-bold text-background";
const INACTIVE_CLASS =
  "border border-border bg-transparent px-3.5 py-2.5 text-sm font-bold text-soft";

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_FILTERS.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`cursor-pointer active:scale-95 ${value === cat ? ACTIVE_CLASS : INACTIVE_CLASS}`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
