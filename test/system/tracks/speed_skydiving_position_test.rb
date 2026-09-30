require 'application_system_test_case'

class SpeedSkydivingPositionTest < ApplicationSystemTestCase
  test 'position series is shown with the switch and the choice is remembered' do
    track = create_track_from_file('speed_skydiving_411.csv', kind: :speed_skydiving, suit: nil)
    attach_sensor_data(track) { [0.0, 0.0, 1.0] }
    position = I18n.t('tracks.speed_pro.metrics.position')

    visit track_path(track)
    assert_selector '.speed-skydiving-chart .highcharts-root', wait: 30
    assert_no_selector '.highcharts-legend-item', text: position

    find('.switch-label', text: position).click
    assert_selector '.highcharts-legend-item', text: position

    visit track_path(track)
    assert_selector '.highcharts-legend-item', text: position, wait: 30
  end
end
