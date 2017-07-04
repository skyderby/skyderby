# == Schema Information
#
# Table name: tournament_rounds
#
#  id            :integer          not null, primary key
#  order         :integer
#  tournament_id :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

class TournamentRound < ApplicationRecord
  belongs_to :tournament
  has_many :matches, class_name: 'TournamentMatch'

  before_create :set_order

  def set_order
    self.order = max_order_within_event + 1
  end

  def max_order_within_event
    TournamentRound.where(tournament_id: tournament_id).maximum(:order) || 0
  end
end
