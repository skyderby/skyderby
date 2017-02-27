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
#

class VirtualCompetition < ApplicationRecord
  BASE_START_SPEED = 10

  enum jumps_kind: [:skydive, :base]
  enum suits_kind: [:wingsuit, :tracksuit]
  enum discipline:
    [:time, :distance, :speed, :distance_in_time, :distance_in_altitude]

  belongs_to :place, optional: true
  belongs_to :group,
             class_name: 'VirtualCompGroup',
             foreign_key: 'virtual_comp_group_id'

  has_one :best_result, -> { order('result DESC') }, class_name: 'VirtualCompResult'
  has_many :virtual_comp_results
  has_many :personal_top_scores
  has_many :sponsors, -> { order(:created_at) }, as: :sponsorable

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
    if %w(distance_in_time distance_in_altitude).include? discipline
      'distance'
    else
      discipline
    end
  end

  def worldwide?
    !place
  end
end
