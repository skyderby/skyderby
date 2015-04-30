FactoryGirl.define do
  factory :track_without_place, class: 'Track' do
    kind :skydive #Track.kinds['skydive']
    pilot
    wingsuit

    after(:build) do |track|
      track.stub(:parse_file).and_return true
    end
  end

  factory :track_with_place, class: 'Track' do
    kind Track.kinds['skydive']
    pilot
    wingsuit
    place

    after(:build) do |track|
      track.stub(:parse_file).and_return true
    end
  end
end
