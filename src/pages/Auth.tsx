
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/");
      } else if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: email.split("@")[0],
            },
          },
        });
        if (error) throw error;
        toast.success("Registrazione effettuata! In attesa di approvazione.");
        setMode("login");
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        toast.success("Email di reset inviata!");
        setMode("login");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1F2C] p-4">
      <div className="w-full max-w-md space-y-8 bg-[#2A2F3C]/50 p-8 rounded-xl backdrop-blur-xl border border-white/5">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">
            {mode === "login" && "Accedi"}
            {mode === "register" && "Registrati"}
            {mode === "reset" && "Reset Password"}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {mode === "login" && "Accedi per gestire il cimitero"}
            {mode === "register" && "Crea un nuovo account"}
            {mode === "reset" && "Inserisci la tua email"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#333333] border-white/5 text-white placeholder-gray-400"
              required
            />
            {mode !== "reset" && (
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#333333] border-white/5 text-white placeholder-gray-400"
                required
              />
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
            disabled={isLoading}
          >
            {isLoading ? "Caricamento..." : mode === "login" ? "Accedi" : mode === "register" ? "Registrati" : "Invia reset"}
          </Button>
        </form>

        <div className="mt-4 text-center space-y-2">
          {mode === "login" && (
            <>
              <button
                onClick={() => setMode("register")}
                className="text-sm text-[#9b87f5] hover:text-[#7E69AB]"
              >
                Non hai un account? Registrati
              </button>
              <br />
              <button
                onClick={() => setMode("reset")}
                className="text-sm text-[#9b87f5] hover:text-[#7E69AB]"
              >
                Password dimenticata?
              </button>
            </>
          )}
          {(mode === "register" || mode === "reset") && (
            <button
              onClick={() => setMode("login")}
              className="text-sm text-[#9b87f5] hover:text-[#7E69AB]"
            >
              Torna al login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
