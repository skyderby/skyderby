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
#  group_id              :integer
#  range_from            :integer          default(0)
#  range_to              :integer          default(0)
#  display_highest_speed :boolean
#  display_highest_gr    :boolean
#  display_on_start_page :boolean
#  default_view          :integer          default("default_overall"), not null
#

class VirtualCompetition < ApplicationRecord
  include Intervals, Results, SuitableFinder

  enum jumps_kind: { skydive: 0, base: 1, speed_skydiving: 2, swoop: 3 }
  enum suits_kind: SuitTypes
  enum discipline: {
    time: 0,
    distance: 1,
    speed: 2,
    distance_in_time: 3,
    distance_in_altitude: 4,
    flare: 5,
    base_race: 6
  }
  enum default_view: { default_overall: 0, default_last_year: 1 }

  belongs_to :place, optional: true
  belongs_to :finish_line, optional: true, class_name: 'Place::FinishLine'
  belongs_to :group

  has_many :sponsors, -> { order(:created_at) }, as: :sponsorable, inverse_of: :sponsorable, dependent: :delete_all

  delegate :name, to: :place, prefix: true, allow_nil: true
  delegate :name, to: :finish_line, prefix: true, allow_nil: true
  delegate :name, to: :group, prefix: true, allow_nil: true

  def task
    if %w[distance_in_time distance_in_altitude].include? discipline
      'distance'
    elsif discipline == 'base_race'
      'time'
    else
      discipline
    end
  end

  def worldwide?
    !place
  end
end
