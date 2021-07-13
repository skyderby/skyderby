feature 'Masquerading', type: :system, skip: true do
  scenario 'Admin can masquerade as another user' do
    admin = create :user, :admin
    user  = create :user

    sign_in admin
    visit profile_path(user.profile)
    click_link 'Masquerade'

    expect(page).to have_content('Now masquerading as')
  end
end
