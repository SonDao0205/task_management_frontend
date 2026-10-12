"use client";

import { RootStore } from "@/src/stores/root.stores";
import { enableStaticRendering } from "mobx-react-lite";
import { createContext, useContext, useState, type ReactNode } from "react";

enableStaticRendering(typeof window === "undefined");

const StoreContext = createContext<RootStore | null>(null);

export default function MobxProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => new RootStore());

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const store = useContext(StoreContext);

  if (!store) {
    throw new Error("useStore must be used inside MobxProvider");
  }

  return store;
}
