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

RSpec.describe TournamentRound, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
