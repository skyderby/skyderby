# == Schema Information
#
# Table name: wingsuits
#
#  id                 :integer          not null, primary key
#  manufacturer_id    :integer
#  name               :string(255)
#  kind               :integer          default(0)
#  photo_file_name    :string(255)
#  photo_content_type :string(255)
#  photo_file_size    :integer
#  photo_updated_at   :datetime
#  description        :text(65535)
#

class Wingsuit < ActiveRecord::Base
  attr_accessor :photo

  enum kind: [:wingsuit, :tracksuit]

  belongs_to :manufacturer

  has_many :tracks
  has_many :competitors
  has_many :pilots, through: :tracks

  validates :name, presence: true
  validates :manufacturer, presence: true

  has_attached_file :photo,
                    styles: { medium: '250x250#',
                              thumb: '32x32#' },
                    default_url: '/images/:style/missing.png'

  validates_attachment_content_type :photo, content_type:
    ['image/jpeg', 'image/jpg', 'image/png']

  class << self
    def search(query)
      joins(:manufacturer).where(
        'LOWER(wingsuits.name) LIKE :query
         OR LOWER(manufacturers.name) LIKE :query',
        query: "%#{query.downcase}%"
      )
    end
  end
end
