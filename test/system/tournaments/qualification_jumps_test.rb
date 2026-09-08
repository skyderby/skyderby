require 'application_system_test_case'

class QualificationJumpsTest < ApplicationSystemTestCase
  test 'add and score qualification jump' do
    sign_in users(:regular_user)

    tournament = tournaments(:qualification_loen)

    visit tournament_qualification_path(tournament)
    find('td.result-cell button').click

    assert_selector 'dialog'

    file = file_fixture('tracks/loen_jump_one_08-02-19.CSV')
    attach_file 'result[track_attributes][file]', file, make_visible: true

    click_button I18n.t('general.save')

    fill_in 'jump_range_start_time', with: '2017-06-05 08:03:17.400'

    click_button I18n.t('general.save')

    assert_text '34.716'

    find('td.result-cell', text: '34.716').click

    assert_selector '[data-tournaments--result-track-target="sideProjection"] svg'
    assert_selector '[data-tournaments--result-track-target="maxHSpeed"]', text: /\d+/

    execute_script(<<~JS)
      const slider = document.querySelector('[data-tournaments--result-track-target="playbackSlider"]')
      slider.value = Math.floor(slider.max / 2)
      slider.dispatchEvent(new Event('input', { bubbles: true }))
    JS

    within '[data-tournaments--result-track-target="playbackIndicators"]' do
      assert_selector '[data-playback-indicators-target="altitude"]', text: /\d+/
      assert_selector '[data-playback-indicators-target="altitudeSpent"]', text: /\d+/
    end
  end
end
