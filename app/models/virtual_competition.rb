# == Schema Information
#
# Table name: virtual_competitions
#
#  id                    :integer          not null, primary key
#  jumps_kind            :integer
#  suits_kind            :integer
#  place_id              :integer
#  period_from           :date
#  period_to             :date
#  discipline            :integer
#  discipline_parameter  :integer          default(0)
#  created_at            :datetime
#  updated_at            :datetime
#  name                  :string(510)
#  virtual_comp_group_id :integer
#  range_from            :integer          default(0)
#  range_to              :integer          default(0)
#  display_highest_speed :boolean
#  display_highest_gr    :boolean
#  display_on_start_page :boolean
#  default_view          :integer          default("default_overall"), not null
#

class VirtualCompetition < ApplicationRecord
  BASE_START_SPEED = 10

  enum jumps_kind: %i[skydive base]
  enum suits_kind: SuitTypes
  enum discipline:
    %i[time distance speed distance_in_time distance_in_altitude flare]
  enum default_view: %i[default_overall default_last_year]

  belongs_to :place, optional: true
  belongs_to :group,
             class_name: 'VirtualCompGroup',
             foreign_key: 'virtual_comp_group_id'

  has_one :best_result, -> { order('result DESC') }, class_name: 'VirtualCompResult'
  has_many :virtual_comp_results
  has_many :personal_top_scores
  has_many :annual_top_scores
  has_many :sponsors, -> { order(:created_at) }, as: :sponsorable

  scope :by_suit_type, ->(type)     { where(suits_kind: VirtualCompetition.suits_kinds[type]).or(where(suits_kind: nil)) }
  scope :by_activity,  ->(activity) { where(jumps_kind: VirtualCompetition.jumps_kinds[activity]).or(where(jumps_kind: nil)) }
  scope :for_date,     ->(date)     { where(':date BETWEEN period_from AND period_to', date: date) }
  scope :for_place,    ->(place)    { place ? by_place(place).or(worldwide) : worldwide }
  scope :by_place,     ->(place)    { where(place: place) }
  scope :worldwide,    ->           { where(place: nil) }

  delegate :name, to: :place, prefix: true, allow_nil: true
  delegate :name, to: :group, prefix: true, allow_nil: true

  def window_params
    case discipline
    when 'distance', 'speed', 'time'
      { from_altitude: range_from, to_altitude: range_to }
    when 'distance_in_time'
      { from_vertical_speed: BASE_START_SPEED, duration: discipline_parameter }
    when 'distance_in_altitude'
      { from_vertical_speed: BASE_START_SPEED, elevation: discipline_parameter }
    end
  end

  def task
    if %w[distance_in_time distance_in_altitude].include? discipline
      'distance'
    else
      discipline
    end
  end

  def worldwide?
    !place
  end

  def years
    (period_from.year..last_year).to_a
  end

  def last_year
    [period_to.year, DateTime.current.year].min
  end
end
