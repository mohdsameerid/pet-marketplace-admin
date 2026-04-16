import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  iconColor?: string;
  bgColor?: string;
  highlight?: boolean;
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  iconColor = 'text-blue-600',
  bgColor = 'bg-blue-50',
  highlight = false,
}: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl border p-5 flex items-center gap-4 ${highlight ? 'border-yellow-400 ring-1 ring-yellow-300' : 'border-gray-200'}`}>
      <div className={`${bgColor} p-3 rounded-lg`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
