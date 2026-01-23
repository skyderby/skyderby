class Profile::AvatarUploader < Shrine
  plugin :validation_helpers
  plugin :pretty_location
  plugin :default_url

  Attacher.default_url do |derivative: nil, **|
    "/images/#{derivative || 'original'}/missing.png"
  end

  Attacher.derivatives do |original|
    vips = ImageProcessing::Vips.source(original).then { |img| apply_crop(img) }

    {
      thumb: vips.resize_to_fill(40, 40).convert('webp').call,
      medium: vips.resize_to_fill(150, 150).convert('webp').call,
      large: vips.resize_to_limit(500, 500).convert('webp').call
    }
  end

  Attacher.validate do
    validate_max_size 10 * 1024 * 1024
    validate_mime_type %w[image/jpeg image/png image/webp]
  end

  class Attacher
    def apply_crop(vips)
      return vips unless record.cropping?

      vips.crop(
        record.crop_x.to_i,
        record.crop_y.to_i,
        record.crop_w.to_i,
        record.crop_h.to_i
      )
    end
  end
end
