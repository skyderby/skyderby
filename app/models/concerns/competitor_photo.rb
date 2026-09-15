module CompetitorPhoto
  extend ActiveSupport::Concern

  included do
    include HasAttachments

    self.ignored_columns += %w[photo_data]

    has_one_attached :photo do |attachable|
      attachable.variant :medium, resize_to_limit: [800, 1000], preprocessed: true
    end

    attachment_url :photo
    validates_attachment :photo, max_size: 5.megabytes, content_types: HasAttachments::IMAGE_CONTENT_TYPES
  end
end
