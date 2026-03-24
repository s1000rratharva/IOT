import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌱</span>
          <span className="font-bold text-lg text-green-400">Smart Irrigation</span>
        </div>
        <div className="flex items-center gap-4">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-sm px-3 py-1.5 rounded-lg transition ${isActive ? 'bg-green-700 text-white' : 'text-gray-400 hover:text-white'}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/plants"
            className={({ isActive }) =>
              `text-sm px-3 py-1.5 rounded-lg transition ${isActive ? 'bg-green-700 text-white' : 'text-gray-400 hover:text-white'}`
            }
          >
            Plants
          </NavLink>
          <div className="flex items-center gap-2 ml-4 border-l border-gray-700 pl-4">
            <span className="text-sm text-gray-400 hidden sm:block">{user?.name}</span>
            <button
              onClick={logout}
              className="text-sm text-red-400 hover:text-red-300 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
