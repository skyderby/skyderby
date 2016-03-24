# == Schema Information
#
# Table name: events
#
#  id                :integer          not null, primary key
#  name              :string(255)
#  range_from        :integer
#  range_to          :integer
#  created_at        :datetime
#  updated_at        :datetime
#  status            :integer          default(0)
#  user_profile_id   :integer
#  place_id          :integer
#  is_official       :boolean          default(FALSE)
#  rules             :integer          default(0)
#  starts_at         :date
#  wind_cancellation :boolean          default(FALSE)
#

require 'spec_helper'
require 'rails_helper'

describe Event, type: :model do
  before :all do
    @user = FactoryGirl.create(:user)
    @event = Event.create!(responsible: @user.user_profile, starts_at: Date.today)
  end

  it 'has status: Draft' do
    expect(@event.status).to eql 'draft'
  end

  it 'generate name if not specified' do
    expect(@event.name).to be_present
  end

  it 'fill range if not specified' do
    expect(@event.range_from).to be_present
    expect(@event.range_to).to be_present
  end

  it 'fill responsible' do
    expect(@event.responsible).to eql(@user.user_profile)
  end

  it 'blank responsible does not allowed' do
    expect(Event.create(responsible: nil)).not_to be_valid
  end
end
