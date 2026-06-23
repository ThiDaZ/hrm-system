interface CardProps {
    title: string;
    value: string | number;
}

export default function Card({ title, value }: CardProps) {
    return (
        <div className="bg-background p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted">{title}</h3>
            <p className="text-3xl font-bold text-surface-deep">{value}</p>
        </div>
    );
}