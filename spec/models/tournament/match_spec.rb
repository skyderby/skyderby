# == Schema Information
#
# Table name: tournament_matches
#
#  id                    :integer          not null, primary key
#  start_time_in_seconds :decimal(17, 3)
#  tournament_round_id   :integer
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#  match_type            :integer          default("regular"), not null
#

describe Tournament::Match do
  it 'build slots on create' do
    tournament = tournaments(:world_base_race)
    tournament.update!(bracket_size: 2)

    round = tournament_rounds(:round_1)
    match = round.matches.create!

    expect(match.slots.count).to eq(2)
  end
end
