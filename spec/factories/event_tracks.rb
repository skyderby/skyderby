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

FactoryGirl.define do
  factory :event_track do
    round
    competitor
    track_from 'existing_track'
    track { FactoryGirl.create :empty_track }
    result { rand(1..1000) }
  end
end
