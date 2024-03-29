class Track::File::TrackUploader < Shrine
  plugin :validation_helpers
  plugin :add_metadata
  plugin :pretty_location, namespace: '_'

  add_metadata :md5 do |io|
    calculate_signature(io, :md5)
  end

  Attacher.validate do
    validate_max_size 3 * 1024 * 1024
    validate_extension_inclusion %w[csv gpx tes kml]
  end

  def basic_location(_io, metadata:)
    metadata['filename'].to_s
  end
end
