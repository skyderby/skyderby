class Sponsor < ApplicationRecord
  include HasAttachments

  self.ignored_columns += %w[logo_data]

  has_one_attached :logo do |attachable|
    attachable.variant :medium, resize_to_limit: [300, 120], preprocessed: true
  end

  attachment_url :logo
  validates_attachment :logo, max_size: 2.megabytes, content_types: HasAttachments::IMAGE_CONTENT_TYPES

  belongs_to :sponsorable, polymorphic: true, touch: true

  validates :name, :website, :logo, presence: true
end
