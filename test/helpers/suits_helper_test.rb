require 'test_helper'

class SuitsHelperTest < ActionView::TestCase
  test 'returns suit presentation' do
    suit = create :suit
    assert_equal(
      [
        "<span class=\"text-warning\" data-toggle=\"tooltip\" title=\"#{suit.manufacturer.name}\">",
        suit.manufacturer.code,
        '</span>',
        "<span> #{suit.name}</span>"
      ].join,
      suit_presentation(suit)
    )
  end
end
