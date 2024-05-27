require 'test_helper'

class VirtualCompetition::SuitableFinderTest < ActiveSupport::TestCase
  setup do
    @place_comp = create :online_event, :place_specific
    @last_year_comp = create :online_event, :last_year
  end

  test 'find worldwide comps' do
    worldwide_comp = create :online_event, jumps_kind: :skydive, place: nil

    place = create :place

    create :online_event, place: place
    create :online_event, :last_year

    track = create :empty_track, suit: create(:suit), pilot: create(:pilot)

    found_competitions = VirtualCompetition.suitable_for(track)

    assert_includes found_competitions, worldwide_comp
    assert_not_includes found_competitions, @place_comp
    assert_not_includes found_competitions, @last_year_comp
  end

  test 'find worldwide and place specific' do
    worldwide_comp = create :online_event, place: nil

    place = create :place

    place_specific_comp = create :online_event, place: place
    create :online_event, :last_year

    track = create(:empty_track,
                   suit: create(:suit),
                   pilot: create(:pilot),
                   place: place)

    found_competitions = VirtualCompetition.suitable_for(track)

    assert_includes found_competitions, worldwide_comp
    assert_includes found_competitions, place_specific_comp
    assert_not_includes found_competitions, @last_year_comp
  end

  test "returns blank array if track isn't public" do
    track = create(:empty_track)
    track.private_track!

    worldwide_comp = create :online_event

    assert_not_includes VirtualCompetition.suitable_for(track), worldwide_comp
  end

  test 'returns blank array if track from unregistered user' do
    track = create(:empty_track)
    track.pilot = nil

    worldwide_comp = create :online_event

    assert_not_includes VirtualCompetition.suitable_for(track), worldwide_comp
  end

  test 'returns blank array if track in custom suit' do
    track = create(:empty_track)
    track.suit = nil

    worldwide_comp = create :online_event

    assert_not_includes VirtualCompetition.suitable_for(track), worldwide_comp
  end

  test 'returns blank array if track is disqualified' do
    track = create(:empty_track)
    track.disqualified_from_online_competitions = true

    worldwide_comp = create :online_event

    assert_not_includes VirtualCompetition.suitable_for(track), worldwide_comp
  end

  test 'returns array of competitions without specific jumps and suits kind' do
    track = create(:empty_track)

    worldwide_comp = create :online_event, jumps_kind: nil, suits_kind: nil

    assert_includes VirtualCompetition.suitable_for(track), worldwide_comp
  end
end
