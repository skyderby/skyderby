require 'spec_helper'

describe OnlineEventsFinder do
  let(:place_comp) { create :online_event, :place_specific }
  let(:last_year_comp) { create :online_event, :last_year }

  it 'find worldwide comps' do
    worldwide_comp = create :online_event, jumps_kind: :skydive, place: nil

    place = create :place

    place_specific_comp = create :online_event, place: place
    last_year_comp = create :online_event, :last_year
    
    track = create :empty_track, wingsuit: create(:wingsuit), pilot: create(:pilot)
    expect(OnlineEventsFinder.new(track).execute).to eq [worldwide_comp]
  end

  it 'find worldwide and place specific' do
    worldwide_comp = create :online_event, place: nil

    place = create :place

    place_specific_comp = create :online_event, place: place
    last_year_comp = create :online_event, :last_year

    track = create(
      :empty_track, 
      wingsuit: create(:wingsuit), 
      pilot: create(:pilot),
      place: place)

    expect(OnlineEventsFinder.new(track).execute).to eq(
      [worldwide_comp, place_specific_comp])
  end

  it "returns blank array if track isn't public" do
    track = create(:empty_track)
    track.private_track!

    worldwide_comp = create :online_event

    expect(OnlineEventsFinder.new(track).execute).not_to include(worldwide_comp)
  end

  it "returns blank array if track from unregistered user" do
    track = create(:empty_track)
    track.pilot = nil

    worldwide_comp = create :online_event

    expect(OnlineEventsFinder.new(track).execute).not_to include(worldwide_comp)
  end

  it "returns blank array if track in custom suit" do
    track = create(:empty_track)
    track.wingsuit = nil

    worldwide_comp = create :online_event

    expect(OnlineEventsFinder.new(track).execute).not_to include(worldwide_comp)
  end
end
