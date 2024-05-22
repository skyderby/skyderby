describe 'Changing Speed Skydiving event status' do
  let(:event) { speed_skydiving_competitions(:nationals) }

  it 'with valid values' do
    sign_in event.responsible
    event.draft!
    visit "/events/speed_skydiving/#{event.id}"

    expect(page).to have_css('h2', text: event.name.upcase)

    click_button status_button_text('draft')

    click_button I18n.t('event_status.finished')

    expect(page).to have_css('button', text: status_button_text('finished'))
    expect(event.reload.status).to eq('finished')
  end

  def status_button_text(status)
    "#{I18n.t('activerecord.attributes.event.status')}: #{I18n.t("event_status.#{status}")}"
  end
end
