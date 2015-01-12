class Manufacturer < ActiveRecord::Base
  has_many :wingsuits
  validates_presence_of :name
end
