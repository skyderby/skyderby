# == Schema Information
#
# Table name: manufacturers
#
#  id   :integer          not null, primary key
#  name :string(510)
#  code :string(510)
#

class Manufacturer < ApplicationRecord
  has_many :wingsuits
  validates :name, presence: true
  validates :code, uniqueness: true
end
