require 'application_system_test_case'

class SuitExitPerformanceTest < ApplicationSystemTestCase
  setup do
    sign_in users(:regular_user)
  end

  test 'shows the suit exit profile in the BASE tab' do
    performance = create_performance

    visit suit_path(suits(:apache), query: { kind: :base })

    assert_selector '.exit-performance__line--median', count: 1
    assert_selector '.exit-performance__line--flat', count: 1
    assert_text I18n.t('suits.exit_performance.pilots', count: performance.pilots_count)
  end

  test 'hides the card until the suit has any data' do
    visit suit_path(suits(:apache), query: { kind: :base })

    assert_no_selector '.exit-performance'
  end

  private

  def create_performance
    samples = Track::ExitProfile.drops.map do |drop|
      distance = drop * (1 - (Math.exp(-drop / 60.0) * 0.55))
      { drop:, low: (distance * 0.7).round(1), q1: (distance * 0.88).round(1),
        mid: distance.round(1), q3: (distance * 1.12).round(1),
        high: (distance * 1.35).round(1), flat: (distance * 1.3).round(1) }
    end

    Suit::ExitPerformance.create!(suit: suits(:apache), pilots_count: 17, jumps_count: 342, samples:)
  end
end
