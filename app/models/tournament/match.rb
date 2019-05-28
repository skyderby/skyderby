# == Schema Information
#
# Table name: tournament_matches
#
#  id                    :integer          not null, primary key
#  start_time_in_seconds :decimal(17, 3)
#  tournament_round_id   :integer
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#  match_type            :integer          default("regular"), not null
#

class Tournament::Match < ApplicationRecord
  include Slots

  enum match_type: [:regular, :gold_finals, :bronze_finals]

  belongs_to :round

  delegate :tournament, to: :round

  composed_of :start_time,
              class_name: 'Time',
              mapping: %w[start_time_in_seconds to_f],
              constructor: proc { |t| Time.zone.at(t) if t },
              converter: proc { |t| convert_to_time(t) }

  def self.convert_to_time(time)
    if time.is_a?(Time)
      time
    elsif time.is_a?(String)
      Time.zone.parse(time)
    else
      Time.zone.at(time / 1000.0)
    end
  end
end
