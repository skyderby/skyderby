class Place < ActiveRecord::Base
  belongs_to :country
  has_many :tracks

  scope :nearby, -> (lat, lon, distance) {
    select('id, 
            latitude, 
            longitude, 
            msl,
            SQRT(
              POW(111 * (latitude - ' + lat.to_s + '), 2) + 
              POW(111 * (' + lon.to_s + ' - longitude) * COS(latitude / (180/PI()) ), 2)
            ) AS distance')
    .having('distance < ?', distance)
    .order('distance DESC')
  }

end
