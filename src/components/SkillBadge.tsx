interface SkillBadgeProps {
  name: string;
  variant?: "offer" | "learn" | "match" | "default";
  onRemove?: () => void;
}

const SkillBadge = ({ name, variant = "default", onRemove }: SkillBadgeProps) => {
  const variantStyles = {
    offer: "bg-accent text-accent-foreground border-primary/20",
    learn: "bg-secondary/15 text-secondary border-secondary/30",
    match: "gradient-hero text-primary-foreground border-transparent",
    default: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${variantStyles[variant]}`}>
      {name}
      {onRemove && (
        <button onClick={onRemove} className="ml-0.5 hover:opacity-70 transition-opacity">
          ✕
        </button>
      )}
    </span>
  );
};

export default SkillBadge;
