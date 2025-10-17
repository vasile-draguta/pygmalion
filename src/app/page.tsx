import { trpc, getQueryClient } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Client } from './client';
import { Suspense } from 'react';

const HomePage = async () => {
  const querryClient = getQueryClient();
  void querryClient.prefetchQuery(trpc.hello.queryOptions({ text: 'World!' }));
  return (
    <HydrationBoundary state={dehydrate(querryClient)}>
      <Suspense fallback={<p>Loading...</p>}>
        <Client />
      </Suspense>
    </HydrationBoundary>
  );
};

export default HomePage;
