# == Schema Information
#
# Table name: virtual_comp_groups
#
#  id                    :integer          not null, primary key
#  name                  :string(255)
#  created_at            :datetime
#  updated_at            :datetime
#  display_on_start_page :boolean          default(FALSE)
#

require 'rails_helper'

RSpec.describe VirtualCompGroup, type: :model do
  it 'requires name' do
    expect(VirtualCompGroup.create).not_to be_valid
  end
end
