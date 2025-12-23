import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    if (location.pathname === '/') return null;

    return (
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 py-4 px-6 md:px-12 lg:px-24">
            <Link to="/" className="hover:text-black transition-colors flex items-center gap-1">
                <Home size={10} />
                Home
            </Link>
            {pathnames.map((name, index) => {
                const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;

                return (
                    <div key={name} className="flex items-center gap-2">
                        <ChevronRight size={10} />
                        {isLast ? (
                            <span className="text-black">{name}</span>
                        ) : (
                            <Link to={routeTo} className="hover:text-black transition-colors">
                                {name}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
