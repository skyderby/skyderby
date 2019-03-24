FactoryBot.define do
  factory :track_video do
    url { 'https://youtu.be/uB-t25F1I8g' }
    video_offset { 3 }
    track_offset { 3 }
    association :track, factory: :empty_track
  end
end
