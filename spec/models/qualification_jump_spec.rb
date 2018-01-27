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
#  start_time_in_seconds    :decimal(17, 3)
#  canopy_time              :decimal(, )
#

RSpec.describe QualificationJump, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
