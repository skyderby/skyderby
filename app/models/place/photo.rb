class Place::Photo < ApplicationRecord
  include Place::Namespace

  belongs_to :place, touch: true

  has_attached_file :image,
                    styles: { large: '1000x300#', thumb: '200x120#' },
                    convert_options: { large: '-quality 75 -strip', thumb: '-quality 75 -strip' },
                    default_url: '/images/:style/missing.png'

  validates_attachment_content_type :image, content_type:
    ['image/jpeg', 'image/jpg', 'image/png']
end
