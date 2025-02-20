import { useState, useEffect } from 'react';
import { Users, UserPlus, Building2, Shield, Mail, Briefcase, Users2, Lock } from 'lucide-react';

function FloatingIcon({ Icon, x, y, scale = 1 }: { 
  Icon: typeof Users;
  x: number;
  y: number;
  scale?: number;
}) {
  return (
    <div 
      className="absolute text-[#1E293B]/5 animate-float"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `scale(${scale})`,
      }}
    >
      <Icon className="w-16 h-16" />
    </div>
  );
}

export function Teams() {
  const [showNotification, setShowNotification] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 10 - 5,
        y: (e.clientY / window.innerHeight) * 10 - 5,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleNotifyClick = () => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const features = [
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Real-time collaboration and team chat"
    },
    {
      icon: Building2,
      title: "Organization Management",
      description: "Manage departments and resources"
    },
    {
      icon: Shield,
      title: "Access Control",
      description: "Role-based permissions and workflows"
    },
    {
      icon: Briefcase,
      title: "Project Management",
      description: "Track and manage team projects"
    }
  ];

  return (
    <div className="h-full relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Floating Background Icons */}
      <FloatingIcon Icon={Users2} x={15} y={20} scale={1.2} />
      <FloatingIcon Icon={Briefcase} x={85} y={25} />
      <FloatingIcon Icon={Lock} x={75} y={75} scale={0.8} />

      <div 
        className="h-full relative flex flex-col items-center justify-center p-6"
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-lg rounded-2xl -z-10" />
          <div className="p-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1E293B] to-[#475569] bg-clip-text text-transparent">
              Team Management
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto mt-4">
              Collaborate effectively with your team on architectural projects
            </p>
            <button
              onClick={handleNotifyClick}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#1E293B] text-white rounded-lg hover:bg-[#2d3748] transition-all hover:shadow-lg"
            >
              <Mail className="w-5 h-5" />
              Notify me when available
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-4xl">
          {features.map((feature) => (
            <div 
              key={feature.title}
              className="relative group"
            >
              <div className="absolute inset-0 bg-white/40 backdrop-blur-lg rounded-2xl transition-all duration-300 group-hover:bg-white/60" />
              <div className="relative p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#1E293B]/5 rounded-lg">
                    <feature.icon className="w-5 h-5 text-[#1E293B]" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">{feature.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Success Notification */}
        {showNotification && (
          <div className="fixed top-6 right-6 bg-white/80 backdrop-blur-lg border border-green-200 text-green-700 px-6 py-4 rounded-lg shadow-lg transition-opacity duration-300">
            Thanks! We'll notify you when team features are available.
          </div>
        )}
      </div>
    </div>
  );
}