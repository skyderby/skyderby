require 'application_system_test_case'

class SuitComparisonTest < ApplicationSystemTestCase
  setup do
    sign_in users(:regular_user)
    create_performance(suits(:apache), 1.0)
    create_performance(suits(:nala), 1.3)
  end

  test 'adds a suit to the comparison from the modal' do
    visit suit_path(suits(:apache), query: { kind: :base })
    assert_selector '.exit-performance__line--median', count: 1

    click_on I18n.t('suits.comparison.add')
    fill_in 'term', with: 'Nala'
    click_on 'Nala'

    assert_selector '.exit-performance__line--median', count: 2
    assert_selector '.exit-performance__series', text: /Nala/i
  end

  test 'removes a suit from the comparison' do
    visit suit_path(suits(:apache), query: { kind: :base }, compare: [suits(:nala).id])
    assert_selector '.exit-performance__line--median', count: 2

    find('.exit-performance__remove').click

    assert_selector '.exit-performance__line--median', count: 1
  end

  private

  def create_performance(suit, glide_ratio)
    samples = Track::ExitProfile.drops.map do |drop|
      distance = drop * glide_ratio
      { drop:, low: (distance * 0.8).round(1), q1: (distance * 0.9).round(1),
        mid: distance.round(1), q3: (distance * 1.1).round(1),
        high: (distance * 1.2).round(1), flat: (distance * 1.25).round(1) }
    end

    Suit::ExitPerformance.create!(suit:, pilots_count: 17, jumps_count: 342, samples:)
  end
end
