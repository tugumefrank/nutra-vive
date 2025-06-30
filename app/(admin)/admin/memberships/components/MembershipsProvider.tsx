// app/admin/memberships/components/MembershipsProvider.tsx
"use client";

import { ICategory } from "@/types/product.types";
import React, { createContext, useContext, useState, useCallback } from "react";

interface MembershipsContextType {
  categories: ICategory[];
  selectedMembership: any | null;
  setSelectedMembership: (membership: any | null) => void;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  refreshMemberships: () => void;
  refreshTrigger: number;
}

const MembershipsContext = createContext<MembershipsContextType | undefined>(
  undefined
);

export function useMemberships() {
  const context = useContext(MembershipsContext);
  if (!context) {
    throw new Error("useMemberships must be used within a MembershipsProvider");
  }
  return context;
}

interface MembershipsProviderProps {
  children: React.ReactNode;
  categories: ICategory[];
}

export function MembershipsProvider({
  children,
  categories,
}: MembershipsProviderProps) {
  const [selectedMembership, setSelectedMembership] = useState<any | null>(
    null
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshMemberships = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <MembershipsContext.Provider
      value={{
        categories,
        selectedMembership,
        setSelectedMembership,
        isCreateDialogOpen,
        setIsCreateDialogOpen,
        isEditDialogOpen,
        setIsEditDialogOpen,
        refreshMemberships,
        refreshTrigger,
      }}
    >
      {children}
    </MembershipsContext.Provider>
  );
}
