require 'test_helper'

class SuitTest < ActiveSupport::TestCase
  setup do
    @manufacturer = create(:manufacturer, name: 'Phoenix Fly')
    @suit = create(:suit, name: 'Ghost 3')
  end

  test 'validations' do
    assert_not_predicate Suit.create(name: 'CR+'), :valid?
    assert_not_predicate Suit.create(manufacturer: @manufacturer), :valid?
  end

  test '#search by manufacturer' do
    assert_includes Suit.search('pho'), @suit
  end

  test 'performs search by name' do
    assert_includes Suit.search('st'), @suit
  end
end
