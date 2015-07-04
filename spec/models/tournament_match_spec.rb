# == Schema Information
#
# Table name: tournament_matches
#
#  id                    :integer          not null, primary key
#  start_time_in_seconds :decimal(17, 3)
#  tournament_round_id   :integer
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#

require 'rails_helper'

RSpec.describe TournamentMatch, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
