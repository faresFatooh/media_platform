import Link from 'next/link';

export default function Sidebar({ user }) {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen">
      <div className="p-6 text-2xl font-bold">Media Platform</div>
      <nav className="flex-1 px-4">
        <Link href="/dashboard">
          <div className="py-3 px-4 rounded hover:bg-gray-800 cursor-pointer transition-colors duration-200">
            Dashboard
          </div>
        </Link>
        <Link href="/apps">
          <div className="py-3 px-4 rounded hover:bg-gray-800 cursor-pointer transition-colors duration-200">
            Applications
          </div>
        </Link>
        {user.is_admin && (
          <Link href="/activity-log">
            <div className="py-3 px-4 mt-4 rounded bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors duration-200">
              Activity Log
            </div>
          </Link>
        )}
      </nav>
    </aside>
  );
}
