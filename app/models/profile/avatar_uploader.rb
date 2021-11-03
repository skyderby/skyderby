class Profile::AvatarUploader < Shrine
  plugin :validation_helpers
  plugin :pretty_location
  plugin :default_url

  Attacher.default_url do |derivative: nil, **|
    "/images/#{derivative || 'original'}/missing.png"
  end

  Attacher.derivatives do |original|
    magick = ImageProcessing::MiniMagick.source(original).then { |img| apply_crop(img) }

    {
      thumb: magick.strip.quality(75).resize_to_fill(40, 40).call,
      medium: magick.strip.quality(75).resize_to_fill(150, 150).call,
      large: magick.strip.quality(75).resize_to_limit(500, 500).call
    }
  end

  Attacher.validate do
    validate_max_size 10 * 1024 * 1024
    validate_mime_type %w[image/jpeg image/png image/webp]
  end

  class Attacher
    def apply_crop(magick)
      return magick unless record.cropping?

      magick.crop(
        record.crop_x,
        record.crop_y,
        record.crop_w,
        record.crop_h
      )
    end
  end
end
