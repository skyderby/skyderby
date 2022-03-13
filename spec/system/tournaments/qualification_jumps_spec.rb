feature 'Qualification jumps', type: :system, js: true do
  scenario 'add and score qualification jump' do
    sign_in users(:regular_user)

    tournament = tournaments(:qualification_loen)

    visit tournament_qualification_path(tournament)
    find('.scoreboard-result').click

    expect(page).to have_css '.modal-dialog'

    file = file_fixture('tracks/loen_jump_one_08-02-19.CSV')
    attach_file 'result[track_attributes][file]', file, make_visible: true

    click_button I18n.t('general.save')

    fill_in 'result_start_time', with: '2017-06-05 08:03:17.400'

    click_button I18n.t('general.save')

    expect(page).to have_content('34.716')
  end
end
