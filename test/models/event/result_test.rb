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
  it 'rounds result correctly' do
    result = event_results(:distance_competitor_1)
    result.result = 266.3477
    result.save!

    expect(result.reload.result.round(1)).to eq(266.3)
  end

  it_should_behave_like 'event_ongoing_validation' do
    let(:target) { create :event_result }
  end
end
