class Place::FinishLine < ApplicationRecord
  belongs_to :place
  has_many :virtual_competitions

  validates :name, presence: true
  validates :start_latitude, :end_latitude,
            numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90 }

  validates :start_longitude, :end_longitude,
            numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 }

  def to_coordinates
    [
      { latitude: start_latitude, longitude: start_longitude },
      { latitude: end_latitude,   longitude: end_longitude   }
    ]
  end
end
