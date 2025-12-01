// app/layout.tsx

import { AuthProvider } from '../context/AuthContext'
import { QuestionProvider } from '../context/QuestionContext'
import { ThemeProvider } from '../context/ThemeContext'
import './globals.css'
import ProtectedLayout from './components/Navbar/ProtectedLayout'
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
       <ThemeProvider>
        <QuestionProvider>
          <AuthProvider>
            <ProtectedLayout>
            {children}
            </ProtectedLayout>
          </AuthProvider>
        </QuestionProvider>
       </ThemeProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
