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
  enum kind: %i[skydive base]

  belongs_to :country

  has_many :tracks, -> { order('created_at DESC') }, inverse_of: :place
  has_many :pilots, -> { distinct }, through: :tracks
  has_many :events, dependent: :restrict_with_error
  has_many :weather_data, as: :weather_datumable, dependent: :delete_all
  has_many :lines, class_name: 'PlaceLine', inverse_of: :place, dependent: :destroy

  accepts_nested_attributes_for :lines,
                                allow_destroy: true,
                                reject_if: ->(attrs) { attrs['name'].blank? }

  scope :with_measurements, -> { where(id: ExitMeasurement.distinct.pluck(:place_id)) }

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
      return all if query.blank?

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
