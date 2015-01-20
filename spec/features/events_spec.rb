require 'spec_helper'
include Warden::Test::Helpers
Warden.test_mode!

feature 'Events' do
  context 'when logged as an organizer' do
    before :all do
      @user = FactoryGirl.create(:user)
      @event = Event.create!(responsible: @user.user_profile)

      login_as(@user, scope: :user)
    end

    it 'able to create' do
      visit events_path
      expect(page).to have_content('Создать событие')
    end

    it 'able to manage own events', js: true do
      sign_in @user
      visit event_path(id: @event.id)
      can_manage = find('.event-data', visible: false)['data-can-manage']
      expect(can_manage).to eq('true')
    end

    it 'able to create classes', js: true do
      sign_in @user
      visit event_path(id: 1)
      find('#button-add-class').click
      within '#section-form' do
        fill_in 'section-name', with: 'Advanced'
      end
      find('#submit-section-form').click
      expect(page).to have_content('Advanced')
    end

    it 'able to create competitors' do
      pending 'write test'
    end

    it 'able to create rounds' do
      pending 'write test'
    end
  end
end
