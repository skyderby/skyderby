# == Schema Information
#
# Table name: track_results
#
#  id         :integer          not null, primary key
#  track_id   :integer
#  discipline :integer
#  range_from :integer
#  range_to   :integer
#  result     :float
#  variant    :string           not null
#

class Track::Result < ApplicationRecord
  BEST_VARIANT = 'best'.freeze
  COMPETITION_VARIANT = 'competition'.freeze

  enum :discipline, {
    time: 0,
    distance: 1,
    speed: 2,
    flare: 3,
    base_race: 4,
    distance_in_time: 5,
    vertical_speed: 6
  }

  LOWER_IS_BETTER = %w[base_race].freeze

  belongs_to :track

  validates :discipline, uniqueness: { scope: %i[track_id variant] }
  before_save :replace_nan_with_zero

  def self.higher_is_better?(discipline)
    LOWER_IS_BETTER.exclude?(discipline.to_s)
  end

  private

  def replace_nan_with_zero
    return if result.nil?

    self.result = 0 if result.nan? || result.infinite?
  end
end
