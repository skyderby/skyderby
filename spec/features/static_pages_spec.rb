require 'spec_helper'

describe 'Registration & permissions', :type => :feature do

  before(:all) do
    FactoryGirl.create(:user_role)
    FactoryGirl.create(:admin_role)
    FactoryGirl.create(:create_events_role)
  end

  it 'register me' do
    visit root_path
    click_link 'Зарегистрироваться'

    @user = FactoryGirl.build(:user)

    within '#new_user' do
      fill_in 'Email', :with => @user.email
      fill_in 'Password', :with => @user.password
      fill_in 'Password confirmation', :with => @user.password_confirmation

      expect { click_button 'Sign up' }.to change(User, :count).by(1)
    end

    expect(page).to have_content ('Добро пожаловать! Вы успешно зарегистрировались.')

  end

  it 'create profile' do
    @user = User.find 1
    expect(@user.user_profile.present?).to be_truthy
  end

  it 'give me right permissions' do
    @user = User.find 1
    expect(@user.has_role?(:user)).to be_truthy
    expect(@user.has_role?(:create_events)).to be_falsey
    expect(@user.has_role?(:admin)).to be_falsey
  end

  it 'logged me in' do

  end

end
