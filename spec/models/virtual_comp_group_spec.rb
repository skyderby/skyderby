# == Schema Information
#
# Table name: virtual_comp_groups
#
#  id         :integer          not null, primary key
#  name       :string(510)
#  created_at :datetime
#  updated_at :datetime
#

RSpec.describe VirtualCompGroup, type: :model do
  it 'requires name' do
    expect(VirtualCompGroup.create).not_to be_valid
  end
end
