
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
  onClick?: () => void;
}

export const CemeteryCard = ({ cemetery }: CemeteryCardProps) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <Card className="cursor-pointer hover:border-blue-500 transition-colors">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{cemetery.Descrizione}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Codice: {cemetery.Codice}</p>
          {cemetery.image && (
            <img 
              src={cemetery.image} 
              alt={cemetery.Descrizione}
              className="w-full h-48 object-cover rounded-md mt-2"
            />
          )}
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={() => setShowDetails(true)}
          >
            Vedi Dettagli
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{cemetery.Descrizione}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Informazioni Generali</h3>
                <p>Codice: {cemetery.Codice}</p>
                <p>ID: {cemetery.Id}</p>
              </div>
              {cemetery.image && (
                <img 
                  src={cemetery.image} 
                  alt={cemetery.Descrizione}
                  className="w-full h-48 object-cover rounded-md"
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
