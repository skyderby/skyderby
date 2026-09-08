require 'application_system_test_case'

class ProViewTest < ApplicationSystemTestCase
  setup do
    @user = users(:regular_user)
    GiftedSubscription.create!(user: @user, expires_at: 1.day.from_now, reason: 'test')
    sign_in @user
    upload_track 'flysight.csv'
    @track = Track.last
  end

  test 'skydive pro view renders segments, playback and units switch' do
    assert_selector '.sps-seg', minimum: 1
    assert_selector '.sps-entry [data-slot="topSpeed"]', text: /\d+/
    assert_selector '.sps-seg [data-slot="distance"]', text: /\d+/

    seek_slider 'tracks--skydive-performance-track', 0
    within '[data-tracks--skydive-performance-track-target="playbackIndicators"]' do
      assert_selector '[data-playback-indicators-target="altitude"]', text: /\d+/
    end

    altitude_before = playback_altitude
    seek_slider 'tracks--skydive-performance-track', 0.5
    assert_not_equal altitude_before, playback_altitude

    find('.actions-bar-button[popovertarget="skydive-performance-charts-menu"]').click
    click_button I18n.t('tracks.show.m_units_imperial')

    within '[data-tracks--skydive-performance-track-target="playbackIndicators"]' do
      assert_selector '[data-unit="length"]', text: I18n.t('units.ft')
    end
    assert_selector '.sps-seg [data-slot="lengthUnit"]', text: I18n.t('units.ft')
    assert_equal 'imperial', User::Setting.find_by!(user: @user).default_units

    find('[data-action="tracks--compare-modal#open"]').click
    assert_selector 'dialog.comparison-dialog[open]'
  end

  test 'base jump pro view renders summary tiles and playback' do
    @track.update!(kind: :base)
    visit track_path(@track)

    assert_selector '.base-jump-summary [data-summary-tile="glide"] [data-slot="value"]', text: /\d/
    assert_selector '.base-jump-summary [data-summary-tile="first_drop"] .bjs-hist__row', minimum: 1

    seek_slider 'tracks--base-jump-track', 0.5
    within '[data-tracks--base-jump-track-target="playbackIndicators"]' do
      assert_selector '[data-playback-indicators-target="altitude"]', text: /\d+/
      assert_selector '[data-playback-indicators-target="altitudeSpent"]', text: /\d+/
    end
  end

  private

  def seek_slider(controller, ratio)
    execute_script(<<~JS)
      const slider = document.querySelector('[data-#{controller}-target="playbackSlider"]')
      slider.value = Math.floor(slider.max * #{ratio})
      slider.dispatchEvent(new Event('input', { bubbles: true }))
    JS
  end

  def playback_altitude
    within '[data-tracks--skydive-performance-track-target="playbackIndicators"]' do
      find('[data-playback-indicators-target="altitude"]').text
    end
  end

  def upload_track(file_name)
    visit root_path
    click_button I18n.t('application.header.upload_track')
    assert_selector '.dialog-title', text: I18n.t('static_pages.index.track_form.title')

    within 'form.sd-form' do
      click_link I18n.t('tracks.form.toggle_suit_link')
      fill_in 'track_file[track_attributes][missing_suit_name]', with: 'Horus'
      fill_in 'track_file[track_attributes][location]', with: 'Africa'
      attach_file 'track_file[file]', file_fixture("tracks/#{file_name}"), make_visible: true
      click_button I18n.t('static_pages.index.track_form.submit')
    end

    assert_selector 'a.page-tab-active', text: I18n.t('tracks.show.charts').upcase, wait: 60
  end
end
