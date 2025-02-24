
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
import { Check, Ban, Save } from "lucide-react";

type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  status: 'pending' | 'active' | 'banned';
  created_at: string;
};

type UserRole = 'admin' | 'read_write' | 'read_only';

type UserUpdate = {
  id: string;
  role?: UserRole;
  status?: 'active' | 'banned';
};

export const UsersAdmin = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingUpdates, setPendingUpdates] = useState<UserUpdate[]>([]);

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
    setPendingUpdates(current => {
      const existing = current.find(u => u.id === userId);
      if (existing) {
        return current.map(u => u.id === userId ? { ...u, status } : u);
      }
      return [...current, { id: userId, status }];
    });
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    setPendingUpdates(current => {
      const existing = current.find(u => u.id === userId);
      if (existing) {
        return current.map(u => u.id === userId ? { ...u, role } : u);
      }
      return [...current, { id: userId, role }];
    });
  };

  const saveChanges = async () => {
    try {
      for (const update of pendingUpdates) {
        if (update.status) {
          const { error } = await supabase
            .from('profiles')
            .update({ status: update.status })
            .eq('id', update.id);
          if (error) throw error;
        }

        if (update.role) {
          const { error } = await supabase
            .from('table_permissions')
            .upsert({
              role: update.role,
              user_id: update.id,
              table_name: '*'
            })
            .select();
          if (error) throw error;
        }
      }

      toast.success("Modifiche salvate con successo");
      setPendingUpdates([]);
      await loadUsers();
    } catch (error: any) {
      toast.error("Errore nel salvataggio delle modifiche: " + error.message);
    }
  };

  const hasChanges = pendingUpdates.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Gestione Utenti</h1>
        {hasChanges && (
          <Button
            onClick={saveChanges}
            className="bg-[var(--primary-color)] hover:bg-[var(--primary-hover)]"
          >
            <Save className="w-4 h-4 mr-2" />
            Salva Modifiche
          </Button>
        )}
      </div>
      
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
