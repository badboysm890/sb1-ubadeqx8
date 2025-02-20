import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Settings, Users, FolderKanban, Import, Search, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';
import { ImportSubmenu } from './ImportSubmenu';
import { useAuthStore } from '../stores/authStore';

interface SidebarProps {
  userName: string;
}

export function Sidebar({ userName }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { profile } = useAuthStore();

  // Check if user is individual (company name is 'Smortr User')
  const isIndividual = profile?.company_name === 'Smortr User';

  const navItems = [
    { icon: FolderKanban, label: 'Projects', to: '/projects' },
    // Only show Teams for non-individual users
    ...(!isIndividual ? [{ icon: Users, label: 'Team', to: '/team' }] : []),
    { icon: Settings, label: 'Settings', to: '/settings' },
  ];

  return (
    <div
      className={cn(
        'h-screen bg-white border-r transition-all duration-300 flex flex-col',
        isExpanded ? 'w-64' : 'w-16'
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className={cn('h-16 flex items-center border-b', isExpanded ? 'px-4' : 'justify-center px-2')}>
        <img
          src="https://framerusercontent.com/images/rLmrjpWWFPyTOfn61iSNoIOn8k.png?scale-down-to=512&lossless=1"
          alt="Smortr Logo"
          className="h-8 w-auto"
        />
      </div>

      <div className={cn('px-4 py-3', isExpanded ? 'block' : 'hidden')}>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for anything"
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-transparent rounded-lg focus:outline-none focus:border-gray-300"
          />
        </div>
      </div>

      <div className="px-4 py-3 border-b">
        <div className={cn('text-sm font-medium text-gray-900', isExpanded ? 'block' : 'hidden')}>
          User
          {isIndividual && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
              Individual
            </span>
          )}
        </div>
        <button className={cn('mt-2 flex items-center gap-2 rounded-lg', isExpanded ? 'w-full px-3 py-2 bg-gray-50' : 'justify-center w-full py-2')}>
          <div className="w-6 h-6 flex-shrink-0 bg-gray-200 rounded-md flex items-center justify-center text-xs font-medium">
            {userName[0]?.toUpperCase()}
          </div>
          {isExpanded && (
            <>
              <span className="flex-1 text-sm text-left truncate">{userName}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </>
          )}
        </button>
      </div>

      <nav className="flex-1 p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors',
                isActive && 'bg-gray-100',
                !isExpanded && 'justify-center'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className={cn('ml-3', isExpanded ? 'block' : 'hidden')}>
              {item.label}
            </span>
          </NavLink>
        ))}

        {/* Import section - not clickable */}
        <div className="relative">
          <div
            className={cn(
              'flex items-center px-3 py-2 rounded-lg text-gray-700 cursor-default',
              !isExpanded && 'justify-center'
            )}
          >
            <Import className="w-5 h-5" />
            <span className={cn('ml-3', isExpanded ? 'block' : 'hidden')}>
              Import
            </span>
          </div>
          <ImportSubmenu isExpanded={isExpanded} />
        </div>
      </nav>
    </div>
  );
}