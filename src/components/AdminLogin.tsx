import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface AdminLoginProps {
  onAdminLogin: () => void;
}

const AdminLogin = ({ onAdminLogin }: AdminLoginProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (password === 'mandira123') {
      onAdminLogin();
      setPassword('');
      setError('');
    } else {
      setError('Senha incorreta');
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <Lock className="h-12 w-12 mx-auto text-barber-primary mb-3" />
        <h2 className="text-xl font-semibold">Área do Barbeiro</h2>
        <p className="text-sm text-muted-foreground">Digite a senha para acessar</p>
      </div>
      
      <div className="space-y-3">
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          className="w-full px-3 py-2 border border-input rounded-md bg-background"
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        />
        
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        
        <Button onClick={handleSubmit} className="w-full">
          Entrar
        </Button>
      </div>
    </div>
  );
};

export default AdminLogin;