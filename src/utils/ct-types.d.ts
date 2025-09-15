// ChurchTools API Types
export interface Person {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface Tag {
  id: number;
  name: string;
  color?: string;
  count?: number;
}

export interface CustomModuleCreate {
  name: string;
  shortname: string;
  description?: string;
  version: string;
  author?: string;
  permissions?: string[];
}

export interface CustomModuleDataCategoryCreate {
  name: string;
  description?: string;
}

export interface CustomModuleDataValueCreate {
  name: string;
  value: string;
  description?: string;
}