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
#

class TrackResult < ApplicationRecord
  enum discipline: [:time, :distance, :speed]

  belongs_to :track

  validates :discipline, uniqueness: { scope: :track_id }
  before_save :replace_nan_with_zero

  private

  def replace_nan_with_zero
    return if result.nil?

    self.result = 0 if result.nan? || result.infinite?
  end
end
