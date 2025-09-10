import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the login page as soon as the component mounts
    router.push('/login');
  }, []);

  // You can show a loading message while redirecting
  return <p>Loading...</p>;
}