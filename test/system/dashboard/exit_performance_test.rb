require 'application_system_test_case'

class ExitPerformanceTest < ApplicationSystemTestCase
  setup do
    sign_in users(:regular_user)
  end

  test 'renders a series per suit on the BASE dashboard' do
    create_performance(suits(:apache), 0.9)
    create_performance(suits(:nala), 1.1)

    visit root_path(mode: 'base')

    assert_selector '.exit-performance__series', count: 2
    assert_selector '.exit-performance__line--median', count: 2
    assert_selector '.exit-performance__line--flat', count: 2
    assert_selector '.exit-performance__band--outer', count: 2
  end

  test 'legend hides a series' do
    create_performance(suits(:apache), 0.9)
    create_performance(suits(:nala), 1.1)

    visit root_path(mode: 'base')
    assert_selector '.exit-performance__line--median', count: 2
    page.execute_script("document.querySelector('.exit-performance__toggle').click()")

    assert_selector '.exit-performance__line--median', count: 1
  end

  test 'shows a blankslate until a suit has enough jumps' do
    visit root_path(mode: 'base')

    assert_selector '.exit-performance .dashboard-blankslate'
    assert_no_selector '.exit-performance__plot'
  end

  test 'draws the selected terrain profile' do
    create_performance(suits(:apache), 0.9)

    visit root_path(mode: 'base')
    assert_no_selector '.exit-performance__terrain-line'

    select_terrain(terrain_profiles(:hellesylt_steep))

    assert_selector '.exit-performance__terrain-line'
    assert_selector '.exit-performance__terrain-area'
  end

  private

  def select_terrain(terrain_profile)
    page.execute_script(<<~JS, terrain_profile.id)
      const select = document.getElementById('terrain_profile_id')
      select.innerHTML = `<option value="${arguments[0]}"></option>`
      select.value = arguments[0]
      select.dispatchEvent(new Event('change', { bubbles: true }))
    JS
  end

  def create_performance(suit, glide_ratio)
    samples = Track::ExitProfile.drops.map do |drop|
      distance = drop * glide_ratio
      {
        drop:,
        low: (distance * 0.85).round(1),
        q1: (distance * 0.93).round(1),
        mid: distance.round(1),
        q3: (distance * 1.07).round(1),
        high: (distance * 1.15).round(1),
        flat: (distance * 1.2).round(1)
      }
    end

    Profile::ExitPerformance.create!(
      profile_id: profiles(:regular_user).id, suit:, tracks_count: 12,
      samples:, last_recorded_at: Time.current
    )
  end
end
