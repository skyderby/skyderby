class Place::Photo < ApplicationRecord
  include Place::Namespace
  include ImageUploader::Attachment(:image)

  after_validation { image_derivatives! if image_changed? }

  belongs_to :place, touch: true

  def viewable?(_user = Current.user) = true

  def editable?(user = Current.user) = Place.creatable?(user)

  alias deletable? editable?

  def self.creatable?(user = Current.user) = Place.creatable?(user)
end
