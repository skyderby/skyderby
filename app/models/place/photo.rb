class Place::Photo < ApplicationRecord
  include ImageUploader::Attachment(:image)
  after_validation { image_derivatives! if image_changed? }

  belongs_to :place, touch: true
end
