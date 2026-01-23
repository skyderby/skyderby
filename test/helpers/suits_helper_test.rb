require 'test_helper'

class SuitsHelperTest < ActionView::TestCase
  test 'returns suit presentation' do
    suit = create(:suit)
    expected_output = [
      '<span>',
      '<span class="text-warning" data-controller="tooltip">',
      suit.manufacturer.code,
      "<span class=\"for-screen-reader\">#{suit.manufacturer.name}</span>",
      '</span>',
      "&nbsp;#{suit.name}",
      '</span>'
    ].join
    assert_equal expected_output, suit_presentation(suit)
  end
end
