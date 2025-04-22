'use client'

import { Auth0Provider } from '@auth0/auth0-react';
import { ReactNode } from 'react';

export default function Auth0ProviderWithNavigate({ children }: { children: ReactNode }) {
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || '';
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || '';

  if (!domain || !clientId) {
    return <div>Auth0 configuration is missing</div>;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
      }}
    >
      {children}
    </Auth0Provider>
  );
}