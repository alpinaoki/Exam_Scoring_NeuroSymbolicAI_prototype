import './styles/globals.css'
import LayoutShell from '../components/LayoutShell'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  )
}
