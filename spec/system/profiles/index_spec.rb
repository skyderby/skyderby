feature 'Profiles index', type: :system do
  scenario 'it not show for guests' do
    visit profiles_path

    expect(page).to have_css('div.alert', text: 'You are not authorized to access this page')
  end

  scenario 'it shows list for admins' do
    admin_user = create :user, :admin
    sign_in admin_user

    visit profiles_path

    expect(page).to have_content('Профили')
  end
end
