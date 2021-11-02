class Place::Photo < ApplicationRecord
  include Place::Namespace
  include ImageUploader::Attachment(:image)
  after_validation { image_derivatives! if image_changed? }

  belongs_to :place, touch: true
end
