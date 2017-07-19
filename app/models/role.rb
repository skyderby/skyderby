# == Schema Information
#
# Table name: roles
#
#  id   :integer          not null, primary key
#  name :string(510)
#

class Role < ApplicationRecord
  has_many :assignments
  has_many :users, through: :assignments
  validates :name, uniqueness: true

  def self.admin
    find_by(name: 'admin')
  end
end
