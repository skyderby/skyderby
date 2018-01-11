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

require 'rails_helper'
require 'support/event_ongoing_validation'

RSpec.describe EventTrack, type: :model do
  it_should_behave_like 'event_ongoing_validation' do
    let(:target) { FactoryBot.create(:event_track) }
  end
end
