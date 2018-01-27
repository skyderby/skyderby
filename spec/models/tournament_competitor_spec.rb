# == Schema Information
#
# Table name: tournament_competitors
#
#  id                      :integer          not null, primary key
#  tournament_id           :integer
#  profile_id              :integer
#  wingsuit_id             :integer
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  is_disqualified         :boolean
#  disqualification_reason :string
#

RSpec.describe TournamentCompetitor, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
