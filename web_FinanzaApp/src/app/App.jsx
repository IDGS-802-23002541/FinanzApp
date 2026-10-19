import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '../context/AuthProvider.jsx'
import { ThemeProvider } from '../context/ThemeProvider.jsx'
import { router } from './router.jsx'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
