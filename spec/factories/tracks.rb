FactoryGirl.define do
  factory :empty_track, class: 'Track' do
    kind Track.kinds['skydive']
    pilot
    wingsuit

    trait :with_place do
      place
    end

    after(:build) do |track|
      track.stub(:parse_file).and_return true
    end
  end
end
