require 'test_helper'

class Tournament::Match::SlotTest < ActiveSupport::TestCase
  setup do
    @place = places(:hellesylt_wbr)
    @responsible = users(:event_responsible)
    @finish_line = @place.finish_lines.create!(
      name: 'wbr',
      start_latitude: 62.053858,
      start_longitude: 6.945123,
      end_latitude: 62.056071,
      end_longitude: 6.945568
    )
    @tournament = Tournament.create!(
      name: 'WBR',
      responsible: @responsible,
      place: @place,
      finish_line: @finish_line
    )
    @competitor = @tournament.competitors.create!(
      profile: profiles(:alex),
      suit: suits(:apache)
    )
  end

  test 'competitor intersected finish line' do
    round = @tournament.rounds.create!
    match = round.matches.create!(start_time: '2015-07-02 11:45:38.185')

    match_competitor = match.slots.create!(
      competitor: @competitor,
      track: create_track_from_file('WBR/11-40-01_Ratmir.CSV')
    )

    assert_in_delta 33.543, match_competitor.result, 0.001
  end

  test 'another competitor intersected finish line' do
    round = @tournament.rounds.create!
    match = round.matches.create!(start_time: '2015-07-02 13:46:11.447')

    match_competitor = match.slots.create!(
      competitor: @competitor,
      track: create_track_from_file('WBR/13-35-43_Andreas.CSV')
    )

    assert_in_delta 32.822, match_competitor.result, 0.001
  end

  test 'competitor did not intersect finish line' do
    round = @tournament.rounds.create!
    match = round.matches.create!(start_time: '2015-07-03 11:10:30.450')

    match_competitor = match.slots.create!(
      competitor: @competitor,
      track: create_track_from_file('WBR/11-05-01_Ratmir.CSV')
    )

    assert_equal 0, match_competitor.result
    assert match_competitor.is_disqualified
    assert_equal "Didn't intersected finish line", match_competitor.notes
  end
end
