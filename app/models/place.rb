# == Schema Information
#
# Table name: places
#
#  id          :integer          not null, primary key
#  name        :string(510)
#  latitude    :decimal(15, 10)
#  longitude   :decimal(15, 10)
#  information :text
#  country_id  :integer
#  msl         :decimal(5, 1)
#

class Place < ApplicationRecord
  belongs_to :country

  has_many :tracks, -> { order('created_at DESC') }
  has_many :pilots, -> { distinct }, through: :tracks
  has_many :events
  has_many :weather_data, as: :weather_datumable

  validates :name, presence: true
  validates :country, presence: true
  validates :latitude, presence: true
  validates :longitude, presence: true

  delegate :name, to: :country, prefix: true, allow_nil: true
  delegate :code, to: :country, prefix: true, allow_nil: true

  def pilots_accessible_by(user)
    Profile.where(
      id: Track.accessible_by(user)
               .where(place_id: id)
               .select(:profile_id)
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
          POW(111 * (latitude - #{point[:latitude]}), 2) +
          POW(111 * (#{point[:longitude]} - longitude) * COS(latitude / (180/PI()) ), 2)
        )"

      select(:id,
             :name,
             :latitude,
             :longitude,
             :msl,
             "#{distance_statement} AS distance")
        .where("#{distance_statement} < :radius", radius: radius)
        .order('distance')
    end
  end
end
