import './App.css'
import { Navigate, Route, Routes } from "react-router";
import { ThemeProvider } from './context/ThemeContext'
import { WallpaperProvider } from './context/WallpaperContext'
import ChatPage from './pages/ChatPage'
import AuthPage from './pages/AuthPage'

function App() {
  return (

    <ThemeProvider>
      <WallpaperProvider>
        <Routes>
          <Route path="/" element={<ChatPage /> } />
          <Route
            path="/auth"
            element={<AuthPage />}
          />
        </Routes>
      </WallpaperProvider>
    </ThemeProvider>
    


  )
}

export default App