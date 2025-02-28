
import React, { useState, useEffect } from 'react';
import { Layout } from "@/components/Layout";
import { TablesList } from '@/components/admin/tables/TablesList';
import { TableDetails } from '@/components/admin/tables/TableDetails';
import { CreateTableDialog } from '@/components/admin/tables/CreateTableDialog';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TableInfo } from "@/types/database";

const Tables = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);
  const [allTables, setAllTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const tableName = params.get('table');

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    if (tableName && allTables.length > 0) {
      const table = allTables.find(t => t.table_name === tableName);
      setSelectedTable(table || null);
    } else {
      setSelectedTable(null);
    }
  }, [tableName, allTables]);

  const loadTables = async () => {
    setLoading(true);
    try {
      const tablesInfoResult = await supabase.rpc('get_tables_info');
      if (tablesInfoResult.error) throw tablesInfoResult.error;
      
      setAllTables(tablesInfoResult.data || []);
    } catch (error: any) {
      console.error("Error loading tables:", error);
      toast.error(`Errore nel caricamento delle tabelle: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTableCreated = (name: string) => {
    setIsCreateDialogOpen(false);
    loadTables();
    navigate(`?table=${name}`);
  };

  const handleTableChange = () => {
    loadTables();
  };

  const handleSelectTable = (name: string) => {
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
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary"></div>
          </div>
        ) : tableName && selectedTable ? (
          <div className="space-y-8">
            <TableDetails 
              table={selectedTable} 
              tables={allTables} 
              onTableDeleted={handleTableChange} 
            />
          </div>
        ) : (
          <TablesList 
            tables={allTables} 
            onTableChange={handleTableChange} 
            onSelectTable={handleSelectTable} 
          />
        )}
        
        <CreateTableDialog 
          open={isCreateDialogOpen} 
          onClose={() => setIsCreateDialogOpen(false)}
          onTableCreated={handleTableCreated}
        />
      </div>
    </Layout>
  );
};

export default Tables;
