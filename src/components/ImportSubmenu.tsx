import { Box, Cloud, Slack } from 'lucide-react';
import { cn } from '../utils/cn';

interface ImportSubmenuProps {
  isExpanded: boolean;
}

export function ImportSubmenu({ isExpanded }: ImportSubmenuProps) {
  const importOptions = [
    { icon: Box, label: 'Procore', iconColor: 'text-orange-600' },
    { icon: Cloud, label: 'Onedrive', iconColor: 'text-blue-500' },
    { icon: Cloud, label: 'Google Drive', iconColor: 'text-green-500' },
    { icon: Slack, label: 'Slack', iconColor: 'text-purple-500' },
  ];

  if (!isExpanded) return null;

  return (
    <div className="pl-8 space-y-1">
      {importOptions.map((option) => (
        <div
          key={option.label}
          className="group relative"
        >
          <div
            className="flex items-center px-3 py-2 w-full text-sm text-gray-500 cursor-not-allowed rounded-lg"
          >
            <option.icon className={cn('w-4 h-4 mr-3', option.iconColor)} />
            <span>{option.label}</span>
          </div>
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Coming Soon
          </div>
        </div>
      ))}
    </div>
  );
}