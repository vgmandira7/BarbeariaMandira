import { useState } from "react";
import AdminLogin from "@/components/AdminLogin";
import AdminPanel from "@/components/AdminPanel";

const AdminPage = () => {
  const [logado, setLogado] = useState(false);

  return logado ? (
    <AdminPanel />
  ) : (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-6">
        <AdminLogin onAdminLogin={() => setLogado(true)} />
      </div>
    </div>
  );
};

export default AdminPage;
