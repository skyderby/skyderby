class Place::Photo < ApplicationRecord
  include Place::Namespace
  include HasAttachments

  self.ignored_columns += %w[image_data]

  has_one_attached :image do |attachable|
    attachable.variant :thumb, resize_to_fill: [200, 120], preprocessed: true
    attachable.variant :large, resize_to_fill: [1000, 300], preprocessed: true
  end

  attachment_url :image, default: '/images/place_photo.jpg'
  validates_attachment :image, max_size: 5.megabytes, content_types: HasAttachments::IMAGE_CONTENT_TYPES

  belongs_to :place, touch: true

  def viewable?(_user = Current.user) = true

  def editable?(user = Current.user) = Place.creatable?(user)

  alias deletable? editable?

  def self.creatable?(user = Current.user) = Place.creatable?(user)
end
