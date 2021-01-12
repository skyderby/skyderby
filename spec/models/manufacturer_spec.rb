# == Schema Information
#
# Table name: manufacturers
#
#  id   :integer          not null, primary key
#  name :string(510)
#  code :string(510)
#

describe Manufacturer do
  it 'name is required' do
    expect(Manufacturer.create).not_to be_valid
  end
end
