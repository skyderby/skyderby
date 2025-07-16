class GpsRecordingsArchive::ArchiveUploader < Shrine
  plugin :validation_helpers
  plugin :add_metadata
  plugin :pretty_location, namespace: '_'

  Attacher.validate do
    validate_extension_inclusion %w[zip]
  end

  def basic_location(_io, metadata:)
    metadata['filename'].to_s
  end
end
