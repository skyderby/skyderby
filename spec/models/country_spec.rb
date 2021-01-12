# == Schema Information
#
# Table name: countries
#
#  id   :integer          not null, primary key
#  name :string(510)
#  code :string(510)
#

describe Country do
  it 'requires name' do
    expect(Country.create).not_to be_valid
  end
end
