'use client';
import { useEffect, useState } from 'react';
import useApiClient from '../utils/request';
import { signIn } from 'next-auth/react';
import Icon from '@/components/icon';

const HomePage = () => {
  const { get, isLoading } = useApiClient();
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    if (isLoading) return;
    const fetchData = async () => {
      try {
        const response = await get('/new_app/test/');
        console.log('Fetched data:', response);
        setData(response);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, [get, isLoading]);

  const handleSignIn = async () => {
    try {
      console.log('keycloak');
      await signIn('keycloak');
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <div>
      <h1>Data from API:</h1>
      <button onClick={handleSignIn}>Sign in with Keycloak</button>
      <Icon type="zhishiku" className="text-2xl" />
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default HomePage;
