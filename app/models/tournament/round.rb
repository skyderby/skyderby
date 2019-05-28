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

class Tournament::Round < ApplicationRecord
  belongs_to :tournament
  has_many :matches, -> { order(:created_at) }, dependent: :restrict_with_error, inverse_of: :round

  before_create :set_order

  def set_order
    self.order = max_order_within_event + 1
  end

  def max_order_within_event
    tournament.rounds.maximum(:order) || 0
  end
end
