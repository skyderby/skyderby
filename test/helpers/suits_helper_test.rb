require 'test_helper'

class SuitsHelperTest < ActionView::TestCase
  test 'returns suit presentation' do
    suit = create(:suit)
    expected_output = [
      "<span class=\"text-warning\" data-toggle=\"tooltip\" title=\"#{suit.manufacturer.name}\">",
      suit.manufacturer.code,
      '</span>',
      "<span> #{suit.name}</span>"
    ].join
    assert_equal expected_output, suit_presentation(suit)
  end
end
