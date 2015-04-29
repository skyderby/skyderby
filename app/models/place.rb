class Place < ActiveRecord::Base
  belongs_to :country
  has_many :tracks, -> { order('created_at DESC') }
  has_many :events

  validates :country, presence: true

  scope :nearby, -> (point, search_radius) {
    select('id, 
            latitude, 
            longitude, 
            msl,
            SQRT(
              POW(111 * (latitude - ' + point.latitude.to_s + '), 2) + 
              POW(111 * (' + point.longitude.to_s + ' - longitude) * COS(latitude / (180/PI()) ), 2)
            ) AS distance')
    .having('distance < ?', search_radius)
    .order('distance DESC')
  }
end
