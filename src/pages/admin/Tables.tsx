
import React from 'react';
import { Layout } from "@/components/Layout";
import { TablesList } from '@/components/admin/tables/TablesList';
import { TableDetails } from '@/components/admin/tables/TableDetails';
import { CreateTableDialog } from '@/components/admin/tables/CreateTableDialog';
import { Breadcrumb } from '@/components/admin/tables/Breadcrumb';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';

const Tables = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const tableName = params.get('table');

  const handleTableCreated = (name: string) => {
    setIsCreateDialogOpen(false);
    navigate(`?table=${name}`);
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <nav className="flex items-center space-x-1 text-sm text-gray-400 mb-6">
          <a href="/admin" className="text-gray-300 hover:text-white">Admin</a>
          <span className="mx-2">/</span>
          <span className="text-gray-300">Tables</span>
          {tableName && (
            <>
              <span className="mx-2">/</span>
              <span className="text-gray-300">{tableName}</span>
            </>
          )}
        </nav>
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {tableName ? `Tabella: ${tableName}` : 'Tabelle Database'}
          </h1>
          
          {!tableName && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuova Tabella
            </Button>
          )}
        </div>
        
        {tableName ? (
          <div className="space-y-8">
            <TableDetails />
          </div>
        ) : (
          <TablesList />
        )}
        
        <CreateTableDialog 
          open={isCreateDialogOpen} 
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={handleTableCreated}
        />
      </div>
    </Layout>
  );
};

export default Tables;
