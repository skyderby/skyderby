class TrackUploader < Shrine
  plugin :keep_files
  plugin :validation_helpers
  plugin :add_metadata
  plugin :pretty_location

  add_metadata :md5 do |io|
    calculate_signature(io, :md5)
  end

  Attacher.validate do
    validate_max_size 2 * 1024 * 1024
    validate_extension_inclusion %w[csv gpx tes kml]
  end

  def basic_location(_id, metadata:)
    metadata['filename'].to_s
  end
end
