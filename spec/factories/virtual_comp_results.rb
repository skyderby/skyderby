FactoryGirl.define do
  factory :virtual_comp_result do
    virtual_competition
    association :track, factory: :empty_track
  end
end
