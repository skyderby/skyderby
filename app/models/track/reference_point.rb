class Track::ReferencePoint < ApplicationRecord
  belongs_to :track

  validates :latitude, presence: true
  validates :longitude, presence: true
end
