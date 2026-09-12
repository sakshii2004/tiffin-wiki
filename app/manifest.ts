import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'tiffin.wiki — Find Tiffin Services Near You',
    short_name: 'tiffin.wiki',
    description: 'Community directory of home-style tiffin meal delivery services across India.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fbf8f2',
    theme_color: '#c44d2b',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
