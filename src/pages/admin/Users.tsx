
import React from 'react';
import { Layout } from "@/components/Layout";

const Users = () => {
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Gestione Utenti</h1>
        <div className="grid gap-6">
          {/* Contenuto della pagina utenti */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <p className="text-muted-foreground">
              Questa sezione è in fase di sviluppo. Presto sarà disponibile la gestione completa degli utenti.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Users;
