export interface PSGCItem {
  code: string;
  name: string;
  level: string;
  parentCode?: string;
}

export interface PSGCResponse {
  data: PSGCItem[];
  total: number;
}
