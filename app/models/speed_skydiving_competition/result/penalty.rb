class SpeedSkydivingCompetition::Result::Penalty < ApplicationRecord
  belongs_to :result

  def factor = 1 - (percent.to_f / 100)
end
