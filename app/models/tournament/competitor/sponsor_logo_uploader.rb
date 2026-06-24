class Tournament::Competitor::SponsorLogoUploader < Shrine
  plugin :validation_helpers
  plugin :pretty_location

  Attacher.derivatives do |original|
    vips = ImageProcessing::Vips.source(original)

    {
      medium: vips.resize_to_limit(400, 200).call
    }
  end

  Attacher.validate do
    validate_max_size 2 * 1024 * 1024
    validate_mime_type %w[image/jpeg image/png image/webp image/svg+xml]
  end
end
