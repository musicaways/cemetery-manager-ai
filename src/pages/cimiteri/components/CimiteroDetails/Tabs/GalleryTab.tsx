
import { Image } from "lucide-react";
import { CimiteroFoto } from "../../../types";

interface GalleryTabProps {
  foto: CimiteroFoto[];
}

export const GalleryTab = ({ foto }: GalleryTabProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        <Image className="w-5 h-5 mr-2" />
        Galleria Foto
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {foto?.map((foto) => (
          <div key={foto.Id} className="relative group aspect-video rounded-lg overflow-hidden">
            <img
              src={foto.Url}
              alt={foto.Descrizione || "Foto cimitero"}
              className="w-full h-full object-cover"
            />
            {foto.Descrizione && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                <p className="text-white text-sm text-center">{foto.Descrizione}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
