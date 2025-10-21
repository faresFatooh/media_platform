import Link from 'next/link';

export default function Sidebar({ user }) {
  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-6 font-bold text-xl">Media Platform</div>
      <nav className="flex-1 px-4">
        <Link href="/dashboard"><dev className="block py-2 px-3 rounded hover:bg-gray-700">Dashboard</dev></Link>
        <Link href="/apps"><dev className="block py-2 px-3 rounded hover:bg-gray-700">Applications</dev></Link>
        {user.is_admin && (
          <Link href="/dashboard">
            <div className="block py-2 px-3 rounded hover:bg-gray-700 cursor-pointer">Dashboard</div>
          </Link>

        )}
      </nav>
    </aside>
  );
}
