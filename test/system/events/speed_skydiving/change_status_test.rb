require 'application_system_test_case'

class ChangeStatusTest < ApplicationSystemTestCase
  def setup
    @event = speed_skydiving_competitions(:nationals)
  end

  test 'with valid values' do
    sign_in @event.responsible
    @event.draft!
    visit "/events/speed_skydiving/#{@event.id}"

    assert_selector 'h2', text: @event.name.upcase

    click_button status_button_text('draft')

    click_button I18n.t('event_status.finished')

    assert_selector 'button', text: status_button_text('finished')
    assert_equal 'finished', @event.reload.status
  end

  private

  def status_button_text(status)
    "#{I18n.t('activerecord.attributes.event.status')}: #{I18n.t("event_status.#{status}")}"
  end
end
