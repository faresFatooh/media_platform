import Link from 'next/link';

export default function Sidebar({ user }) {
  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-6 font-bold text-xl">Media Platform</div>
      <nav className="flex-1 px-4">
        <Link href="/dashboard"><a className="block py-2 px-3 rounded hover:bg-gray-700">Dashboard</a></Link>
        <Link href="/apps"><a className="block py-2 px-3 rounded hover:bg-gray-700">Applications</a></Link>
        {user.is_admin && (
          <Link href="/activity-log">
            <a className="block py-2 px-3 mt-4 bg-gray-700 rounded hover:bg-gray-600">Activity Log</a>
          </Link>
        )}
      </nav>
    </aside>
  );
}
