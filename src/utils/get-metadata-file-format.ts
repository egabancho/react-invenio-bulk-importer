interface MetadataFileFormat {
  accept?: string;
  label: string;
}

const METADATA_FILE_FORMATS: Record<string, MetadataFileFormat> = {
  csv: { accept: '.csv', label: 'CSV' },
  onix3: { accept: '.xml', label: 'ONIX 3.0 XML' }
};

/**
 * Returns the metadata file format expected by a serializer.
 * Unknown serializers get no `accept` filter, leaving validation to the backend.
 * @param serializer - The serializer key, as configured in the backend.
 * @return The `accept` value for the file input and a label for help text.
 */
export const getMetadataFileFormat = (
  serializer?: string
): MetadataFileFormat =>
  (serializer && METADATA_FILE_FORMATS[serializer]) || { label: 'metadata' };
