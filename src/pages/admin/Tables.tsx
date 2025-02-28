
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

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <Breadcrumb tableName={tableName} />
        
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
          <TableDetails tableName={tableName} />
        ) : (
          <TablesList onSelectTable={(name) => navigate(`?table=${name}`)} />
        )}
        
        <CreateTableDialog 
          open={isCreateDialogOpen} 
          onOpenChange={setIsCreateDialogOpen}
          onTableCreated={(name) => {
            setIsCreateDialogOpen(false);
            navigate(`?table=${name}`);
          }}
        />
      </div>
    </Layout>
  );
};

export default Tables;
