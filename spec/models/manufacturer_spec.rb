# == Schema Information
#
# Table name: manufacturers
#
#  id   :integer          not null, primary key
#  name :string(510)
#  code :string(510)
#

require 'spec_helper'

describe Manufacturer, type: :model do
  it 'name is required' do
    expect(Manufacturer.create).not_to be_valid
  end
end
