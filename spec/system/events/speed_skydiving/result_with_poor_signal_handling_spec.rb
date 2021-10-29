describe 'Handling recording with poor signal' do
  let(:event) { speed_skydiving_competitions(:nationals) }
  let(:competitor) { speed_skydiving_competition_competitors(:hinton) }

  before { event.place.update!(msl: 472) }

  it 'calculates result after jump range change' do
    sign_in event.responsible
    visit "/events/speed_skydiving/#{event.id}"

    submit_result(competitor, 1, file_fixture('tracks/speed_skydiving_poor_signal.csv'))

    expect(page).to have_css('[title="Calculation error"]')
    find('[title="Calculation error"]').click
    click_button 'Jump Range'

    expect(page).to have_css('[data-test-id="handle-1"]')
    drag_by(find('[data-test-id="handle-1"]'), 575, 0)
    drag_by(find('[data-test-id="handle-0"]'), 620, 0)
    click_button I18n.t('general.save')

    expect(page).to have_css('button', text: '361.91')
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

  def drag_by(element, right, down)
    page.driver.browser.action.drag_and_drop_by(element.native, right, down).perform
  end
end
