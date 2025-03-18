'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'WODs', path: '/wods' },
    { name: 'Benchmarks', path: '/benchmarks' },
    { name: 'Skills', path: '/skills' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <nav>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`block p-2 rounded hover:bg-gray-700 ${
                  pathname === item.path ? 'bg-gray-700' : ''
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
