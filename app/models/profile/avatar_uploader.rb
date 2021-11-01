class Profile::AvatarUploader < Shrine
  plugin :pretty_location
  plugin :default_url

  Attacher.default_url do |derivative: nil, **|
    "/images/#{derivative}/missing.png" if derivative
  end

  Attacher.derivatives do |original|
    magick =
      ImageProcessing::MiniMagick
      .source(original)
      .then { |img| cropping? ? img.crop(crop_x, crop_y, crop_w, crop_h) : img }

    {
      thumb: magick.strip.quality(75).resize_to_fill(32, 32).call,
      medium: magick.strip.quality(75).resize_to_fill(150, 150).call,
      large: magick.strip.quality(75).resize_to_limit(500, 500).call
    }
  end

  Attacher.validate do
    validate_max_size 2 * 1024 * 1024
    validate_mime_type %w[image/jpeg image/png image/webp]
  end

  def cropping?
    %w[crop_x crop_y crop_h crop_w].all? { |attr| public_send(attr).present? }
  end
end
