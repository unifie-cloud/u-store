export type UnifieFormTypes = 'boolean' | 'string';

export interface iUnifieFormSchemaInput {
  type: UnifieFormTypes;
  label: string;
  name: string;
  params?: any | iUnifieFormSelectParams;
}

export interface iUnifieFormSchema {
  properties: iUnifieFormSchemaInput[];
}

export interface iUnifieFormSelectParams {
  options: { value: string; title?: string }[];
}
