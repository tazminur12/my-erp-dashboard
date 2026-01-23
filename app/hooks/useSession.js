'use client';

import { useSession as useNextAuthSession } from 'next-auth/react';

export function useSession() {
  const { data: session, status } = useNextAuthSession();
  
  return {
    session,
    user: session?.user,
    loading: status === 'loading',
    authenticated: status === 'authenticated',
  };
}
