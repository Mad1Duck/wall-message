import { HeadContent, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClientProvider } from '@tanstack/react-query'
import { Analytics } from '@vercel/analytics/react'

import Footer from '../components/Footer'
import ClerkProvider from '../integrations/clerk/provider'
import { queryClient } from '../lib/queryClient'

import { getLocale } from '#/paraglide/runtime'

import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'light';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRoute({
  beforeLoad: async () => {
    // Other redirect strategies are possible; see
    // https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#offline-redirect
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', getLocale())
    }
  },

  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Titipkan Pesanmu — Wall Message',
      },
      {
        name: 'description',
        content: 'Terima pesan anonim dari siapa saja. Tanpa nama, tanpa jejak.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'Titipkan Pesanmu' },
      {
        property: 'og:description',
        content: 'Terima pesan anonim dari siapa saja. Tanpa nama, tanpa jejak.',
      },
      { property: 'og:url', content: 'https://YOUR_DOMAIN_HERE' },
      { property: 'og:image', content: 'https://YOUR_DOMAIN_HERE/og-image.png' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Titipkan Pesanmu' },
      {
        name: 'twitter:description',
        content: 'Terima pesan anonim dari siapa saja. Tanpa nama, tanpa jejak.',
      },
      { name: 'twitter:image', content: 'https://YOUR_DOMAIN_HERE/og-image.png' },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { location } = useRouterState()
  const isEmbed = location.pathname.startsWith('/embed/')

  return (
    <html lang={getLocale()} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased wrap-anywhere selection:bg-[rgba(79,184,178,0.24)]">
        <QueryClientProvider client={queryClient}>
        <ClerkProvider>
          {children}
          {!isEmbed && <Footer />}
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        </ClerkProvider>
        </QueryClientProvider>
        <Scripts />
        <Analytics />
      </body>
    </html>
  )
}
