export type UnifieFormTypes = 'boolean' | 'string';

interface iUnifieFormSchemaInput {
  type: UnifieFormTypes;
  label: string;
  name: string;
}

export interface iUnifieFormSchema {
  properties: iUnifieFormSchemaInput[];
}
