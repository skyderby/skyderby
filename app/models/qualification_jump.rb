# == Schema Information
#
# Table name: qualification_jumps
#
#  id                       :integer          not null, primary key
#  qualification_round_id   :integer
#  tournament_competitor_id :integer
#  result                   :decimal(10, 3)
#  track_id                 :integer
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#

class QualificationJump < ActiveRecord::Base
  belongs_to :tournament_competitor
  belongs_to :qualification_round
  belongs_to :track
end
