describe 'Events - Speed Skydiving' do
  let(:event) { speed_skydiving_competitions(:nationals) }

  describe 'Initial track visibility' do
    let(:competitor) { speed_skydiving_competition_competitors(:hinton) }

    it 'new upload is public for public event' do
      event.public_event!

      sign_in users(:event_responsible)
      visit "/events/speed_skydiving/#{event.id}"
      submit_result(competitor, 2, file_fixture('tracks/speed_skydiving_411.csv'))

      expect(page).to have_css('button', text: '411.71')

      result = event.results.find_by \
        competitor: competitor,
        round: speed_skydiving_competition_rounds(:nationals_round_1)

      expect(result.track.public_track?).to be_truthy
    end

    it 'new upload is unlisted for unlisted event' do
      event.unlisted_event!

      sign_in users(:event_responsible)
      visit "/events/speed_skydiving/#{event.id}"
      submit_result(competitor, 2, file_fixture('tracks/speed_skydiving_411.csv'))

      expect(page).to have_css('button', text: '411.71')

      result = event.results.find_by \
        competitor: competitor,
        round: speed_skydiving_competition_rounds(:nationals_round_1)

      expect(result.track.unlisted_track?).to be_truthy
    end

    it 'new upload is unlisted for private event' do
      event.private_event!

      sign_in users(:event_responsible)
      visit "/events/speed_skydiving/#{event.id}"
      submit_result(competitor, 2, file_fixture('tracks/speed_skydiving_411.csv'))

      expect(page).to have_css('button', text: '411.71')

      result = event.results.find_by \
        competitor: competitor,
        round: speed_skydiving_competition_rounds(:nationals_round_1)

      expect(result.track.unlisted_track?).to be_truthy
    end
  end

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
