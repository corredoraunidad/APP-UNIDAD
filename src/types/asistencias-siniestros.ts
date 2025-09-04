export interface ContactInfo {
  number: string;
  instructions: string;
  description?: string;
}

export interface Company {
  id: string;
  name: string;
  type: 'asistencias' | 'siniestros' | 'ambos';
  callCenter: ContactInfo[];
  assistance: ContactInfo[];
  autoReplacement: ContactInfo[];
  website: string[];
  websiteAttachments?: string[]; // Array de IDs de archivos
  contacts: CompanyContact[];
  sectionComments?: CompanySectionComments;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyContact {
  id: string;
  companyId: string;
  name: string;
  position?: string;
  phone?: string;
  email?: string;
  isPrimary: boolean;
  comments?: string;
  createdAt: string;
}

export interface CompanySectionComments {
  callCenter?: string;
  assistance?: string;
  autoReplacement?: string;
  website?: string;
}

export interface CreateCompanyRequest {
  name: string;
  type: 'asistencias' | 'siniestros' | 'ambos';
  callCenter: ContactInfo[];
  assistance: ContactInfo[];
  autoReplacement: ContactInfo[];
  website: string[];
  contacts: Omit<CompanyContact, 'id' | 'companyId' | 'createdAt'>[];
  sectionComments?: {
    callCenter?: string;
    assistance?: string;
    autoReplacement?: string;
    website?: string;
  };
}

export interface UpdateCompanyRequest {
  name?: string;
  type?: 'asistencias' | 'siniestros' | 'ambos';
  callCenter?: ContactInfo[];
  assistance?: ContactInfo[];
  autoReplacement?: ContactInfo[];
  website?: string[];
  contacts?: CompanyContact[];
  sectionComments?: {
    callCenter?: string;
    assistance?: string;
    autoReplacement?: string;
    website?: string;
  };
}

export interface CompanyListResponse {
  companies: Company[];
  error?: string;
}

export interface CompanyResponse {
  company: Company;
  error?: string;
}
