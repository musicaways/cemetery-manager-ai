
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

interface CemeteryCardProps {
  cemetery: {
    Id: number;
    Codice: string;
    Descrizione: string;
    image?: string;
  };
}

export const CemeteryCard = ({ cemetery }: CemeteryCardProps) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <Card className="bg-gray-800/50 border-gray-700 hover:border-blue-500/50 backdrop-blur-sm transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-100">{cemetery.Descrizione}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">Codice: {cemetery.Codice}</p>
          {cemetery.image && (
            <div className="mt-4 relative overflow-hidden rounded-lg">
              <img 
                src={cemetery.image} 
                alt={cemetery.Descrizione}
                className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={() => setShowDetails(true)}
            className="w-full bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 border-gray-600"
          >
            Vedi Dettagli
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-gray-800 text-gray-100 border-gray-700 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{cemetery.Descrizione}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Informazioni Generali</h3>
                  <div className="space-y-2 text-gray-300">
                    <p>Codice: {cemetery.Codice}</p>
                    <p>ID: {cemetery.Id}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Statistiche</h3>
                  <div className="space-y-2 text-gray-300">
                    <p>Settori: {/* Aggiungere numero settori */}</p>
                    <p>Blocchi: {/* Aggiungere numero blocchi */}</p>
                    <p>Loculi totali: {/* Aggiungere numero loculi */}</p>
                  </div>
                </div>
              </div>
              {cemetery.image && (
                <div className="relative rounded-lg overflow-hidden">
                  <img 
                    src={cemetery.image} 
                    alt={cemetery.Descrizione}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
