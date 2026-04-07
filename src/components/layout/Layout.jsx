import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

const Layout = () => {
  return (
    <div className="layout">
      <Sidebar />
      <main className="layout__content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout