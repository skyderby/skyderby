module ReadableVariantKeys
  extend ActiveSupport::Concern

  included do
    after_create :assign_readable_image_key
    after_update :assign_readable_image_key
  end

  private

  def assign_readable_image_key
    change = attachment_changes['image']
    return unless change.respond_to?(:blob) && change.blob&.new_record?

    original = blob.key.delete_suffix(File.extname(blob.key))
    digest = Base64.decode64(variation_digest).unpack1('H*')
    change.blob.key = "#{original}.variants/#{digest}#{change.blob.filename.extension_with_delimiter}"
  end
end
