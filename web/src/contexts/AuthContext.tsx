import { createContext, ReactNode } from "react";

const AuthContext = createContext({});

export function AuthProvider(props: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={{}}>{props.children}</AuthContext.Provider>
  );
}
