// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Energy Monitoring System',
  description: 'Monitor and configure energy meters',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
return (
  <html lang="en">
    <body className={`${inter.className} bg-white dark:bg-gray-900 transition-colors`}>
      <nav className="bg-blue-600 dark:bg-blue-800 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">⚡</span>
            </div>
            <h1 className="text-xl font-bold">Energy Monitor</h1>
          </div>
          <div className="flex items-center space-x-6">
            <a href="/" className="hover:underline hover:text-blue-200 transition-colors">Home</a>
            <a href="/dashboard" className="hover:underline hover:text-blue-200 transition-colors">Dashboard</a>
            <a href="/energy-analytics" className="hover:underline hover:text-blue-200 transition-colors">Energy Analytics</a>
            <a href="/modbus" className="hover:underline hover:text-blue-200 transition-colors">Modbus Config</a>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4 min-h-screen">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="container mx-auto p-6 text-center text-gray-600 dark:text-gray-400">
          <p>Energy Monitoring System &copy; 2024 - Real-time Industrial Energy Analytics</p>
        </div>
      </footer>
    </body>
  </html>
)
}
