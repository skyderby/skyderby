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
  enum category: [:competition, :online, :sponsor, :skyderby, :special]
  enum kind: [:gold, :silver, :bronze]

  belongs_to :profile

  validates :name, :category, presence: true
end
