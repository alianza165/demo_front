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
        <div className="max-w-7xl mx-auto">
          {/* Stack on mobile, row on desktop */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">⚡</span>
              </div>
              <h1 className="text-xl font-bold text-center sm:text-left">Energy Monitor</h1>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6">
              <a href="/" className="hover:underline hover:text-blue-200 transition-colors text-sm sm:text-base">Home</a>
              <a href="/dashboard" className="hover:underline hover:text-blue-200 transition-colors text-sm sm:text-base">Dashboard</a>
              <a href="/single-line" className="hover:underline hover:text-blue-200 transition-colors text-sm sm:text-base">Single Line</a>
              <a href="/energy-analytics" className="hover:underline hover:text-blue-200 transition-colors text-sm sm:text-base">Analytics</a>
              <a href="/modbus" className="hover:underline hover:text-blue-200 transition-colors text-sm sm:text-base">Modbus</a>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-4 min-h-screen">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto p-6 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>Energy Monitoring System &copy; 2024 - Real-time Industrial Energy Analytics</p>
        </div>
      </footer>
    </body>
  </html>
)
}
