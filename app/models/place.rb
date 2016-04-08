# == Schema Information
#
# Table name: places
#
#  id          :integer          not null, primary key
#  name        :string(255)
#  latitude    :decimal(15, 10)
#  longitude   :decimal(15, 10)
#  information :text(65535)
#  country_id  :integer
#  msl         :integer
#

class Place < ActiveRecord::Base
  belongs_to :country

  has_many :tracks, -> { order('created_at DESC') }
  has_many :pilots, -> { distinct }, through: :tracks
  has_many :events

  validates :name, presence: true
  validates :country, presence: true
  validates :latitude, presence: true
  validates :longitude, presence: true
  # validates :msl, presence: true

  def pilots_accessible_by(user)
    UserProfile.where(
      id: Track.accessible_by(user)
               .where(place_id: id)
               .select(:user_profile_id)
               .distinct
    )
  end

  class << self
    def search(query)
      joins(:country).where(
        'LOWER(places.name) LIKE :query OR LOWER(countries.name) LIKE :query',
        query: "%#{query.downcase}%"
      )
    end

    def nearby(point, radius)
      distance_statement = 
        "SQRT(
          POW(111 * (latitude - #{point.latitude.to_s}), 2) +
          POW(111 * (#{point.longitude.to_s} - longitude) * COS(latitude / (180/PI()) ), 2)
        )"

      select("id,
              latitude,
              longitude,
              msl,
              #{distance_statement} AS distance")
        .where("#{distance_statement} < :radius", radius: radius)
        .order('distance')
    end
  end
end
