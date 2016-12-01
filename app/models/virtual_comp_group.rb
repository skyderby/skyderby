# == Schema Information
#
# Table name: virtual_comp_groups
#
#  id         :integer          not null, primary key
#  name       :string(510)
#  created_at :datetime
#  updated_at :datetime
#

class VirtualCompGroup < ApplicationRecord
  has_many :virtual_competitions

  validates :name, presence: true
end
