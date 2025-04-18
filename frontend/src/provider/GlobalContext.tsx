"use client";
import { IGlobalUser } from "@/interfaces/globalUser";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";


type GlobalContextType = {
  globalUser: IGlobalUser | null;
  setGlobalUser: Dispatch<SetStateAction<IGlobalUser | null>>;
};

// Create context with a default value that matches the type
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// Custom hook for consuming the context
export function useGlobalContext(): GlobalContextType {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
}

type GlobalProviderProps = {
  children: ReactNode;
};

export function GlobalProvider({ children }: GlobalProviderProps) {
  const [globalUser, setGlobalUser] = useState<IGlobalUser | null>(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("globalUser");
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });


  const value: GlobalContextType = {
    globalUser, setGlobalUser
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
}
