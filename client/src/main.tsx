import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'
import { UIProvider } from './contexts/UIContext.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx' // Import AuthProvider
import { CartProvider } from './contexts/CartContext.tsx' // Import CartProvider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <UIProvider>
        <AuthProvider> {/* Wrap with AuthProvider */}
          <CartProvider> {/* Wrap with CartProvider */}
            <App />
          </CartProvider>
        </AuthProvider>
      </UIProvider>
    </ThemeProvider>
  </StrictMode>,
)
