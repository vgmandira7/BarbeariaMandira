import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Scissors, User, Calendar, LogOut } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import AdminLogin from './AdminLogin';

interface HeaderProps {
  currentUser: string | null;
  isAdmin: boolean;
  onUserLogin: (name: string, phone: string) => void; // agora recebe nome e telefone
  onAdminLogin: () => void;
  onLogout: () => void;
}

const Header = ({ currentUser, isAdmin, onUserLogin, onAdminLogin, onLogout }: HeaderProps) => {
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');

  const handleUserLogin = () => {
    if (userName.trim() && userPhone.trim()) {
      onUserLogin(userName.trim(), userPhone.trim());
      setUserName('');
      setUserPhone('');
      setShowUserLogin(false);
    }
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Scissors className="h-8 w-8 text-barber-primary" />
          <div>
            <h1 className="text-2xl font-bold text-barber-primary">BARBEARIA</h1>
            <p className="text-sm text-muted-foreground font-medium">MANDIRA</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {currentUser ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {isAdmin ? 'Admin' : currentUser}
                </span>
              </div>
              <Button onClick={onLogout} variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Dialog open={showUserLogin} onOpenChange={setShowUserLogin}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <User className="h-4 w-4 mr-2" />
                    Entrar como Cliente
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-center">Identificação</h2>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Digite seu nome completo"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        onKeyPress={(e) => e.key === 'Enter' && handleUserLogin()}
                      />
                      <input
                        type="tel"
                        placeholder="Digite seu telefone"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        onKeyPress={(e) => e.key === 'Enter' && handleUserLogin()}
                      />
                      <Button onClick={handleUserLogin} className="w-full">
                        Continuar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary">
                    <Calendar className="h-4 w-4 mr-2" />
                    Área do Barbeiro
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <AdminLogin onAdminLogin={onAdminLogin} />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
