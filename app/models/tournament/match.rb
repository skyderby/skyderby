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

  enum :match_type, { regular: 0, gold_finals: 1, bronze_finals: 2 }

  belongs_to :round

  before_create :set_position

  delegate :tournament, to: :round

  composed_of :start_time,
              class_name: 'Time',
              mapping: %w[start_time_in_seconds to_f],
              constructor: proc { |t| Time.zone.at(t) if t },
              converter: proc { |t| convert_to_time(t) }

  def final? = gold_finals? || bronze_finals?

  def move(direction)
    siblings = round.matches.to_a
    index = siblings.index(self)
    neighbor = direction == 'up' ? siblings[index - 1] : siblings[index + 1]
    return if neighbor.nil? || (direction == 'up' && index.zero?)

    self.class.transaction do
      own_position = position
      update!(position: neighbor.position)
      neighbor.update!(position: own_position)
    end
  end

  def self.convert_to_time(time)
    case time
    when Time
      time
    when String
      Time.zone.parse(time)
    else
      Time.zone.at(time / 1000.0)
    end
  end

  private

  def set_position
    self.position ||= (round.matches.maximum(:position) || 0) + 1
  end
end
