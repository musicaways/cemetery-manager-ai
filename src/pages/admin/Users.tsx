
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Ban } from "lucide-react";

type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  status: 'pending' | 'active' | 'banned';
  created_at: string;
};

type UserRole = 'admin' | 'read_write' | 'read_only';

export const UsersAdmin = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast.error("Errore nel caricamento degli utenti: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateUserStatus = async (userId: string, status: 'active' | 'banned') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId);

      if (error) throw error;
      
      await loadUsers();
      toast.success(`Stato utente aggiornato a: ${status}`);
    } catch (error: any) {
      toast.error("Errore nell'aggiornamento dello stato: " + error.message);
    }
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    try {
      const { error } = await supabase
        .from('table_permissions')
        .upsert({
          role,
          user_id: userId,
          table_name: '*'
        })
        .select();

      if (error) throw error;
      toast.success("Ruolo utente aggiornato");
    } catch (error: any) {
      toast.error("Errore nell'aggiornamento del ruolo: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-white mb-6">Gestione Utenti</h1>
      
      <div className="bg-[#1A1F2C] rounded-lg border border-[#2A2F3C]/40 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-400">Email</TableHead>
              <TableHead className="text-gray-400">Nome</TableHead>
              <TableHead className="text-gray-400">Stato</TableHead>
              <TableHead className="text-gray-400">Ruolo</TableHead>
              <TableHead className="text-gray-400">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="text-white">{user.email}</TableCell>
                <TableCell className="text-white">{user.full_name}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'banned' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                    {user.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Select onValueChange={(value: UserRole) => updateUserRole(user.id, value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Seleziona ruolo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="read_write">Lettura/Scrittura</SelectItem>
                      <SelectItem value="read_only">Solo lettura</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {user.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateUserStatus(user.id, 'active')}
                        className="text-green-500 hover:text-green-600"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {user.status !== 'banned' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateUserStatus(user.id, 'banned')}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UsersAdmin;
