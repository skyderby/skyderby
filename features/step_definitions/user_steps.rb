# Utility methods
def create_visitor
  @visitor ||= {
    name: 'Testy McUserton',
    email: 'example@example.com',
    password: 'changeme',
    password_confirmation: 'changeme'
  }
end

def delete_user
  @user ||= User.where(email: @visitor[:email]).first
  @user.destroy unless @user.nil?
end

def create_user
  create_visitor
  delete_user
  @user = FactoryGirl.create(:user, @visitor)
end

def sign_in
  visit new_user_session_path
  within 'form#new_user' do
    fill_in 'user_email', with: @visitor[:email]
    fill_in 'user_password', with: @visitor[:password]
    click_button 'Sign in'
  end
end

Given(/^I am not logged in$/) do
  visit root_path
end

Given(/^I am logged in$/) do
  create_user
  sign_in
end

Given(/^I do not exist as a user$/) do
  create_visitor
  delete_user
end

Given(/^I exist as a user$/) do
  create_user
end

When(/^I sign in with valid credentials$/) do
  create_visitor
  sign_in
end

When(/^I sign in with a wrong email$/) do
  @visitor = @visitor.merge(email: 'wrong@example.com')
  sign_in
end

When(/^I sign in with a wrong password$/) do
  @visitor = @visitor.merge(password: 'wrongpass')
  sign_in
end

When(/^I sign out$/) do
  click_link 'Sign out'
end

When(/^I return to the site$/) do
  visit root_path
end

Then(/^I see a successful sign in message$/) do
  page.should have_content 'Signed in successfully.'
end

Then(/^I see an invalid login message$/) do
  page.should have_content 'Invalid email or password.'
end

Then(/^I should see a signed out message$/) do
  page.should have_content 'Signed out successfully.'
end

Then(/^I should be signed in$/) do
  page.should have_content @visitor[:name]
  page.should_not have_content 'Sign up'
  page.should_not have_content 'Log in'
end

Then(/^I should be signed out$/) do
  page.should have_content 'Sign up'
  page.should have_content 'Log in'
  page.should_not have_content 'Logout'
end
