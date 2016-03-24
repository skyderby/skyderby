# == Schema Information
#
# Table name: virtual_comp_groups
#
#  id         :integer          not null, primary key
#  name       :string(255)
#  created_at :datetime
#  updated_at :datetime
#

class VirtualCompGroup < ActiveRecord::Base
  has_many :virtual_competitions

  validates :name, presence: true
end
