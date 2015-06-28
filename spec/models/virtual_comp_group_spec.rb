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
  pending "add some examples to (or delete) #{__FILE__}"
end
