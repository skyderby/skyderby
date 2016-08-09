# == Schema Information
#
# Table name: tracks
#
#  id                :integer          not null, primary key
#  name              :string(510)
#  created_at        :datetime
#  lastviewed_at     :datetime
#  suit              :string(510)
#  comment           :text
#  location          :string(510)
#  user_id           :integer
#  kind              :integer          default(0)
#  wingsuit_id       :integer
#  ff_start          :integer
#  ff_end            :integer
#  ge_enabled        :boolean          default(TRUE)
#  visibility        :integer          default(0)
#  profile_id        :integer
#  place_id          :integer
#  gps_type          :integer          default(0)
#  file_file_name    :string(510)
#  file_content_type :string(510)
#  file_file_size    :integer
#  file_updated_at   :datetime
#  track_file_id     :integer
#  ground_level      :integer          default(0)
#  recorded_at       :datetime
#

FactoryGirl.define do
  factory :empty_track, class: 'Track' do
    kind Track.kinds['skydive']
    pilot
    wingsuit

    trait :with_place do
      association :place, factory: [:place, :gridset]
    end

    after(:build) do |track|
      track.stub(:parse_file).and_return true
    end
  end
end
