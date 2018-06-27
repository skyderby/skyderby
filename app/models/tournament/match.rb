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
  enum match_type: [:regular, :gold_finals, :bronze_finals]

  belongs_to :round
  has_many :slots, dependent: :destroy

  delegate :tournament, to: :round

  composed_of :start_time,
              class_name: 'Time',
              mapping: %w(start_time_in_seconds to_f),
              constructor: proc { |t| Time.zone.at(t) if t },
              converter: proc { |t| convert_to_time(t) }

  def free_slots
    tournament.bracket_size - slots.count
  end

  def self.convert_to_time(t)
    if t.is_a?(Time)
      t
    elsif t.is_a?(String)
      Time.zone.parse(t)
    else
      Time.zone.at(t / 1000.0)
    end
  end
end
