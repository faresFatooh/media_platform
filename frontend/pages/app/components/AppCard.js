import Link from 'next/link';

export default function AppCard({ app }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-semibold mb-2">{app.name}</h3>
        <p className="text-gray-600">{app.description}</p>
      </div>
      <Link href={`/app/${app.id}`}>
        <div className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-center cursor-pointer transition-colors duration-200">
          Launch App
        </div>
      </Link>
    </div>
  );
}
