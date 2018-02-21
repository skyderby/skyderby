require 'spec_helper'

describe OnlineEventsFinder do
  let(:place_comp) { create :online_event, :place_specific }
  let(:last_year_comp) { create :online_event, :last_year }

  it 'find worldwide comps' do
    worldwide_comp = create :online_event, jumps_kind: :skydive, place: nil

    place = create :place

    place_specific_comp = create :online_event, place: place
    last_year_comp = create :online_event, :last_year

    track = create :empty_track, suit: create(:suit), pilot: create(:pilot)
    expect(OnlineEventsFinder.call(track)).to eq [worldwide_comp]
  end

  it 'find worldwide and place specific' do
    worldwide_comp = create :online_event, place: nil

    place = create :place

    place_specific_comp = create :online_event, place: place
    last_year_comp = create :online_event, :last_year

    track = create(:empty_track,
                   suit: create(:suit),
                   pilot: create(:pilot),
                   place: place)

    expect(OnlineEventsFinder.call(track)).to match_array(
      [worldwide_comp, place_specific_comp]
    )
  end

  it "returns blank array if track isn't public" do
    track = create(:empty_track)
    track.private_track!

    worldwide_comp = create :online_event

    expect(OnlineEventsFinder.call(track)).not_to include(worldwide_comp)
  end

  it 'returns blank array if track from unregistered user' do
    track = create(:empty_track)
    track.pilot = nil

    worldwide_comp = create :online_event

    expect(OnlineEventsFinder.call(track)).not_to include(worldwide_comp)
  end

  it 'returns blank array if track in custom suit' do
    track = create(:empty_track)
    track.suit = nil

    worldwide_comp = create :online_event

    expect(OnlineEventsFinder.call(track)).not_to include(worldwide_comp)
  end

  it 'returns blank array if track is disqualified' do
    track = create(:empty_track)
    track.disqualified_from_online_competitions = true

    worldwide_comp = create :online_event

    expect(OnlineEventsFinder.call(track)).not_to include(worldwide_comp)
  end

  it 'returns array of competitions without specific jumps and suits kind' do
    track = create(:empty_track)

    worldwide_comp = create :online_event, jumps_kind: nil, suits_kind: nil

    expect(OnlineEventsFinder.call(track)).to include(worldwide_comp)
  end
end
