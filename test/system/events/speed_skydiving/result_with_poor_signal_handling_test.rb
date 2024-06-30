require 'application_system_test_case'

class ResultWithPoorSignalHandlingTest < ApplicationSystemTestCase
  def setup
    @event = speed_skydiving_competitions(:nationals)
    @competitor = speed_skydiving_competition_competitors(:hinton)
    @event.place.update!(msl: 472)
  end

  test 'calculates result after jump range change' do
    sign_in @event.responsible
    visit "/events/speed_skydiving/#{@event.id}"

    submit_result(@competitor, 2, file_fixture('tracks/speed_skydiving_poor_signal.csv'))

    assert_selector '[title="Calculation error"]'
    find('[title="Calculation error"]').click
    click_button 'Jump Range'

    assert_selector '[data-test-id="handle-1"]'
    drag_by(find('[data-test-id="handle-1"]'), 575, 0)
    drag_by(find('[data-test-id="handle-0"]'), 620, 0)
    click_button I18n.t('general.save')

    assert_selector 'button', text: '361.91'
  end

  private

  def submit_result(competitor, round, file)
    find(
      :button,
      title: "Submit result for #{competitor.name} in round #{round}",
      visible: false
    ).tap do |button|
      button.hover
      button.click
    end

    find('[type="file"]', visible: false).attach_file file, make_visible: true
    find_button(I18n.t('general.save')).click
  end

  def drag_by(element, right, down)
    page.driver.browser.action.drag_and_drop_by(element.native, right, down).perform
  end
end
