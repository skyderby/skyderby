# == Schema Information
#
# Table name: places
#
#  id         :integer          not null, primary key
#  name       :string(510)
#  latitude   :decimal(15, 10)
#  longitude  :decimal(15, 10)
#  country_id :integer
#  msl        :decimal(5, 1)
#  kind       :integer          default("skydive"), not null
#

class Place < ApplicationRecord
  include Photos, Stats, WeatherData

  enum kind: { skydive: 0, base: 1 }

  belongs_to :country

  has_many :tracks, dependent: :restrict_with_error
  has_many :pilots, -> { distinct }, through: :tracks
  has_many :events, dependent: :restrict_with_error
  has_many :jump_lines, dependent: :destroy
  has_many :finish_lines, dependent: :destroy

  accepts_nested_attributes_for :jump_lines,
                                allow_destroy: true,
                                reject_if: ->(attrs) { attrs['name'].blank? }

  validates :name, :latitude, :longitude, presence: true

  delegate :name, :code, to: :country, prefix: true, allow_nil: true

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
      return all if query.blank?

      joins(:country).where(
        'LOWER(places.name) LIKE :query OR LOWER(countries.name) LIKE :query',
        query: "%#{query.downcase}%"
      )
    end

    def nearby(point, radius)
      distance_statement =
        Arel.sql("SQRT(
          POW(111 * (latitude - #{point[:latitude]}), 2) +
          POW(111 * (#{point[:longitude]} - longitude) * COS(latitude / (180/PI()) ), 2)
        )")

      where("#{distance_statement} < :radius", radius: radius).order(distance_statement)
    end

    def to_subregion
      select(
        'floor(min(latitude)) - 0.25 bottom_lat',
        'ceil(max(latitude)) + 0.25 top_lat',
        'floor(min(longitude)) - 0.25 left_lon',
        'ceil(max(longitude)) + 0.25 right_lon'
      ).take.attributes.except('id')
    end
  end
end
