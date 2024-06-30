require 'application_system_test_case'

class TracksVisibilityTest < ApplicationSystemTestCase
  def setup
    @event = speed_skydiving_competitions(:nationals)
    @competitor = speed_skydiving_competition_competitors(:hinton)
  end

  test 'new upload is public for public event' do
    @event.public_event!
    sign_in users(:event_responsible)
    visit "/events/speed_skydiving/#{@event.id}"

    assert_selector 'h2', text: @event.name.upcase

    submit_result(@competitor, 2, file_fixture('tracks/speed_skydiving_411.csv'))

    assert_selector 'button', text: '411.71'

    result = @event.results.find_by \
      competitor: @competitor,
      round: speed_skydiving_competition_rounds(:nationals_round_1)

    assert_equal 'public_track', result.track.visibility
  end

  test 'new upload is unlisted for unlisted event' do
    @event.unlisted_event!
    sign_in users(:event_responsible)

    visit "/events/speed_skydiving/#{@event.id}"
    assert_selector 'h2', text: @event.name.upcase

    submit_result(@competitor, 2, file_fixture('tracks/speed_skydiving_411.csv'))

    assert_selector 'button', text: '411.71'

    result = @event.results.find_by \
      competitor: @competitor,
      round: speed_skydiving_competition_rounds(:nationals_round_1)

    assert_equal 'unlisted_track', result.track.visibility
  end

  test 'new upload is unlisted for private event' do
    @event.private_event!
    sign_in users(:event_responsible)

    visit "/events/speed_skydiving/#{@event.id}"
    assert_selector 'h2', text: @event.name.upcase

    submit_result(@competitor, 2, file_fixture('tracks/speed_skydiving_411.csv'))

    assert_selector 'button', text: '411.71'

    result = @event.results.find_by \
      competitor: @competitor,
      round: speed_skydiving_competition_rounds(:nationals_round_1)

    assert_equal 'unlisted_track', result.track.visibility
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
end
