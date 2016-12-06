# == Schema Information
#
# Table name: badges
#
#  id         :integer          not null, primary key
#  name       :string(510)
#  kind       :integer
#  profile_id :integer
#  created_at :datetime
#  updated_at :datetime
#

class Badge < ApplicationRecord
  enum kind: [:gold, :silver, :bronze]

  belongs_to :profile

  validates_presence_of :name, :kind
end
