class Place::Photo::ImageUploader < Shrine
  plugin :validation_helpers
  plugin :pretty_location, namespace: '_'
  plugin :default_url

  Attacher.default_url { '/images/place_photo.jpg' }

  Attacher.derivatives do |original|
    magick = ImageProcessing::MiniMagick.source(original)

    {
      thumb: magick.strip.quality(75).resize_to_fill(200, 120).call,
      large: magick.strip.quality(75).resize_to_fill(1000, 300).call
    }
  end

  Attacher.validate do
    validate_max_size 5 * 1024 * 1024
    validate_mime_type %w[image/jpeg image/png image/webp]
  end
end
