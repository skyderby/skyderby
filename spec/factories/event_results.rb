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

FactoryBot.define do
  factory :event_result, class: Event::Result do
    round factory: 'event_round'
    competitor factory: 'event_competitor'
    track_from { 'existing_track' }
    track { FactoryBot.create :empty_track }
    result { rand(1..1000) }
  end
end
