# == Schema Information
#
# Table name: manufacturers
#
#  id   :integer          not null, primary key
#  name :string(510)
#  code :string(510)
#

class Manufacturer < ActiveRecord::Base
  has_many :wingsuits
  validates_presence_of :name
end
