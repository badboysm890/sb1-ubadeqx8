import { useState } from 'react';
import { UserCircle, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';

interface HeaderProps {
  userInitial: string;
}

export function Header({ userInitial }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="h-16 bg-gray-50 border-b flex items-center justify-end px-4 relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-[#1E293B] text-white flex items-center justify-center hover:bg-[#2d3748] transition-colors"
      >
        {userInitial}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-14 right-4 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}