# == Schema Information
#
# Table name: countries
#
#  id   :integer          not null, primary key
#  name :string(255)
#  code :string(255)
#

class Country < ActiveRecord::Base
  has_many :places

  validates :name, presence: true
end
