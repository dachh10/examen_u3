"use client";

import { useMemo, useState } from "react";
import {
  autenticarUsuario,
  cerrarSesionUsuario,
  configurarPersistencia,
} from "@/firebase/auth";

type AuthUser = {
  email: string;
};

function esCorreoValido(correo: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

export default function LoginExam() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [recordarme, setRecordarme] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [usuario, setUsuario] = useState<AuthUser | null>(null);

  const tituloBoton = useMemo(() => {
    return cargando ? "Entrando..." : "Entrar";
  }, [cargando]);

  async function procesarAcceso(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!correo.trim()) {
      setError("El correo electrónico es obligatorio");
      return;
    }

    if (!contrasena.trim()) {
      setError("La contraseña es obligatoria");
      return;
    }

    if (!esCorreoValido(correo)) {
      setError("El formato del correo electrónico no es válido");
      return;
    }

    setCargando(true);

    try {
      await configurarPersistencia(recordarme);

      const credencial = await autenticarUsuario(correo, contrasena);

      if (credencial.user.email) {
        setUsuario({ email: credencial.user.email });
      }

      setCorreo("");
      setContrasena("");
    } catch (err: any) {
      const codigo = err.code;

      if (codigo === "auth/invalid-credential" || codigo === "auth/wrong-password") {
        setError("La contraseña es incorrecta");
      } else if (codigo === "auth/user-not-found") {
        setError("No existe una cuenta con ese correo");
      } else if (codigo === "auth/invalid-email") {
        setError("El correo electrónico no es válido");
      } else if (codigo === "auth/too-many-requests") {
        setError("Demasiados intentos. Intenta más tarde");
      } else {
        setError("Error al iniciar sesión. Verifica tus datos");
      }
    } finally {
      setCargando(false);
    }
  }

  async function salir() {
    await cerrarSesionUsuario();
    setUsuario(null);
    setCorreo("");
    setContrasena("");
    setRecordarme(false);
    setError("");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <section className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Acceso escolar</h1>
            <p className="text-gray-600 mt-2">Completa la funcionalidad de inicio de sesión.</p>
          </div>

          {!usuario ? (
            <form onSubmit={procesarAcceso} className="space-y-4">
              <div>
                <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  id="correo"
                  type="email"
                  value={correo}
                  onChange={(event) => setCorreo(event.target.value)}
                  placeholder="alumno@correo.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  id="contrasena"
                  type="password"
                  value={contrasena}
                  onChange={(event) => setContrasena(event.target.value)}
                  placeholder="******"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recordarme}
                  onChange={(event) => setRecordarme(event.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                Recordarme
              </label>

              {error ? (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed font-medium"
              >
                {tituloBoton}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                <p className="font-medium">Inicio de sesión correcto</p>
                <h2 className="text-xl font-bold mt-2">Bienvenido, {usuario.email}</h2>
              </div>

              <button
                type="button"
                onClick={salir}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors font-medium"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}