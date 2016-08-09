# == Schema Information
#
# Table name: sections
#
#  id       :integer          not null, primary key
#  name     :string(510)
#  order    :integer
#  event_id :integer
#

require 'spec_helper'
require 'support/event_ongoing_validation'

RSpec.describe Section, type: :model do
  it_should_behave_like 'event_ongoing_validation' do
    let(:target) { FactoryGirl.create(:section) }
  end
end
