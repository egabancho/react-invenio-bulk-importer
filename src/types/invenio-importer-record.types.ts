export interface InvenioImporterRecord {
  id: string;
  created: string;
  updated: string;
  links: {
    self: string;
    self_html: string;
    edit_html: string;
    metadata: string;
  };
  revision_id: number;
  status: InvenioImporterRecordStates;
  src_data: Record<string, unknown> & { title?: string | null };

  errors: Array<{
    msg: string;
    loc: string;
    type: string;
  }>;
  task: {
    id: string;
  };
  generated_record_id?: string;

  // Missing fields added as optional
  serializer_data?: {
    files?: {
      enabled: boolean;
    };
    access?: {
      files: string;
      record: string;
    };
    metadata?: {
      title: string;
      rights?: Array<{
        id: string;
      }>;
      version?: string;
      creators?: Array<{
        affiliations?: Array<{
          name: string;
        }>;
        person_or_org?: {
          type: string;
          given_name: string;
          family_name: string;
          identifiers?: Array<{
            scheme: string;
            identifier: string;
          }>;
        };
      }>;
      languages?: Array<{
        id: string;
      }>;
      publisher?: string;
      description?: string;
      contributors?: Array<{
        role?: {
          id: string;
        };
        affiliations?: Array<{
          name: string;
        }>;
        person_or_org?: {
          type: string;
          given_name: string;
          family_name: string;
          identifiers?: Array<{
            scheme: string;
            identifier: string;
          }>;
        };
      }>;
      resource_type?: {
        id: string;
      };
      publication_date?: string;
      additional_descriptions?: Array<{
        lang?: {
          id: string;
        };
        type?: {
          id: string;
        };
        description: string;
      }>;
    };
  };

  transformed_data?: {
    files?: {
      enabled: boolean;
    };
    access?: {
      files: string;
      record: string;
    };
    $schema?: string;
    metadata?: {
      title: string;
      rights?: Array<{
        id: string;
      }>;
      version?: string;
      creators?: Array<{
        affiliations?: Array<{
          name: string;
        }>;
        person_or_org?: {
          name: string;
          type: string;
          given_name: string;
          family_name: string;
          identifiers?: Array<{
            scheme: string;
            identifier: string;
          }>;
        };
      }>;
      languages?: Array<{
        id: string;
      }>;
      publisher?: string;
      description?: string;
      contributors?: Array<{
        role?: {
          id: string;
        };
        affiliations?: Array<{
          name: string;
        }>;
        person_or_org?: {
          name: string;
          type: string;
          given_name: string;
          family_name: string;
          identifiers?: Array<{
            scheme: string;
            identifier: string;
          }>;
        };
      }>;
      resource_type?: {
        id: string;
      };
      publication_date?: string;
      additional_descriptions?: Array<{
        lang?: {
          id: string;
        };
        type?: {
          id: string;
        };
        description: string;
      }>;
    };
  };

  community_uuids?: {
    ids: string[];
    default: string;
  };

  record_files?: string[];

  validated_record_files?: Array<{
    key: string;
    size: number;
    origin: string;
    full_path: string;
  }>;

  existing_record_id?: string;
}

export const InvenioImporterRecordStatus = {
  CREATED: 'created',
  VALIDATING: 'validating',
  SERIALIZER_VALIDATION_FAILED: 'serializer validation failed',
  VALIDATION_FAILED: 'validation failed',
  VALIDATED: 'validated',
  IMPORT_FAILED: 'import failed',
  IMPORTED: 'success'
} as const;

export type InvenioImporterRecordStates =
  (typeof InvenioImporterRecordStatus)[keyof typeof InvenioImporterRecordStatus];
