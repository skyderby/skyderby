# == Schema Information
#
# Table name: qualification_rounds
#
#  id            :integer          not null, primary key
#  tournament_id :integer
#  order         :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

class QualificationRound < ApplicationRecord
  belongs_to :tournament
  has_many :qualification_jumps, dependent: :restrict_with_error

  before_create :set_order

  def set_order
    self.order = max_order_within_event + 1
  end

  def max_order_within_event
    QualificationRound.where(tournament_id: tournament_id).maximum(:order) || 0
  end
end
