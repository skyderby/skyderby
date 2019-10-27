class TrackUploader < Shrine
  plugin :keep_files
  plugin :validation_helpers

  Attacher.validate do
    validate_max_size 2 * 1024 * 1024 # 3mb
    validate_extension_inclusion %w[csv gpx tes kml]
  end
end
