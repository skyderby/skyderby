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

class VirtualCompGroup < ActiveRecord::Base
  has_many :virtual_competitions
end
