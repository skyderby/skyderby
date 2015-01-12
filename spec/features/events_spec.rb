require 'spec_helper'
include Warden::Test::Helpers

describe 'Events:', type: :feature do
  before :all do
    Warden.test_mode!
    user = FactoryGirl.create(:user)
    login_as(user, scope: :user)
  end

  it 'able to create' do
    visit events_path
    click_link('Создать событие')
    expect(current_path).to eql(event_path(id: 1, locale: 'ru'))
  end

  it 'able to create classes' do
    pending 'write test'
  end

  it 'able to create competitors' do
    pending 'write test'
  end

  it 'able to create rounds' do
    pending 'write test'
  end
end
