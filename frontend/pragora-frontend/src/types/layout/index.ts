// types/navigation/index.ts
import * as React from "react";

export interface Category {
  id: string | number;
  name: string;
  subcategories?: Category[];
}

export interface LayoutProps {
  children: React.ReactNode;
  categories?: Category[];
  selectedCategory?: string | number | null;
  onSelectCategory?: (categoryId: string | number) => void;
  onSubcategoryChange?: (subcategoryId: string | number) => void;
}

export interface SidebarProps {
  categories: Category[];
  selectedCategory: string | number | null;
  onSelectCategory: (categoryId: string | number) => void;
  onSubcategoryChange: (subcategoryId: string | number) => void;
}

export interface TopBarProps {
  className?: string;
}

export interface NavBarProps {
  className?: string;
}

export interface FooterProps {
  className?: string;
}
