import {
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
} from "firebase/auth";
import { auth } from "./client";

export async function configurarPersistencia(recordarme: boolean): Promise<void> {
  const persistencia = recordarme 
    ? browserLocalPersistence 
    : browserSessionPersistence;
  
  await setPersistence(auth, persistencia);
}

export async function autenticarUsuario(
  correo: string,
  contrasena: string,
): Promise<UserCredential> {
  return await signInWithEmailAndPassword(auth, correo, contrasena);
}

export async function cerrarSesionUsuario(): Promise<void> {
  await signOut(auth);
}