export function LoadingSpinner({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const dimensions = {
    small: 'w-8 h-8',
    default: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const innerDimensions = {
    small: 'w-4 h-4',
    default: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  return (
    <div className="text-center space-y-4">
      <div className="relative">
        <div className={`${dimensions[size]} border-4 border-[#1E293B] border-t-transparent rounded-full animate-spin`}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${innerDimensions[size]} bg-white rounded-full`}></div>
        </div>
      </div>
    </div>
  );
}