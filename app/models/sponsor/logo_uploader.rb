class Place::Photo::ImageUploader < Shrine
  plugin :pretty_location

  Attacher.derivatives do |original|
    magick = ImageProcessing::MiniMagick.source(original)

    {
      medium: magick.strip.quality(75).resize_to_limit(300, 120).call
    }
  end

  Attacher.validate do
    validate_max_size 2 * 1024 * 1024
    validate_mime_type %w[image/jpeg image/png image/webp]
  end
end
