import { Link, useLocation } from 'react-router-dom';
import { Home, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobileNav() {
    const location = useLocation();

    // Only show on mobile
    // Using a fixed position at the bottom

    const navItems = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Editor', path: '/editor', icon: Edit3 },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe pt-2 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
            <div className="flex justify-around items-center px-4 h-16">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex flex-col items-center gap-1 p-2 min-w-[60px] relative transition-colors ${isActive ? 'text-black' : 'text-gray-300 hover:text-gray-500'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute -top-2 w-8 h-1 bg-black rounded-b-lg"
                                />
                            )}
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[9px] font-black uppercase tracking-widest">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
