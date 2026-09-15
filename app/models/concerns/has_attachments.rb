module HasAttachments
  extend ActiveSupport::Concern

  IMAGE_CONTENT_TYPES = %w[image/jpeg image/png image/webp].freeze

  included do
    after_create :assign_readable_attachment_keys
    after_update :assign_readable_attachment_keys
  end

  class_methods do
    def attachment_url(name, default: nil)
      define_method(:"#{name}_url") do |variant = nil|
        attachment = public_send(name)
        unless attachment.attached? && attachment.blob.persisted?
          next(default.respond_to?(:call) ? default.call(variant) : default)
        end

        routes = Rails.application.routes.url_helpers
        if variant && attachment.variable?
          routes.rails_representation_path(attachment.variant(variant), only_path: true)
        else
          routes.rails_blob_path(attachment, only_path: true)
        end
      end
    end

    def validates_attachment(name, max_size: nil, content_types: nil, extensions: nil)
      validate { validate_attachment(name, max_size:, content_types:, extensions:) }
    end
  end

  def pending_attachment_io(name)
    attachable = attachment_changes[name.to_s]&.attachable
    io = attachable.is_a?(Hash) ? attachable[:io] : attachable
    return unless io.respond_to?(:read)

    io.rewind if io.respond_to?(:rewind)
    io
  end

  private

  def validate_attachment(name, max_size:, content_types:, extensions:)
    blob = public_send(name).blob
    return if blob.nil?

    if max_size && blob.byte_size > max_size
      errors.add(name, :file_too_large, size: ActiveSupport::NumberHelper.number_to_human_size(max_size))
    end
    errors.add(name, :file_type_invalid) unless allowed_file?(blob, content_types, extensions)
  end

  def allowed_file?(blob, content_types, extensions)
    (content_types.nil? || content_types.include?(blob.content_type)) &&
      (extensions.nil? || extensions.include?(blob.filename.extension.to_s.downcase))
  end

  def assign_readable_attachment_keys
    attachment_changes.each do |name, change|
      next unless change.respond_to?(:blob) && change.blob&.new_record?

      change.blob.key = readable_attachment_key(name, change.blob)
    end
  end

  def readable_attachment_key(name, blob)
    stamp = Time.current.utc.strftime('%Y%m%d%H%M%S%L')
    [model_name.singular, id, name, "#{stamp}-#{blob.filename.sanitized}"].join('/')
  end
end
