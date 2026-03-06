interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-4">
      <h2 className="text-2xl font-bold text-[var(--text)]">{title}</h2>
      <p className="text-sm text-[var(--muted)]">{description}</p>
    </div>
  );
}
