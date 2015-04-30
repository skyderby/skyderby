require 'spec_helper'

describe OnlineEventsFinder do
  let(:worldwide_comp) { create :online_event }
  let(:place_comp) { create :online_event, :place_specific }
  let(:last_year_comp) { create :online_event, :last_year }

  let(:track1) { create :track_without_place }
  let(:track2) { create :track_with_place }

  context 'only worldwide' do
    subject { OnlineEventsFinder.new.execute(track1) } 

    it { is_expected.to include(worldwide_comp) }
    it { is_expected.not_to include(place_comp) }
    it { is_expected.not_to include(last_year_comp) }
  end

  context 'worldwide and place specific' do
    subject { OnlineEventsFinder.new.execute(track2) } 

    it { is_expected.to include(worldwide_comp) }
    it { is_expected.to include(place_comp) }
    it { is_expected.not_to include(last_year_comp) }
  end
end 
