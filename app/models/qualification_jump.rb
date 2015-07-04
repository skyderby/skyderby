class QualificationJump < ActiveRecord::Base
  belongs_to :tournament_competitor
  belongs_to :qualification_round
  belongs_to :track
end
