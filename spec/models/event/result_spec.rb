# == Schema Information
#
# Table name: event_tracks
#
#  id                      :integer          not null, primary key
#  round_id                :integer
#  track_id                :integer
#  created_at              :datetime
#  updated_at              :datetime
#  competitor_id           :integer
#  result                  :decimal(10, 2)
#  profile_id              :integer
#  result_net              :decimal(10, 2)
#  is_disqualified         :boolean          default(FALSE)
#  disqualification_reason :string
#

require 'support/event_ongoing_validation'

describe Event::Result do
  describe '#need_review?' do
    it 'true if result is 0' do
      result = event_results(:distance_competitor_1)
      result.update_columns(result: 0)

      expect(result.need_review?).to be_truthy
    end

    it 'true if detected jump range outside competition window' do
      track = create_track_from_file 'flysight.csv'
      track.update!(ff_start: 10, ff_end: 30)
      result = create :event_result, track: track

      expect(result.need_review?).to be_truthy
    end
  end

  it_should_behave_like 'event_ongoing_validation' do
    let(:target) { create :event_result  }
  end
end
