require 'application_system_test_case'

class Tracks::FiltersTest < ApplicationSystemTestCase
  test 'Filter by suit' do
    3.times do |x|
      suit = create :suit, name: "suit-#{x}"
      create :empty_track, suit: suit
    end
    visit tracks_path

    hot_select('suit-1', from: :suit_id)

    assert_selector('#tracks-table > .tbody > .tracks-item', count: 1)
    assert_selector('#tracks-table > .tbody > .tracks-item > .tracks-item-suit', text: 'suit-1')
  end
end
