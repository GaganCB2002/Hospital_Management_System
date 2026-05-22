import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useState } from 'react';

export default function DashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className="bg-background font-body-md text-on-background h-screen flex">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <main className="flex-1 flex flex-col h-screen min-w-0">
        <Navbar />
        <section className="flex-1 w-full min-w-0 overflow-y-auto overflow-x-hidden p-lg bg-background text-on-background space-y-lg">
          <Outlet />
        </section>
      </main>
    </div>
  );
}