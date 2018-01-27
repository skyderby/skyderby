feature 'Qualification jumps', type: :system, js: true do
  scenario 'add and score qualification jump' do
    user = create :user
    sign_in user

    tournament = create_tournament(responsible: user.profile)
    create :qualification_round, tournament: tournament
    create :tournament_competitor, tournament: tournament

    visit tournament_qualification_path(tournament)
    find('a.create-result-cell__link').click

    expect(page).to have_content('Qualification Jump')

    file = Rails.root.join('spec', 'support', 'tracks', 'loen_jump_one_08-02-19.CSV')
    page.execute_script("$('#qualification_jump_track_attributes_file').css({opacity: 100})")
    attach_file 'qualification_jump[track_attributes][file]', file

    click_button I18n.t('general.save')

    fill_in 'qualification_jump_start_time', with: '2017-06-05 08:03:17.400'

    click_button I18n.t('general.save')

    expect(page).to have_content('34.716')
    page.save_screenshot(Rails.root.join('tmp', 'page.png'))
  end

  def create_tournament(responsible:)
    @tournament ||= create(
      :tournament,
      responsible: responsible,
      has_qualification: true,
      exit_lat: 61.88504129,
      exit_lon: 6.83213621,
      finish_start_lat: 61.873144426,
      finish_start_lon: 6.8371879648,
      finish_end_lat: 61.8743634807,
      finish_end_lon: 6.8443581779
    )
  end
end
