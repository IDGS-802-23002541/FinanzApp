import { Outlet } from 'react-router-dom'

// Landing, login y registro.
function PublicLayout() {
  return (
    <main>
      <Outlet />
    </main>
  )
}

export default PublicLayout
