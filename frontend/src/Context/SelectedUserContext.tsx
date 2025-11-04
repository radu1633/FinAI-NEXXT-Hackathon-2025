import { createContext, useContext, useState, ReactNode } from "react";
import { Client } from "../service/clientsService";

type SelectedUserContextType = {
  selectedUser: Client | null;
  setSelectedUser: (user: Client) => void;
};

const SelectedUserContext = createContext<SelectedUserContextType | null>(null);

export function SelectedUserProvider({ children }: { children: ReactNode }) {
  const [selectedUser, setSelectedUser] = useState<Client | null>(null);
  return (
    <SelectedUserContext.Provider value={{ selectedUser, setSelectedUser }}>
      {children}
    </SelectedUserContext.Provider>
  );
}

export function useSelectedUser() {
  const ctx = useContext(SelectedUserContext);
  if (!ctx)
    throw new Error("useSelectedUser must be used within SelectedUserProvider");
  return ctx;
}
