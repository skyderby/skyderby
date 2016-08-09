# == Schema Information
#
# Table name: countries
#
#  id   :integer          not null, primary key
#  name :string(510)
#  code :string(510)
#

require 'spec_helper'

RSpec.describe Country, type: :model do
  it 'requires name' do
    expect(Country.create).not_to be_valid
  end
end
