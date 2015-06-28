# == Schema Information
#
# Table name: countries
#
#  id   :integer          not null, primary key
#  name :string(255)
#  code :string(255)
#

require 'spec_helper'

RSpec.describe Country, type: :model do
  it 'requires name' do
    expect(Country.create).not_to be_valid
  end
end
