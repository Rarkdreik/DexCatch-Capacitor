/**
 * uid: string;
 * email: Correo;
 * password?: Contraseña;
 * photoURL?: Foto de perfil/avatar;
 * displayName?: Nombre a mostrar/apodo/nick;
 */
export interface UserData {
    uid?: string;
    email: string;
    photoURL?: string;
    displayName?: string;
    password?: string;
}
