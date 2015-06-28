# == Schema Information
#
# Table name: track_results
#
#  id         :integer          not null, primary key
#  track_id   :integer
#  discipline :integer
#  range_from :integer
#  range_to   :integer
#  result     :float(24)
#

class TrackResult < ActiveRecord::Base
  enum discipline: [:time, :distance, :speed]

  belongs_to :track
end
