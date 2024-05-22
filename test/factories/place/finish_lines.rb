FactoryBot.define do
  factory :place_finish_line, class: Place::FinishLine do
    name { 'Finish line' }
    start_latitude { '62.5203062' }
    start_longitude { '7.5773933' }
    end_latitude { '62.5203062' }
    end_longitude { '7.5773933' }
    place
  end
end
