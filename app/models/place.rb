class Place < ActiveRecord::Base
  belongs_to :country

  has_many :tracks, -> { order('created_at DESC') }
  has_many :events

  validates :name, presence: true
  validates :country, presence: true

  class << self
    def search(query)
      joins(:country).where(
        'LOWER(places.name) LIKE :query OR LOWER(countries.name) LIKE :query', 
        query: "%#{query.downcase}%"
      )
    end

    def nearby(point, radius)
      select('id, 
              latitude, 
              longitude, 
              msl,
              SQRT(
                POW(111 * (latitude - ' + point.latitude.to_s + '), 2) + 
                POW(111 * (' + point.longitude.to_s + ' - longitude) * COS(latitude / (180/PI()) ), 2)
              ) AS distance')
      .having('distance < :radius', radius: radius)
      .order('distance DESC')
    end
  end
end
