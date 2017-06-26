feature 'Profiles index' do
  scenario 'it not show for guests' do
    visit profiles_path

    expect(page).to have_css('div.alert', text: 'You are not authorized to access this page')
  end

  scenario 'it shows list for admins' do
    sign_in_as_admin
    visit profiles_path

    expect(page).to have_content('Профили')
  end
end
