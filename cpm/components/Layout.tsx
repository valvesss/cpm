import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  navigation?: ReactNode
  actions?: ReactNode
}

export default function Layout({ children, navigation, actions }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              {navigation}
              <h1 className="text-xl sm:text-2xl font-bold">Chinese Poker Manager</h1>
            </div>
            <div className="flex items-center">
              {actions}
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {children}
      </main>
    </div>
  )
}

